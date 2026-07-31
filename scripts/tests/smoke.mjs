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
];

// Run.

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
