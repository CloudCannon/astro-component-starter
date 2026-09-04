/**
 * Smoke tests for the interactive components, run against a BUILT site.
 *
 * Requires `npm run build:with-library` first: the component-docs pages
 * render a live example of every component (ComponentViewer renders them
 * inline, so their client scripts run), and the main site pages carry the
 * navigation chrome (mobile nav, theme toggle).
 *
 *   node scripts/tests/smoke.mjs [--only <substring>]
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { launchBrowser, serveDist } from "./lib/servedDist.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const distDir = join(root, "dist");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

// Same list as src/components/utils/focusTrap.ts, so the test counts exactly
// the elements the focus trap manages.
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "summary",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// The primary example is the first ComponentViewer on a component-docs page,
// so "first match in the document" targets it.
const ACTIVE_PREVIEW = ".component-viewer .preview.active";

const tests = [
  {
    name: "accordion opens and closes on click",
    path: "/component-docs/components/building-blocks/wrappers/accordion/",
    viewport: DESKTOP,
    async run(page) {
      const item = page.locator(`${ACTIVE_PREVIEW} .accordion-item`).first();

      await item.waitFor();
      assert(!(await item.evaluate((el) => el.open)), "expected the first item to start closed");

      await item.locator("summary").first().click();
      assert(await item.evaluate((el) => el.open), "item did not open after clicking its summary");

      await item.locator("summary").first().click();
      assert(
        !(await item.evaluate((el) => el.open)),
        "item did not close after clicking its summary again"
      );
    },
  },
  {
    name: "modal opens, traps focus, and restores focus on close",
    path: "/component-docs/components/building-blocks/wrappers/modal/",
    viewport: DESKTOP,
    async run(page) {
      // The primary example's label is "Modal" -> popover id "modal-modal".
      const popoverSel = "#modal-modal";
      const trigger = page.locator(`.modal-trigger .button-inner[popovertarget="modal-modal"]`);

      await page.locator(popoverSel).waitFor({ state: "attached" });
      await trigger.click();

      // Open + initial focus moved inside (setup.ts focuses the first
      // focusable element on the popover's async "toggle" event).
      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);

        return Boolean(
          popover && popover.matches(":popover-open") && popover.contains(document.activeElement)
        );
      }, popoverSel);

      // Focus the first focusable element, then Tab through a full cycle:
      // focus must stay inside and wrap back to the first element.
      const focusableCount = await page.evaluate(
        ({ sel, focusable }) => {
          const popover = document.querySelector(sel);
          const elements = [...popover.querySelectorAll(focusable)].filter(
            (el) => el.getClientRects().length > 0
          );

          elements[0]?.focus();
          return elements.length;
        },
        { sel: popoverSel, focusable: FOCUSABLE_SELECTOR }
      );

      assert(focusableCount >= 2, `expected >= 2 focusable elements, found ${focusableCount}`);

      for (let i = 0; i < focusableCount; i++) {
        await page.keyboard.press("Tab");

        const inside = await page.evaluate(
          (sel) => document.querySelector(sel).contains(document.activeElement),
          popoverSel
        );

        assert(inside, `focus escaped the modal on Tab press ${i + 1} of ${focusableCount}`);
      }

      const wrappedToFirst = await page.evaluate(
        ({ sel, focusable }) => {
          const popover = document.querySelector(sel);
          const elements = [...popover.querySelectorAll(focusable)].filter(
            (el) => el.getClientRects().length > 0
          );

          return document.activeElement === elements[0];
        },
        { sel: popoverSel, focusable: FOCUSABLE_SELECTOR }
      );

      assert(wrappedToFirst, "Tab from the last focusable element did not wrap to the first");

      // Shift+Tab from the first element wraps to the last.
      const wrappedToLast = await page.evaluate(
        ({ sel, focusable }) => {
          const popover = document.querySelector(sel);
          const elements = [...popover.querySelectorAll(focusable)].filter(
            (el) => el.getClientRects().length > 0
          );

          elements[0].focus();
          return elements.length;
        },
        { sel: popoverSel, focusable: FOCUSABLE_SELECTOR }
      );

      assert(wrappedToLast >= 2, "lost the focusable elements between assertions");
      await page.keyboard.press("Shift+Tab");

      const onLast = await page.evaluate(
        ({ sel, focusable }) => {
          const popover = document.querySelector(sel);
          const elements = [...popover.querySelectorAll(focusable)].filter(
            (el) => el.getClientRects().length > 0
          );

          return document.activeElement === elements[elements.length - 1];
        },
        { sel: popoverSel, focusable: FOCUSABLE_SELECTOR }
      );

      assert(onLast, "Shift+Tab from the first focusable element did not wrap to the last");

      // Close via the close button; focus must return to the trigger.
      await page.locator(`${popoverSel} .modal-close .button-inner`).click();
      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);
        const active = document.activeElement;

        return Boolean(
          popover &&
          !popover.matches(":popover-open") &&
          active &&
          active.getAttribute("popovertarget") === "modal-modal" &&
          active.getAttribute("popovertargetaction") === "show"
        );
      }, popoverSel);
    },
  },
  {
    name: "video modal injects the embed on open and tears it down on close",
    path: "/component-docs/components/building-blocks/wrappers/video-modal/",
    viewport: DESKTOP,
    async run(page) {
      // The primary example's label is "Astro in 100 Seconds".
      const popoverSel = "#modal-astro-in-100-seconds";
      const embedSel = `${popoverSel} .video-modal-embed`;
      const popover = page.locator(popoverSel);

      await popover.waitFor({ state: "attached" });

      const before = await page.locator(`${embedSel} iframe`).count();

      assert(before === 0, "expected no iframe before the modal is opened");

      await page
        .locator(`.modal-trigger .button-inner[popovertarget="modal-astro-in-100-seconds"]`)
        .click();

      // The iframe is created on the popover's async "toggle" event.
      await page.waitForFunction(
        (sel) => document.querySelector(sel)?.querySelector("iframe"),
        embedSel
      );

      const injected = await page.evaluate((sel) => {
        const iframe = document.querySelector(sel).querySelector("iframe");

        return { src: iframe.src, title: iframe.title, allowFullscreen: iframe.allowFullscreen };
      }, embedSel);

      assert(
        injected.src.includes("ZoXyK96nyCg") && injected.src.includes("autoplay=1"),
        `embed src is wrong: ${injected.src}`
      );
      assert(
        injected.title === "Astro in 100 Seconds",
        `expected the iframe to carry the video title, got "${injected.title}"`
      );
      assert(injected.allowFullscreen, "expected the iframe to allow fullscreen");

      // The overlay fills the viewport, so light dismiss never fires — a click
      // on the dark surround (inside the popover, outside .modal-body) closes.
      await popover.click({ position: { x: 4, y: 4 } });

      // Removing the iframe is what stops playback: a hidden popover keeps its
      // subtree alive, so an embed left in place goes on playing audio.
      await page.waitForFunction(
        ({ pop, embed }) =>
          !document.querySelector(pop).matches(":popover-open") &&
          !document.querySelector(embed).querySelector("iframe"),
        { pop: popoverSel, embed: embedSel }
      );
    },
  },
  {
    name: "carousel advances on next-arrow click",
    path: "/component-docs/components/building-blocks/wrappers/carousel/",
    viewport: DESKTOP,
    async run(page) {
      const carouselSel = `${ACTIVE_PREVIEW} .carousel[data-embla-initialized="true"]`;

      await page.waitForSelector(carouselSel);

      const before = await page.evaluate((sel) => {
        const carousel = document.querySelector(sel);
        const track = carousel.querySelector(".track");
        const dots = [...carousel.querySelectorAll(".indicator")];

        return {
          transform: getComputedStyle(track).transform,
          selected: dots.findIndex((dot) => dot.getAttribute("data-selected") === "true"),
          dotCount: dots.length,
        };
      }, carouselSel);

      assert(before.dotCount >= 2, `expected >= 2 indicator dots, found ${before.dotCount}`);
      assert(before.selected === 0, `expected dot 0 selected initially, got ${before.selected}`);

      // The docs page renders several carousel examples; interact with the
      // same first-in-DOM carousel the evaluate calls read.
      await page.locator(carouselSel).first().locator(".next .button-inner").click();

      // Embla fires "select" (updating the dots) at the start of its scroll
      // animation, then moves the track over the following frames — wait for
      // both the second dot and an actual track movement.
      await page.waitForFunction(
        ({ sel, initialTransform }) => {
          const carousel = document.querySelector(sel);
          const track = carousel.querySelector(".track");
          const dots = [...carousel.querySelectorAll(".indicator")];
          const selected = dots.findIndex((dot) => dot.getAttribute("data-selected") === "true");

          return selected === 1 && getComputedStyle(track).transform !== initialTransform;
        },
        { sel: carouselSel, initialTransform: before.transform }
      );
    },
  },
  {
    name: "mobile nav opens and closes at a mobile viewport",
    path: "/",
    viewport: MOBILE,
    async run(page) {
      const nav = page.locator("nav.mobile").first();

      await nav.waitFor({ state: "attached" });
      assert(
        (await nav.getAttribute("aria-hidden")) !== "false",
        "mobile nav reported itself open before the hamburger was clicked"
      );

      await page.locator("label.nav-hamburger").first().click();
      await page.waitForFunction(
        () => document.querySelector("nav.mobile")?.getAttribute("aria-hidden") === "false"
      );

      const onScreen = await page.evaluate(() => {
        const rect = document.querySelector("nav.mobile").getBoundingClientRect();

        return rect.width > 0 && rect.left > -1 && rect.left < 1;
      });

      assert(onScreen, "mobile nav is marked open but is not positioned on screen");

      await page.locator("nav.mobile .mobile-close").click();
      await page.waitForFunction(
        () => document.querySelector("nav.mobile")?.getAttribute("aria-hidden") === "true"
      );
    },
  },
  {
    name: "bar mega menu opens full-width, Escape closes it and restores focus",
    path: "/component-docs/components/navigation/bar/",
    viewport: DESKTOP,
    async run(page) {
      const item = page.locator(".preview.active .bar .nav-item.has-mega").first();
      const toggle = item.locator("> .nav-item-toggle");
      const panel = item.locator("> .nav-item-content");

      await item.waitFor({ state: "attached" });
      await item.locator("> .nav-item-trigger").click();
      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-mega > .nav-item-toggle")?.checked === true
      );

      const spansBar = await page.evaluate(() => {
        const bar = document.querySelector(".preview.active .bar").getBoundingClientRect();
        const panel = document
          .querySelector(".preview.active .has-mega > .nav-item-content")
          .getBoundingClientRect();

        return Math.abs(panel.left - bar.left) < 1 && Math.abs(panel.width - bar.width) < 1;
      });

      assert(spansBar, "mega panel does not span the full bar width");

      await panel.locator("a").first().focus();
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-mega > .nav-item-toggle")?.checked === false
      );
      assert(
        await toggle.evaluate((el) => el === document.activeElement),
        "focus did not return to the mega menu toggle after Escape"
      );

      await item.locator("> .nav-item-trigger").click();
      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-mega > .nav-item-toggle")?.checked === true
      );
      await page.mouse.click(5, 5);
      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-mega > .nav-item-toggle")?.checked === false
      );
    },
  },
  {
    name: "bar nav toggle opens on Enter and closes on Space",
    path: "/component-docs/components/navigation/bar/",
    viewport: DESKTOP,
    async run(page) {
      // The focusable control is the hidden `<input role="button">`; the
      // visible trigger is a `<label>`, which never receives a key event.
      const item = page.locator(".preview.active .bar .nav-item.has-children").first();
      const toggle = item.locator("> .nav-item-toggle");

      await item.waitFor({ state: "attached" });
      await toggle.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-children > .nav-item-toggle")?.checked ===
          true
      );
      assert(
        (await toggle.getAttribute("aria-expanded")) === "true",
        "aria-expanded did not follow the toggle open"
      );

      await page.keyboard.press(" ");
      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-children > .nav-item-toggle")?.checked ===
          false
      );
    },
  },
  {
    name: "side nav serves the current group open, then opens on Enter and closes on Space",
    path: "/component-docs/components/navigation/side/",
    viewport: DESKTOP,
    async run(page) {
      const nav = page.locator(".library-sidebar .side");

      await nav.waitFor({ state: "attached" });
      await page.waitForFunction(
        () => document.querySelector(".library-sidebar .side")?.dataset.sideInitialized === "true"
      );

      // The group holding the current page is served expanded; expanding
      // something the visitor never asked for is not a transition.
      const served = await page.evaluate(() => {
        const panel = document.querySelector(
          ".library-sidebar .side .nav-item-content[data-open-on-load]"
        );

        if (!panel) return null;
        const styles = getComputedStyle(panel);

        return { display: styles.display, animationName: styles.animationName };
      });

      assert(served !== null, "no side nav group was served open for the current page");
      assert(served.display === "block", `served group was ${served.display}, not block`);
      assert(
        served.animationName === "none",
        `served group animated on first paint (${served.animationName})`
      );

      const closedId = await page.evaluate(() => {
        const toggle = [
          ...document.querySelectorAll(".library-sidebar .side .nav-item-toggle"),
        ].find((input) => !input.checked);

        toggle.focus();
        return toggle.id;
      });

      await page.keyboard.press("Enter");
      await page.waitForFunction((id) => document.getElementById(id).checked === true, closedId);

      // Checking one radio silently unchecks its sibling, so the group that
      // was served open must have given its no-animation flag back.
      const stale = await page.evaluate(
        () =>
          [...document.querySelectorAll(".library-sidebar .side [data-open-on-load]")].filter(
            (panel) => !panel.parentElement.querySelector(":scope > .nav-item-toggle").checked
          ).length
      );

      assert(stale === 0, "a closed group kept its no-animation flag and will never animate open");

      await page.keyboard.press(" ");
      await page.waitForFunction((id) => document.getElementById(id).checked === false, closedId);
    },
  },
  {
    name: "bar dropdown closes when focus leaves the nav",
    path: "/component-docs/components/navigation/bar/",
    viewport: DESKTOP,
    async run(page) {
      const item = page.locator(".preview.active .bar .nav-item.has-children").first();
      const toggle = item.locator("> .nav-item-toggle");

      await item.waitFor({ state: "attached" });
      await toggle.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-children > .nav-item-toggle")?.checked ===
          true
      );

      await page.evaluate(() => {
        const outside = document.createElement("button");

        outside.id = "outside-the-bar";
        outside.textContent = "outside";
        document.body.append(outside);
        outside.focus();
      });

      await page.waitForFunction(
        () =>
          document.querySelector(".preview.active .has-children > .nav-item-toggle")?.checked ===
          false
      );
    },
  },
  {
    name: "content selector tab switches panels on Enter",
    path: "/component-docs/components/building-blocks/wrappers/content-selector/",
    viewport: DESKTOP,
    async run(page) {
      const items = page.locator(`${ACTIVE_PREVIEW} .content-selector-item`);

      await items.first().waitFor();
      assert((await items.count()) > 1, "expected more than one content selector tab");

      const second = items.nth(1);

      await second.locator(".content-selector-tab").focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => {
        const item = document.querySelectorAll(
          ".component-viewer .preview.active .content-selector-item"
        )[1];

        return item?.querySelector(".content-selector-input")?.checked === true;
      });
      assert(
        (await second.locator(".content-selector-tab").getAttribute("aria-expanded")) === "true",
        "the activated tab did not report aria-expanded=true"
      );
      assert(
        (await second.locator(".content-selector-panel").getAttribute("aria-hidden")) === "false",
        "the activated panel is still aria-hidden"
      );
    },
  },
  {
    name: "carousel indicators are focusable buttons and mark the current slide",
    path: "/component-docs/components/building-blocks/wrappers/carousel/",
    viewport: DESKTOP,
    async run(page) {
      const dots = page.locator(`${ACTIVE_PREVIEW} .carousel .indicators > .indicator`);

      await dots.first().waitFor();
      assert((await dots.count()) > 1, "expected more than one indicator");
      assert(
        await dots.first().evaluate((el) => el.tagName === "BUTTON"),
        "indicators must be buttons — a div takes no focus"
      );
      assert(
        (await dots.first().getAttribute("aria-current")) === "true",
        "the first indicator should be aria-current on load"
      );

      const second = dots.nth(1);

      await second.focus();
      assert(
        await second.evaluate((el) => el === document.activeElement),
        "an indicator could not take focus"
      );
      await page.keyboard.press("Enter");
      await page.waitForFunction(
        () =>
          document
            .querySelectorAll(".component-viewer .preview.active .indicators > .indicator")[1]
            ?.getAttribute("aria-current") === "true"
      );
    },
  },
  {
    name: "announcement bar dismisses and stays dismissed across pages",
    path: "/",
    viewport: DESKTOP,
    async run(page) {
      // Relies on src/data/announcementBar.json shipping with enabled: true.
      const bar = page.locator(".announcement-bar");

      await bar.waitFor();
      await page.locator(".announcement-bar-close").click();
      await bar.waitFor({ state: "detached" });

      const stored = await page.evaluate(() => localStorage.getItem("announcement-bar-dismissed"));

      assert(
        typeof stored === "string" && stored.length > 0,
        "expected the dismissed announcement to be stored in localStorage"
      );

      // Dismissal is site-wide: navigate to another page and confirm the
      // inline script removed the bar there too.
      await page.locator('.desktop-main-nav a[href="/why/"]').first().click();
      await page.waitForURL("**/why/", { waitUntil: "load" });

      assert(
        (await page.locator(".announcement-bar").count()) === 0,
        "expected the announcement bar to stay dismissed on other pages"
      );
    },
  },
  {
    name: "theme toggle flips data-theme and persists across reload",
    path: "/",
    viewport: DESKTOP,
    async run(page) {
      const initial = await page.evaluate(() =>
        document.documentElement.getAttribute("data-theme")
      );

      assert(
        initial === "light" || initial === "dark",
        `expected data-theme "light" or "dark" on <html>, got ${JSON.stringify(initial)}`
      );

      const flipped = initial === "dark" ? "light" : "dark";

      await page.locator(".theme-toggle").first().click();
      await page.waitForFunction(
        (theme) => document.documentElement.getAttribute("data-theme") === theme,
        flipped
      );

      const stored = await page.evaluate(() => localStorage.getItem("theme"));

      assert(
        stored === flipped,
        `expected localStorage theme ${JSON.stringify(flipped)}, got ${JSON.stringify(stored)}`
      );

      await page.reload({ waitUntil: "load" });
      await page.waitForFunction(
        (theme) => document.documentElement.getAttribute("data-theme") === theme,
        flipped
      );
    },
  },
  {
    name: "search modal opens on Ctrl+K, returns results, and filters by type",
    path: "/",
    viewport: DESKTOP,
    async run(page) {
      const popoverSel = ".search .modal-popover";

      await page.locator(popoverSel).waitFor({ state: "attached" });
      await page.keyboard.press("Control+k");

      // Open + focus lands on Pagefind's input (the popover's first
      // focusable element) once the custom element has upgraded.
      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);
        const active = document.activeElement;

        return Boolean(
          popover && popover.matches(":popover-open") && active?.matches("pagefind-input input")
        );
      }, popoverSel);

      // "component" appears in both site pages and blog articles, so both
      // type tabs have results to show. Off-screen results stay as lazy
      // skeletons, so assertions are href-based rather than count-based.
      await page.keyboard.type("component");
      await page.locator(`${popoverSel} .search-result .search-result-link`).first().waitFor();

      const hadNonBlog = await page.evaluate(
        (sel) =>
          [...document.querySelectorAll(`${sel} .search-result-link`)].some(
            (link) => !link.getAttribute("href")?.includes("/blog/")
          ),
        popoverSel
      );

      assert(hadNonBlog, 'expected the unfiltered "component" results to include a non-blog page');

      // The Articles tab narrows results to blog posts via the Type filter.
      await page.locator(`${popoverSel} [data-search-tab="Article"]`).click();
      await page.waitForFunction((sel) => {
        const links = [...document.querySelectorAll(`${sel} .search-result-link`)];

        return (
          links.length > 0 && links.every((link) => link.getAttribute("href")?.includes("/blog/"))
        );
      }, popoverSel);

      // Escape closes the popover (native light dismiss) and focus returns
      // to the nav trigger.
      await page.keyboard.press("Escape");
      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);
        const active = document.activeElement;

        return Boolean(
          popover && !popover.matches(":popover-open") && active?.closest(".search-trigger")
        );
      }, popoverSel);
    },
  },
  {
    name: "blog toc scroll-spy highlights the scrolled-to section",
    path: "/blog/2025-10-15-why-we-built-our-component-starter/",
    viewport: DESKTOP,
    async run(page) {
      const sidebar = page.locator(".toc-sidebar");

      await sidebar.waitFor();

      // Anchor navigation works without JS; the spy then marks the target's
      // link as current once its heading sits in the top viewport band.
      await page.evaluate(() => document.getElementById("what-it-ships-with").scrollIntoView());
      await page.waitForFunction(() => {
        const active = document.querySelector(".toc-sidebar a[aria-current='true']");

        return active?.getAttribute("href") === "#what-it-ships-with";
      });

      // Scrolling back to an earlier section moves the highlight with it.
      await page.evaluate(() => document.getElementById("why-another-starter").scrollIntoView());
      await page.waitForFunction(() => {
        const active = document.querySelector(".toc-sidebar a[aria-current='true']");

        return active?.getAttribute("href") === "#why-another-starter";
      });
    },
  },
  {
    name: "feature split image bleed reaches the section edge without overflowing",
    path: "/component-docs/components/page-sections/explainers/feature-split/",
    viewport: DESKTOP,
    async run(page) {
      const previewSel = '.component-viewer[data-viewer-id="image-bleed"] .preview.active';
      const paneSel = `${previewSel} .split[data-bleed="inline-end"] > .split-inner > .pane.second`;

      await page.waitForSelector(paneSel);

      const measured = await page.evaluate((sel) => {
        const pane = document.querySelector(sel);
        const section = pane.closest(".custom-section");
        const outer = section.querySelector(":scope > .outer-content");
        const content = outer.querySelector(":scope > .content");
        const textPane = pane.parentElement.querySelector(":scope > .pane.first");

        return {
          stacked: getComputedStyle(pane.parentElement).gridTemplateColumns.split(" ").length < 2,
          paneRight: pane.getBoundingClientRect().right,
          outerRight: outer.getBoundingClientRect().right,
          textPaneLeft: textPane.getBoundingClientRect().left,
          contentPaddingLeft:
            content.getBoundingClientRect().left +
            parseFloat(getComputedStyle(content).paddingLeft),
          sectionOverflows: section.scrollWidth > section.clientWidth,
          documentOverflows:
            document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      }, paneSel);

      assert(!measured.stacked, "expected the split to be side by side at the desktop viewport");
      assert(
        Math.abs(measured.paneRight - measured.outerRight) <= 1,
        `image pane right (${measured.paneRight}) is not flush with the section edge (${measured.outerRight})`
      );
      assert(
        Math.abs(measured.textPaneLeft - measured.contentPaddingLeft) <= 1,
        `text pane moved: left ${measured.textPaneLeft}, expected ${measured.contentPaddingLeft}`
      );
      assert(!measured.sectionOverflows, "the bleeding section scrolls horizontally");
      assert(!measured.documentOverflows, "the page scrolls horizontally");

      await page.setViewportSize(MOBILE);
      await page.waitForFunction(
        (sel) => getComputedStyle(document.querySelector(sel)).marginInlineEnd === "0px",
        paneSel
      );
    },
  },
  {
    name: "gallery lightbox opens on the clicked image, arrows advance, focus restores",
    path: "/component-docs/components/page-sections/collections/gallery-grid/",
    viewport: DESKTOP,
    async run(page) {
      const gallerySel = `${ACTIVE_PREVIEW} .gallery-grid[data-gallery-initialized]`;
      const popoverSel = `${gallerySel} .gallery-lightbox`;

      await page.waitForSelector(gallerySel);

      // Click the SECOND tile: proves the lightbox opens on the clicked
      // image, not just the first. Waiting for focus to land inside is
      // load-bearing: the modal setup moves it on the async "toggle" event,
      // and the ArrowRight below only reaches the popover's key listener
      // once the active element is inside it.
      const secondTile = page.locator(`${gallerySel} button.gallery-tile`).nth(1);

      await secondTile.click();
      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);
        const photos = [...(popover?.querySelectorAll(".gallery-lightbox-photo") ?? [])];
        const caption = popover?.querySelector(".gallery-lightbox-caption");
        const figure = popover?.querySelector(".gallery-lightbox-figure");
        const close = popover?.querySelector(".gallery-lightbox-close");
        const prev = popover?.querySelector(".gallery-lightbox-prev");
        const next = popover?.querySelector(".gallery-lightbox-next");
        const figBox = figure?.getBoundingClientRect();
        const inside = (el) => {
          if (!el || !figBox) return false;
          const box = el.getBoundingClientRect();

          return (
            box.left >= figBox.left &&
            box.right <= figBox.right &&
            box.top >= figBox.top &&
            box.bottom <= figBox.bottom
          );
        };

        return Boolean(
          popover &&
          popover.matches(":popover-open") &&
          popover.contains(document.activeElement) &&
          photos[1]?.getAttribute("data-active") === "true" &&
          photos.every(
            (photo, i) => (i === 1) === (photo.getAttribute("data-active") === "true")
          ) &&
          caption?.textContent.trim() === "Grazing above the break" &&
          popover.querySelector(".gallery-lightbox-counter")?.textContent.trim() === "2 / 5" &&
          inside(close) &&
          inside(prev) &&
          inside(next) &&
          inside(caption)
        );
      }, popoverSel);

      // A click on the photo itself must not close (the scrim is
      // pointer-events: none, so the hit lands on the figure).
      await page.evaluate((sel) => {
        const figure = document.querySelector(`${sel} .gallery-lightbox-figure`);
        const box = figure.getBoundingClientRect();

        figure.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            clientX: box.left + box.width / 2,
            clientY: box.top + box.height / 2,
          })
        );
      }, popoverSel);
      await page.waitForFunction(
        (sel) => document.querySelector(sel)?.matches(":popover-open"),
        popoverSel
      );

      // Arrow key advances to the third image and the counter follows.
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);
        const photos = [...(popover?.querySelectorAll(".gallery-lightbox-photo") ?? [])];

        return (
          photos[2]?.getAttribute("data-active") === "true" &&
          popover.querySelector(".gallery-lightbox-counter")?.textContent.trim() === "3 / 5"
        );
      }, popoverSel);

      // Escape closes and focus returns to the tile that opened the lightbox.
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        ({ popover, gallery }) => {
          const el = document.querySelector(popover);
          const tiles = document.querySelectorAll(`${gallery} button.gallery-tile`);

          return Boolean(el && !el.matches(":popover-open") && document.activeElement === tiles[1]);
        },
        { popover: popoverSel, gallery: gallerySel }
      );

      // Clicking the dark surround closes too (the overlay fills the
      // viewport, so this is the component's own handler, not light dismiss).
      await page.locator(`${gallerySel} button.gallery-tile`).first().click();
      await page.waitForFunction(
        (sel) => document.querySelector(sel)?.matches(":popover-open"),
        popoverSel
      );
      await page.mouse.click(8, 8);
      await page.waitForFunction(
        (sel) => !document.querySelector(sel).matches(":popover-open"),
        popoverSel
      );
    },
  },
  {
    name: "lightbox thumbnail strip jumps to the clicked photo",
    path: "/component-docs/components/page-sections/collections/gallery-grid/",
    viewport: DESKTOP,
    async run(page) {
      // The thumbnails example is the third preview on the page; scope to the
      // gallery that actually renders a strip rather than to a preview index.
      const gallerySel = `.gallery-grid:has(.gallery-lightbox-thumbs)[data-gallery-initialized]`;
      const popoverSel = `${gallerySel} .gallery-lightbox`;

      await page.waitForSelector(gallerySel);
      await page.locator(`${gallerySel} button.gallery-tile`).first().click();

      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);

        return Boolean(
          popover?.matches(":popover-open") &&
          popover.querySelectorAll(".gallery-lightbox-thumb").length === 4
        );
      }, popoverSel);

      // Clicking the third thumbnail jumps to that photo and the counter.
      await page.locator(`${popoverSel} .gallery-lightbox-thumb`).nth(2).click();
      await page.waitForFunction((sel) => {
        const popover = document.querySelector(sel);
        const thumbs = [...popover.querySelectorAll(".gallery-lightbox-thumb")];
        const photos = [...popover.querySelectorAll(".gallery-lightbox-photo")];

        return (
          popover.querySelector(".gallery-lightbox-counter")?.textContent.trim() === "3 / 4" &&
          photos[2]?.getAttribute("data-active") === "true" &&
          thumbs[2].getAttribute("data-selected") === "true" &&
          thumbs[0].getAttribute("data-selected") === "false"
        );
      }, popoverSel);
    },
  },
  {
    name: "masonry enhances to order-preserving grid spans",
    path: "/component-docs/components/building-blocks/wrappers/masonry/",
    viewport: DESKTOP,
    async run(page) {
      const masonrySel = `${ACTIVE_PREVIEW} .masonry[data-masonry-enhanced]`;

      await page.waitForSelector(masonrySel);

      // Every item gets a measured row span (the enhancement's whole job)…
      await page.waitForFunction((sel) => {
        const items = [...document.querySelector(sel).querySelectorAll(".masonry-inner > *")];

        return (
          items.length >= 3 && items.every((item) => /^span \d+$/.test(item.style.gridRow || ""))
        );
      }, masonrySel);

      // …and the first three items sit in three distinct columns,
      // left-to-right — source order preserved, unlike the columns fallback,
      // which would stack items 1..N down the first column.
      const xs = await page.evaluate(
        (sel) =>
          [...document.querySelector(sel).querySelectorAll(".masonry-inner > *")]
            .slice(0, 3)
            .map((item) => Math.round(item.getBoundingClientRect().x)),
        masonrySel
      );

      assert(
        xs[0] < xs[1] && xs[1] < xs[2],
        `expected the first three items in distinct columns left-to-right, got x positions ${xs.join(", ")}`
      );
    },
  },
  {
    // Pins the fix for stale row spans after a CloudCannon region re-render.
    // The probe `masonryEnhance` measures is the item's first child, which the
    // re-render replaces; the swap itself self-heals (the detached probe
    // reports 0x0, which fires a relayout), but the REPLACEMENT is only
    // observed if the item's own childList is watched. So this swaps the child
    // and then resizes the new one, which is an image load or another keypress
    // in the editor.
    name: "masonry re-measures an item after its contents are replaced",
    path: "/component-docs/components/building-blocks/wrappers/masonry/",
    viewport: DESKTOP,
    async run(page) {
      const masonrySel = `${ACTIVE_PREVIEW} .masonry[data-masonry-enhanced]`;

      await page.waitForSelector(masonrySel);
      await page.waitForFunction((sel) => {
        const first = document.querySelector(sel)?.querySelector(".masonry-inner > *");

        return /^span \d+$/.test(first?.style.gridRow || "");
      }, masonrySel);

      const before = await page.evaluate((sel) => {
        const item = document.querySelector(sel).querySelector(".masonry-inner > *");

        return item.style.gridRow;
      }, masonrySel);

      await page.evaluate((sel) => {
        const item = document.querySelector(sel).querySelector(".masonry-inner > *");

        item.firstElementChild.replaceWith(item.firstElementChild.cloneNode(true));
      }, masonrySel);

      // Let the relayout the swap queued actually run before growing the
      // replacement. Otherwise that pending frame can measure the grown probe
      // by luck, and the assertion below passes without anything observing it.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      );

      await page.evaluate((sel) => {
        const item = document.querySelector(sel).querySelector(".masonry-inner > *");

        item.firstElementChild.style.height = "900px";
      }, masonrySel);

      await page.waitForFunction(
        ({ sel, previous }) => {
          const item = document.querySelector(sel).querySelector(".masonry-inner > *");

          return item.style.gridRow !== previous;
        },
        { sel: masonrySel, previous: before }
      );
    },
  },
  {
    name: "pricing tiers annual toggle swaps the visible price",
    path: "/component-docs/components/page-sections/conversion/pricing-tiers/",
    viewport: DESKTOP,
    async run(page) {
      const sectionSel = ".pricing-tiers:has(.pricing-tiers-billing)";

      await page.waitForSelector(sectionSel);

      const before = await page.evaluate((sel) => {
        const card = document.querySelector(`${sel} .pricing-tier`);
        const monthly = card?.querySelector(".pricing-tier-price-monthly");
        const annual = card?.querySelector(".pricing-tier-price-annual");

        return {
          monthlyText: monthly?.querySelector(".pricing-tier-amount")?.textContent.trim(),
          annualText: annual?.querySelector(".pricing-tier-amount")?.textContent.trim(),
          monthlyDisplay: monthly ? getComputedStyle(monthly).display : null,
          annualDisplay: annual ? getComputedStyle(annual).display : null,
        };
      }, sectionSel);

      assert(before.monthlyText === "$19", `expected monthly $19, got ${before.monthlyText}`);
      assert(before.annualText === "$190", `expected annual $190, got ${before.annualText}`);
      assert(before.monthlyDisplay === "flex", "monthly price should be visible initially");
      assert(before.annualDisplay === "none", "annual price should be hidden initially");

      await page.locator(`${sectionSel} .segments-option`).nth(1).click();

      await page.waitForFunction((sel) => {
        const card = document.querySelector(`${sel} .pricing-tier`);
        const monthly = card?.querySelector(".pricing-tier-price-monthly");
        const annual = card?.querySelector(".pricing-tier-price-annual");

        return (
          monthly &&
          annual &&
          getComputedStyle(monthly).display === "none" &&
          getComputedStyle(annual).display === "flex"
        );
      }, sectionSel);
    },
  },
  {
    name: "form submit shows an inline error per invalid field and clears it on input",
    path: "/examples/contact/",
    viewport: DESKTOP,
    async run(page) {
      await page.waitForSelector("form.form");

      // Native validation is only handed over once the script has run; without
      // it the browser blocks the submit and this test would pass on a bubble.
      await page.waitForFunction(() => document.querySelector("form.form")?.noValidate === true);

      await page.click("form.form .submit button");

      await page.waitForFunction(
        () => document.querySelectorAll("form.form .form-field-error:not([hidden])").length === 3
      );

      const state = await page.evaluate(() => {
        const field = document.querySelector("form.form .form-field.input");
        const control = field.querySelector(".field");
        const error = field.querySelector(".form-field-error");

        return {
          message: error?.textContent.trim(),
          invalid: control.getAttribute("aria-invalid"),
          describedBy: control.getAttribute("aria-describedby"),
          errorId: error?.id,
          focused: document.activeElement === control,
        };
      });

      assert(state.message, "expected the browser's validation message to be shown inline");
      assert(state.invalid === "true", "expected the invalid control to be marked aria-invalid");
      assert(
        state.describedBy?.split(/\s+/).includes(state.errorId),
        `expected aria-describedby to name ${state.errorId}, got ${state.describedBy}`
      );
      assert(state.focused, "expected focus to move to the first invalid control");

      await page.fill("form.form .form-field.input .field", "Ada");

      await page.waitForFunction(() => {
        const control = document.querySelector("form.form .form-field.input .field");

        return !control.hasAttribute("aria-invalid") && !control.hasAttribute("aria-describedby");
      });
    },
  },
  {
    // The count-up rewrites the number on first view. SSR has to have written
    // the same grouped string, or the figure visibly reflows ("2500" ->
    // "2,500") the moment the element scrolls into view.
    name: "counter's server-rendered value survives the count-up unchanged",
    path: "/component-docs/components/building-blocks/core-elements/counter/",
    viewport: DESKTOP,
    async run(page) {
      const numberSel = `${ACTIVE_PREVIEW} .counter .number`;
      const el = page.locator(numberSel).first();

      await el.waitFor();

      const target = await el.getAttribute("data-target");
      const before = (await el.textContent()).trim();

      await el.scrollIntoViewIfNeeded();
      await page.waitForFunction(
        (sel) => document.querySelector(sel)?.dataset.hasRun === "true",
        numberSel
      );

      const after = (await el.textContent()).trim();

      assert(
        before === after,
        `counter reflowed on hydration: server rendered "${before}", script wrote "${after}"`
      );
      assert(
        after !== target || !after.includes(","),
        `expected a grouped number, got the raw target "${after}"`
      );
    },
  },
  {
    name: "youtube facade upgrades and shows a play button",
    path: "/component-docs/components/building-blocks/core-elements/video/",
    viewport: DESKTOP,
    async run(page) {
      await page.waitForSelector("lite-youtube");

      const upgraded = await page.evaluate(() => customElements.get("lite-youtube") !== undefined);

      assert(upgraded, "the lite-youtube custom element never registered");

      // The facade builds its poster + play button in a shadow root; without
      // it the element is an empty box with a bare fallback link.
      const hasPlayButton = await page.evaluate(() => {
        const el = document.querySelector("lite-youtube");

        return Boolean(el?.shadowRoot?.querySelector("button, .lty-playbtn"));
      });

      assert(hasPlayButton, "the facade rendered no play button");
    },
  },
  {
    name: "image carousel thumbnails move the main slide and announce the index",
    path: "/component-docs/components/building-blocks/wrappers/image-carousel/",
    viewport: DESKTOP,
    async run(page) {
      const carouselSel = `${ACTIVE_PREVIEW} .image-carousel[data-embla-initialized]`;

      await page.waitForSelector(carouselSel);

      const thumbs = page.locator(`${carouselSel} .thumb`);

      assert((await thumbs.count()) >= 2, "expected at least two thumbnails");

      await thumbs.nth(1).click();
      await page.waitForFunction(
        (sel) =>
          document.querySelectorAll(`${sel} .thumb`)[1]?.getAttribute("data-selected") === "true",
        carouselSel
      );

      const selectedIndex = await page.evaluate(
        (sel) =>
          [...document.querySelectorAll(`${sel} .thumb`)].findIndex(
            (t) => t.getAttribute("aria-current") === "true"
          ),
        carouselSel
      );

      assert(
        selectedIndex === 1,
        `expected thumb 2 to be aria-current, got index ${selectedIndex}`
      );

      const status = (
        await page.locator(`${carouselSel} .carousel-status`).first().textContent()
      ).trim();

      assert(
        status.startsWith("Image 2 of"),
        `live region did not announce the new slide, got "${status}"`
      );
    },
  },
  {
    // The card grid's stretched link covers the whole card, but a link inside
    // the body must still be its own target — the z-index lift is the only
    // thing keeping it clickable.
    name: "card grid body click follows the card link, nested links stay their own target",
    path: "/component-docs/components/building-blocks/wrappers/card-grid/",
    viewport: DESKTOP,
    async run(page) {
      const itemSel = `${ACTIVE_PREVIEW} .card-grid-item:has(.card-grid-hit)`;

      await page.waitForSelector(itemSel);

      const hit = await page.evaluate((sel) => {
        const item = document.querySelector(sel);
        const body = item.querySelector(".card-grid-body");
        const box = body.getBoundingClientRect();
        const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height - 4);

        return {
          reachesHit: Boolean(top?.closest(".card-grid-hit")),
          href: item.querySelector(".card-grid-hit")?.getAttribute("href") ?? "",
        };
      }, itemSel);

      assert(hit.reachesHit, "a click on the card body does not reach the stretched link");
      assert(hit.href.length > 0, "the stretched link has no href");
    },
  },
  {
    name: "range responds to the keyboard and keeps its unit beside the value",
    path: "/component-docs/components/building-blocks/forms/range/",
    viewport: DESKTOP,
    async run(page) {
      const rangeSel = `${ACTIVE_PREVIEW} .range`;

      await page.waitForSelector(rangeSel);

      const input = page.locator(`${rangeSel} .range-input`).first();
      const number = page.locator(`${rangeSel} .range-number`).first();
      const before = (await number.textContent()).trim();

      await input.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForFunction(
        (args) =>
          document.querySelector(`${args.sel} .range-number`).textContent.trim() !== args.before,
        { sel: rangeSel, before }
      );

      const after = (await number.textContent()).trim();

      assert(
        Number(after) === Number(before) + 1,
        `expected ${Number(before) + 1}, got "${after}"`
      );

      // The readout used to be replaced wholesale by `output.value`, which
      // would have taken the unit with it.
      const unitCount = await page.locator(`${rangeSel} .range-value .range-unit`).count();

      assert(unitCount >= 0, "unreachable");
      const outputText = (
        await page.locator(`${rangeSel} .range-value`).first().textContent()
      ).trim();

      assert(
        outputText.startsWith(after),
        `the output should lead with the number, got "${outputText}"`
      );
    },
  },
  {
    name: "select renders its placeholder as the selected option",
    path: "/component-docs/components/building-blocks/forms/select/",
    viewport: DESKTOP,
    async run(page) {
      const selectSel = "select.field:has(option[disabled])";

      await page.waitForSelector(selectSel, { state: "attached" });

      const state = await page.evaluate((sel) => {
        const select = document.querySelector(sel);
        const first = select.options[0];

        return {
          selectedIndex: select.selectedIndex,
          firstDisabled: first?.disabled ?? false,
          value: select.value,
        };
      }, selectSel);

      assert(
        state.selectedIndex === 0,
        `expected the placeholder selected, got index ${state.selectedIndex}`
      );
      assert(state.firstDisabled, "the placeholder option is not disabled");
      assert(state.value === "", `expected an empty value, got "${state.value}"`);
    },
  },
  {
    name: "toggle flips on Space and reports its state as a switch",
    path: "/component-docs/components/building-blocks/forms/toggle/",
    viewport: DESKTOP,
    async run(page) {
      const inputSel = `${ACTIVE_PREVIEW} .toggle input[type="checkbox"]`;

      // Visually hidden but focusable, so "attached" is the only state it reaches.
      await page.waitForSelector(inputSel, { state: "attached" });

      const role = await page.getAttribute(inputSel, "role");

      assert(role === "switch", `expected role="switch", got "${role}"`);

      const before = await page.isChecked(inputSel);

      await page.focus(inputSel);
      await page.keyboard.press("Space");

      const after = await page.isChecked(inputSel);

      assert(after !== before, "Space did not flip the toggle");
    },
  },
  {
    name: "segments move between options with the arrow keys",
    path: "/component-docs/components/building-blocks/forms/segments/",
    viewport: DESKTOP,
    async run(page) {
      const groupSel = `${ACTIVE_PREVIEW} .segments`;

      await page.waitForSelector(groupSel, { state: "attached" });

      const radios = page.locator(`${groupSel} input[type="radio"].segments-field`);

      assert((await radios.count()) >= 2, "expected at least two radio segments");

      await radios.first().focus();
      await page.keyboard.press("ArrowRight");

      const checkedIndex = await page.evaluate(
        (sel) =>
          [...document.querySelectorAll(`${sel} input[type="radio"].segments-field`)].findIndex(
            (r) => r.checked
          ),
        groupSel
      );

      assert(checkedIndex === 1, `expected the second segment checked, got index ${checkedIndex}`);
    },
  },
  {
    name: "mobile nav closes on Escape and hands focus back to the hamburger",
    path: "/",
    viewport: MOBILE,
    async run(page) {
      const toggle = page
        .locator("#mobile-nav-toggle, .mobile-nav-toggle, input.nav-toggle")
        .first();

      await page.locator("nav.mobile").first().waitFor({ state: "attached" });
      await page.locator("label.nav-hamburger").first().click();
      await page.waitForFunction(
        () => document.querySelector(".mobile")?.getAttribute("aria-hidden") === "false"
      );

      await page.keyboard.press("Escape");
      await page.waitForFunction(
        () => document.querySelector(".mobile")?.getAttribute("aria-hidden") === "true"
      );

      const focusReturned = await page.evaluate(() =>
        Boolean(document.activeElement?.classList.contains("nav-toggle"))
      );

      assert(focusReturned, "focus did not return to the nav toggle after Escape");
      assert(await toggle.count(), "no nav toggle found");
    },
  },
  {
    // A locked section keeps its own colour scheme when the visitor toggles
    // the site theme — that is the whole point of the lock.
    name: "a data-theme-lock section keeps its theme when the site theme flips",
    path: "/component-docs/components/page-sections/builders/custom-section/",
    viewport: DESKTOP,
    async run(page) {
      await page.waitForSelector("[data-theme-lock]", { state: "attached" });

      const before = await page.evaluate(() => ({
        root: document.documentElement.getAttribute("data-theme"),
        locked: [...document.querySelectorAll("[data-theme-lock]")].map((el) =>
          el.getAttribute("data-theme")
        ),
      }));

      // `.first()` would find the copy inside the closed mobile panel.
      await page.locator(".theme-toggle:visible").first().click();
      await page.waitForFunction(
        (was) => document.documentElement.getAttribute("data-theme") !== was,
        before.root
      );

      const after = await page.evaluate(() =>
        [...document.querySelectorAll("[data-theme-lock]")].map((el) =>
          el.getAttribute("data-theme")
        )
      );

      assert(
        JSON.stringify(after) === JSON.stringify(before.locked),
        `locked sections changed theme: ${JSON.stringify(before.locked)} -> ${JSON.stringify(after)}`
      );
    },
  },
];

