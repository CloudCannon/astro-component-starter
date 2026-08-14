/**
 * Shared setup logic for the Search component.
 *
 * Used by:
 * - `Search.astro`'s inline `<script>` on the live site
 * - `editor-live-sync.js` in the CloudCannon editor, where inline scripts
 *   don't run
 *
 * Importing `@pagefind/component-ui` registers the `<pagefind-*>` custom
 * elements. The search index under `/pagefind/` only exists on built sites
 * (`npm run build` runs the Pagefind CLI); in `astro dev` run
 * `npm run search:dev` to generate one, otherwise the modal shows its
 * index-unavailable notice instead of results.
 */

import { getInstanceManager } from "@pagefind/component-ui";

import { setupModalShell } from "../../building-blocks/wrappers/modal/setup";

let keyboardShortcutBound = false;
let errorHookBound = false;
let countsHookBound = false;

function currentSearchPopover(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".search .modal-popover");
}

/** Cmd/Ctrl+K toggles the search modal. Bound once at document level and
 * resolving the popover at event time, so Astro view transitions can't
 * accumulate listeners pointing at detached DOM. */
function bindKeyboardShortcut(): void {
  if (keyboardShortcutBound) return;
  keyboardShortcutBound = true;

  document.addEventListener("keydown", (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
    if (e.key.toLowerCase() !== "k") return;

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

/** Write per-type result counts into the tab pills — key "" is the All tab,
 * `null` empties them (CSS hides empty badges). Tabs are resolved at call
 * time so view transitions can't leave the hook holding detached DOM. */
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

/** Render each result by cloning the build-time `SearchResult.astro`
 * template and filling in the data. Pagefind calls this via the
 * `resultTemplate` property, which wins over its own string templates. */
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
      // The index stores built-site asset URLs (hashed /_astro/ paths); on
      // the dev server those 404, so drop the thumbnail rather than show a
      // broken image.
      image.addEventListener("error", () => media.remove(), { once: true });

      try {
        // Pagefind image paths can be relative to the indexed page.
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
      // Excerpts carry <mark> highlight markup from our own index.
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

  // Escape closes the modal — and does nothing else. Pagefind's input binds
  // its own target-phase Escape handler that clears the query, so swallow
  // the event in the capture phase before it gets there. The browser's
  // popover close watcher is neither propagation-based nor cancelable, so
  // the modal still closes (and the query survives for reopening).
  popover.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") e.stopPropagation();
    },
    true
  );

  const instance = getInstanceManager().getInstance("default");

  // The instance survives Astro view transitions while the tab UI resets to
  // "All", so clear any sticky filter state without triggering a search
  // (a trigger* call would eagerly load the wasm bundle on every page view).
  instance.searchFilters = {};

  // Registered once module-wide, resolving the search element at fire time,
  // so view transitions can't stack callbacks holding detached DOM.
  if (!errorHookBound) {
    errorHookBound = true;
    instance.on("error", () => {
      document
        .querySelectorAll<HTMLElement>(".search")
        .forEach((el) => el.setAttribute("data-search-unavailable", ""));
    });
  }

  // Tab counts ride the results event: `totalFilters` counts each type for
  // the current term ignoring the active tab (so other tabs don't zero out),
  // and `unfilteredTotalCount` is the All figure. Clearing the query
  // dispatches results with no totalFilters and an empty term — the
  // searchTerm guard empties the badges rather than showing zeros.
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

  // Load the index as soon as the modal opens so the first keystroke
  // searches instantly — and so a missing index surfaces the unavailable
  // notice before the user types.
  popover.addEventListener("toggle", (e) => {
    if ((e as ToggleEvent).newState === "open") {
      instance.triggerLoad().catch(() => {});
    }
  });

  // Tabs are Button components: `data-search-tab` sits on the outer
  // `.button` span (clicks bubble up from the inner <button>), while
  // `aria-pressed` lives on the inner <button> where it has meaning.
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
