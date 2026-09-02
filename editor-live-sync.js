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
 *      (e.g. Carousel / ImageCarousel Embla setup, Modal focus trap,
 *      Video's lite-youtube / lite-vimeo custom elements)
 *      never initialise in the editor, so we initialise them here instead.
 *
 * Logs editor mutations to the console in dev; silent in production.
 */

import {
  destroyCarousel,
  setupAllCarousels,
  setupCarousel,
} from "./src/components/building-blocks/wrappers/carousel/setup";
import {
  destroyImageCarousel,
  setupAllImageCarousels,
  setupImageCarousel,
} from "./src/components/building-blocks/wrappers/image-carousel/setup";
import {
  setupAllContentSelectors,
  setupContentSelector,
} from "./src/components/building-blocks/wrappers/content-selector/setup";
import {
  setupAllModals,
  setupModalShell,
} from "./src/components/building-blocks/wrappers/modal/setup";
import { setupAllVideos } from "./src/components/building-blocks/core-elements/video/setup";
import { setupAllMainNavs } from "./src/components/navigation/main-nav/setup";
import { setupAllSearch, setupSearch } from "./src/components/navigation/search/setup";
import { setupAllTocs, setupToc } from "./src/components/navigation/toc/setup";
import {
  setupAllGalleries,
  setupGallery,
} from "./src/components/page-sections/collections/gallery-grid/setup";
import {
  setupAllMasonry,
  setupMasonry,
} from "./src/components/building-blocks/wrappers/masonry/setup";

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
  "data-pause-on-hover",
  "data-autoscroll",
  "style",
];

/**
 * ImageCarousel only reads `data-loop` from its root for Embla config.
 * Image list and arrow visibility are rendered conditionally, so those
 * are handled via childList mutations below.
 */
const IMAGE_CAROUSEL_CONTENT_ATTRS = ["data-loop"];

function makeResetScheduler({ destroy, init, label }) {
  const pending = new Set();
  let scheduled = false;

  function queue(el, reason) {
    if (!el) return;

    log(`queue ${label} reset:`, reason, el);
    pending.add(el);

    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;

      const items = [...pending];

      pending.clear();

      for (const target of items) {
        if (!target.isConnected) {
          log(`skipping detached ${label}`, target);
          continue;
        }

        log(`destroying + re-initialising ${label}`, target);
        destroy(target);
        init(target);
      }
    });
  }

  return queue;
}

const queueCarouselReset = makeResetScheduler({
  destroy: destroyCarousel,
  init: setupCarousel,
  label: "carousel",
});

const queueImageCarouselReset = makeResetScheduler({
  destroy: destroyImageCarousel,
  init: setupImageCarousel,
  label: "image-carousel",
});

