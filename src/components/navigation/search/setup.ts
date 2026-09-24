// The `/pagefind/` index only exists on built sites; in `astro dev` run `npm run search:dev`
// or the modal shows its index-unavailable notice.

import { getInstanceManager } from "@pagefind/component-ui";
import pagefindStylesUrl from "@pagefind/component-ui/css/pagefind-component-ui.css?url";

import { setupModalShell } from "../../building-blocks/wrappers/modal/setup";

let stylesRequested = false;
let keyboardShortcutBound = false;
let errorHookBound = false;
let countsHookBound = false;

// Layered `@import`, not a <link>: an unlayered sheet would beat the overrides in `Search.astro`.
function loadPagefindStyles(): void {
  if (stylesRequested) return;
  stylesRequested = true;

  const style = document.createElement("style");

  style.textContent = `@import url("${pagefindStylesUrl}") layer(pagefind);`;
  document.head.appendChild(style);
}

function currentSearchPopover(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".search .modal-popover");
}

// Bound once, resolving the popover at event time, so view transitions can't stack listeners on detached DOM.
function bindKeyboardShortcut(): void {
  if (keyboardShortcutBound) return;
  keyboardShortcutBound = true;

  document.addEventListener("keydown", (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
    if (e.key.toLowerCase() !== "k") return;

    loadPagefindStyles();

    const popover = currentSearchPopover();

    if (!popover) return;
    e.preventDefault();

    if (popover.matches(":popover-open")) {
      popover.hidePopover();
    } else {
      popover.showPopover();
    }
  });
}

type PagefindResult = {
  url?: string;
  excerpt?: string;
  meta?: Record<string, string>;
};

type PagefindSearchResponse = {
  totalFilters?: Record<string, Record<string, number>>;
  unfilteredTotalCount?: number;
};

// Key "" is the All tab; `null` empties the badges (CSS hides empty ones).
function applyTabCounts(counts: Record<string, number> | null): void {
  document.querySelectorAll<HTMLElement>("[data-search-tab]").forEach((tab) => {
    const inner = tab.querySelector(".button-inner") ?? tab;
    let badge = inner.querySelector(".search-tab-count");

    if (!badge) {
      badge = document.createElement("span");
      badge.className = "search-tab-count";
      inner.appendChild(badge);
    }

    badge.textContent = counts ? String(counts[tab.dataset.searchTab || ""] ?? 0) : "";
  });
}

function bindResultTemplate(search: HTMLElement): void {
  const results = search.querySelector<
    HTMLElement & { resultTemplate?: (_result: PagefindResult) => Node | string }
  >("pagefind-results");
  const template = search.querySelector<HTMLTemplateElement>("template.search-result-template");

  if (!results || !template) return;

  results.resultTemplate = (result) => {
    const item = template.content.firstElementChild?.cloneNode(true) as HTMLElement | null;

    if (!item) return "";

    const meta = result.meta ?? {};
    const url = meta.url || result.url || "";
    const link = item.querySelector<HTMLAnchorElement>(".search-result-link");

    if (link) {
      if (url && !/^\s*javascript:/i.test(url)) link.href = url;

      const title = link.querySelector(".heading-inner") ?? link;

      title.textContent = meta.title || "Untitled";
    }

    const media = item.querySelector(".search-result-media");
    const image = media?.querySelector("img");

    if (media && image && meta.image) {
      // Indexed /_astro/ URLs 404 on the dev server.
      image.addEventListener("error", () => media.remove(), { once: true });

      try {
        image.src = new URL(meta.image, new URL(url, window.location.href)).toString();
      } catch {
        image.src = meta.image;
      }
      image.alt = meta.image_alt || meta.title || "";
    } else {
      media?.remove();
    }

    const lead = item.querySelector(".search-result-lead");

    if (lead && meta.published) {
      const target = lead.querySelector(".simple-text-inner") ?? lead;

      target.textContent = [meta.published, meta.author].filter(Boolean).join(" · ");
    } else {
      lead?.remove();
    }

    const excerpt = item.querySelector(".search-result-excerpt");

    if (excerpt && result.excerpt) {
      // innerHTML keeps Pagefind's <mark>s; trusted only because the index is this site's own pages.
      (excerpt.querySelector(".simple-text-inner") ?? excerpt).innerHTML = result.excerpt;
    } else {
      excerpt?.remove();
    }

    return item;
  };
}

export function setupSearch(search: HTMLElement): void {
  if (search.hasAttribute("data-search-initialized")) return;
  search.setAttribute("data-search-initialized", "");

  const popover = search.querySelector<HTMLElement>(".modal-popover");

  if (!popover) return;

  setupModalShell(popover);
  bindKeyboardShortcut();

  // Stops Pagefind's Escape handler clearing the query; the popover still closes (its close watcher ignores propagation).
  popover.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") e.stopPropagation();
    },
    true
  );

  const instance = getInstanceManager().getInstance("default");

  // Assign directly: a trigger* call would load the wasm bundle on every page view.
  instance.searchFilters = {};

  if (!errorHookBound) {
    errorHookBound = true;
    instance.on("error", () => {
      document
        .querySelectorAll<HTMLElement>(".search")
        .forEach((el) => el.setAttribute("data-search-unavailable", ""));
    });
  }

  // Clearing the query dispatches results with no totalFilters; empty the badges rather than show zeros.
  if (!countsHookBound) {
    countsHookBound = true;
    instance.on("results", (result) => {
      if (!instance.searchTerm.trim()) {
        applyTabCounts(null);

        return;
      }

      const { totalFilters, unfilteredTotalCount } = (result ?? {}) as PagefindSearchResponse;
      const typeCounts = totalFilters?.Type ?? {};
      const all = unfilteredTotalCount ?? Object.values(typeCounts).reduce((sum, n) => sum + n, 0);

      applyTabCounts({ "": all, ...typeCounts });
    });
  }

  popover.addEventListener("toggle", (e) => {
    if ((e as ToggleEvent).newState === "open") {
      loadPagefindStyles();
      instance.triggerLoad().catch(() => {});
    }
  });

  const trigger = search.querySelector<HTMLElement>(".search-trigger");

  trigger?.addEventListener("pointerenter", loadPagefindStyles, { once: true });
  trigger?.addEventListener("focusin", loadPagefindStyles, { once: true });

  // `data-search-tab` is on the outer `.button` span; `aria-pressed` belongs on the inner <button>.
  const tabs = Array.from(search.querySelectorAll<HTMLElement>("[data-search-tab]"));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const type = tab.dataset.searchTab || "";

      instance.triggerFilter("Type", type ? [type] : []);
      tabs.forEach((t) => {
        (t.querySelector(".button-inner") ?? t).setAttribute("aria-pressed", String(t === tab));
      });
    });
  });

  bindResultTemplate(search);
}

export function setupAllSearch(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".search").forEach((el) => setupSearch(el));
}