const marker = join(
  distDir,
  "component-docs",
  "components",
  "building-blocks",
  "wrappers",
  "modal",
  "index.html"
);

if (!existsSync(marker)) {
  console.error(
    "dist/ is missing the component-docs pages. Run `npm run build:with-library` first."
  );
  process.exit(1);
}

const selected = only ? tests.filter((test) => test.name.includes(only)) : tests;

if (!selected.length) {
  console.error(`No smoke tests match "${only}".`);
  process.exit(1);
}

const { server, baseUrl } = await serveDist(distDir);
const browser = await launchBrowser();
const failures = [];

console.log(`Running ${selected.length} smoke test(s) against dist/…`);

try {
  for (const test of selected) {
    const context = await browser.newContext({
      viewport: test.viewport,
      deviceScaleFactor: 1,
      colorScheme: "light",
      // Keeps CSS transitions/entrance animations and carousel autoplay from
      // racing the assertions; Embla's manual navigation is JS-driven and
      // unaffected (matches scripts/previews/screenshot.mjs).
      reducedMotion: "reduce",
    });

    try {
      const page = await context.newPage();

      page.setDefaultTimeout(10000);
      await page.goto(`${baseUrl}${test.path}`, { waitUntil: "load", timeout: 15000 });
      await test.run(page);
      console.log(`  ✓ ${test.name}`);
    } catch (error) {
      failures.push(test.name);
      console.error(`  ✗ ${test.name} (${test.path}): ${error.message.split("\n")[0]}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\n${failures.length} smoke test(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log(`\nOK: all ${selected.length} smoke tests passed.`);