function initNewComponents(root) {
  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const newCarousels = [];

  if (root.classList?.contains("carousel") && !root.hasAttribute("data-embla-initialized")) {
    newCarousels.push(root);
  }

  root
    .querySelectorAll(".carousel:not([data-embla-initialized])")
    .forEach((el) => newCarousels.push(el));

  for (const el of newCarousels) {
    log("initialising new carousel", el);
    setupCarousel(el);
  }

  const newImageCarousels = [];

  if (root.classList?.contains("image-carousel") && !root.hasAttribute("data-embla-initialized")) {
    newImageCarousels.push(root);
  }

  root
    .querySelectorAll(".image-carousel:not([data-embla-initialized])")
    .forEach((el) => newImageCarousels.push(el));

  for (const el of newImageCarousels) {
    log("initialising new image-carousel", el);
    setupImageCarousel(el);
  }

  const newModals = [];

  if (root.classList?.contains("modal-popover") && !root.hasAttribute("data-modal-initialized")) {
    newModals.push(root);
  }

  root
    .querySelectorAll(".modal-popover:not([data-modal-initialized])")
    .forEach((el) => newModals.push(el));

  for (const el of newModals) {
    log("initialising new modal", el);
    setupModalShell(el);
  }

  const newSearch = [];

  if (root.classList?.contains("search") && !root.hasAttribute("data-search-initialized")) {
    newSearch.push(root);
  }

  root
    .querySelectorAll(".search:not([data-search-initialized])")
    .forEach((el) => newSearch.push(el));

  for (const el of newSearch) {
    log("initialising new search", el);
    setupSearch(el);
  }

  const newTocs = [];

  if (root.classList?.contains("toc") && !root.hasAttribute("data-toc-initialized")) {
    newTocs.push(root);
  }

  root.querySelectorAll(".toc:not([data-toc-initialized])").forEach((el) => newTocs.push(el));

  for (const el of newTocs) {
    log("initialising new toc", el);
    setupToc(el);
  }

  const newGalleries = [];

  if (root.classList?.contains("gallery-grid") && !root.hasAttribute("data-gallery-initialized")) {
    newGalleries.push(root);
  }

  root
    .querySelectorAll(".gallery-grid:not([data-gallery-initialized])")
    .forEach((el) => newGalleries.push(el));

  for (const el of newGalleries) {
    log("initialising new gallery", el);
    setupGallery(el);
  }

  const newMasonry = [];

  if (root.classList?.contains("masonry") && !root.hasAttribute("data-masonry-initialized")) {
    newMasonry.push(root);
  }

  root
    .querySelectorAll(".masonry:not([data-masonry-initialized])")
    .forEach((el) => newMasonry.push(el));

  for (const el of newMasonry) {
    log("initialising new masonry", el);
    setupMasonry(el);
  }

  const newContentSelectors = [];

  if (root.classList?.contains("content-selector-items")) {
    newContentSelectors.push(root);
  }

  root.querySelectorAll(".content-selector-items").forEach((el) => newContentSelectors.push(el));

  for (const el of newContentSelectors) {
    log("initialising new content selector", el);
    setupContentSelector(el);
  }

  setupAllVideos(root);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const { type, target, attributeName } = mutation;

    if (type === "attributes") {
      if (BENTO_BOX_ATTRS.includes(attributeName)) {
        syncBentoBoxSpans(target);
        continue;
      }

      if (!(target instanceof Element)) continue;

      if (
        CAROUSEL_INNER_ATTRS.includes(attributeName) &&
        target.classList.contains("carousel-inner")
      ) {
        queueCarouselReset(target.closest(".carousel"), `attr:${attributeName}`);
        continue;
      }

      if (
        IMAGE_CAROUSEL_CONTENT_ATTRS.includes(attributeName) &&
        target.classList.contains("carousel-content")
      ) {
        queueImageCarouselReset(target.closest(".image-carousel"), `attr:${attributeName}`);
        continue;
      }
    }

    if (type === "childList") {
      if (target instanceof Element) {
        if (target.classList.contains("track")) {
          queueCarouselReset(target.closest(".carousel"), "slides changed");
        }

        if (target.classList.contains("main-track") || target.classList.contains("thumbs-strip")) {
          queueImageCarouselReset(target.closest(".image-carousel"), "images changed");
        }

        if (target.classList.contains("image-carousel")) {
          // showArrows toggles .arrow-prev / .arrow-next in/out
          queueImageCarouselReset(target, "arrows toggled");
        }
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node.dataset?.colSpan || node.dataset?.rowSpan) {
          syncBentoBoxSpans(node);
        }

        for (const child of node.querySelectorAll("[data-col-span], [data-row-span]")) {
          syncBentoBoxSpans(child);
        }

        initNewComponents(node);
      }
    }
  }
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: [...BENTO_BOX_ATTRS, ...CAROUSEL_INNER_ATTRS, ...IMAGE_CAROUSEL_CONTENT_ATTRS],
  childList: true,
  subtree: true,
});

setupAllCarousels();
setupAllImageCarousels();
setupAllMainNavs();
setupAllModals();
setupAllSearch();
setupAllTocs();
setupAllGalleries();
setupAllMasonry();
setupAllContentSelectors();
setupAllVideos();

log("observer active", {
  bentoAttrs: BENTO_BOX_ATTRS,
  carouselAttrs: CAROUSEL_INNER_ATTRS,
  imageCarouselAttrs: IMAGE_CAROUSEL_CONTENT_ATTRS,
});
