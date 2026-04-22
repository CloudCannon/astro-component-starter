/**
 * Syncs DOM changes in the CloudCannon editor to component runtime state.
 *
 * This works around two editor-only quirks:
 *
 *   1. CloudCannon cannot re-render props on a component's root element
 *      (handled via direct style sync, e.g. bento-box spans).
 *   2. CloudCannon's editable-regions uses React's `renderToStaticMarkup`
 *      to render Astro components, which strips inline `<script>` tags.
 *      That means components whose behaviour lives in a client `<script>`
 *      (e.g. Carousel's Embla setup) never initialise in the editor, so
 *      we initialise them here instead.
 *
 * Logs editor mutations to the console in dev; silent in production.
 */

import {
  destroyCarousel,
  setupAllCarousels,
  setupCarousel,
} from "./src/components/building-blocks/wrappers/carousel/setup";

const DEBUG = import.meta.env.DEV;

function log(...args) {
  if (DEBUG) console.log("[editor-live-sync]", ...args);
}

function syncBentoBoxSpans(target) {
  const parent = target.closest(".bento-box-item");

  if (!parent) return;

  const colSpan = Number(target.dataset.colSpan) || 1;
  const rowSpan = Number(target.dataset.rowSpan) || 1;

  parent.style.gridColumn = colSpan > 1 ? `span ${colSpan}` : "";
  parent.style.gridRow = rowSpan > 1 ? `span ${rowSpan}` : "";
}

const BENTO_BOX_ATTRS = ["data-col-span", "data-row-span"];

/**
 * Carousel config is read from attributes on `.carousel-inner` at
 * Embla init time, so any change to those attributes, the inline
 * style (CSS vars like `--slide-width`), or the slide list requires
 * a full destroy + re-init of the Embla instance.
 */
const CAROUSEL_INNER_ATTRS = [
  "data-show-indicators",
  "data-show-arrows",
  "data-loop",
  "data-align",
  "data-slides-to-scroll",
  "data-autoplay",
  "data-autoscroll",
  "style",
];

const carouselsToReset = new Set();
let carouselFlushScheduled = false;

function queueCarouselReset(carousel, reason) {
  if (!carousel) return;

  log("queue carousel reset:", reason, carousel);
  carouselsToReset.add(carousel);
  scheduleCarouselFlush();
}

function scheduleCarouselFlush() {
  if (carouselFlushScheduled) return;
  carouselFlushScheduled = true;

  requestAnimationFrame(() => {
    carouselFlushScheduled = false;

    const carousels = [...carouselsToReset];

    carouselsToReset.clear();

    for (const el of carousels) {
      if (!el.isConnected) {
        log("skipping detached carousel", el);
        continue;
      }

      log("destroying + re-initialising carousel", el);
      destroyCarousel(el);
      setupCarousel(el);
    }
  });
}

function initNewCarousels(root) {
  const carousels = [];

  if (root.nodeType === Node.ELEMENT_NODE) {
    if (root.classList?.contains("carousel") && !root.hasAttribute("data-embla-initialized")) {
      carousels.push(root);
    }

    root
      .querySelectorAll(".carousel:not([data-embla-initialized])")
      .forEach((el) => carousels.push(el));
  }

  for (const el of carousels) {
    log("initialising new carousel", el);
    setupCarousel(el);
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const { type, target, attributeName } = mutation;

    if (type === "attributes") {
      if (BENTO_BOX_ATTRS.includes(attributeName)) {
        syncBentoBoxSpans(target);
        continue;
      }

      if (
        CAROUSEL_INNER_ATTRS.includes(attributeName) &&
        target instanceof Element &&
        target.classList.contains("carousel-inner")
      ) {
        queueCarouselReset(target.closest(".carousel"), `attr:${attributeName}`);
        continue;
      }
    }

    if (type === "childList") {
      if (target instanceof Element && target.classList.contains("track")) {
        queueCarouselReset(target.closest(".carousel"), "slides changed");
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node.dataset?.colSpan || node.dataset?.rowSpan) {
          syncBentoBoxSpans(node);
        }

        for (const child of node.querySelectorAll("[data-col-span], [data-row-span]")) {
          syncBentoBoxSpans(child);
        }

        initNewCarousels(node);
      }
    }
  }
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: [...BENTO_BOX_ATTRS, ...CAROUSEL_INNER_ATTRS],
  childList: true,
  subtree: true,
});

// Initialise any carousels already in the editor DOM.
setupAllCarousels();

log("observer active", {
  bentoAttrs: BENTO_BOX_ATTRS,
  carouselAttrs: CAROUSEL_INNER_ATTRS,
});
