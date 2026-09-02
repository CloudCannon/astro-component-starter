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

// Same list as src/components/building-blocks/wrappers/modal/setup.ts, so the
// test counts exactly the elements the focus trap manages.
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
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
