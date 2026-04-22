/**
 * Syncs DOM changes in the CloudCannon editor to component runtime state.
 *
 * This works around CloudCannon's inability to re-render props on a
 * component's root element, and re-initializes components like the
 * carousel whose JS state is not reactive to prop changes.
 *
 * Flip DEBUG to `true` to see what mutations the editor is producing.
 */

const DEBUG = true;

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

function resetCarousel(carousel, reason) {
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

      const embla = el.__embla;

      if (embla) {
        log("destroying existing embla", el);
        try {
          embla.destroy();
        } catch (err) {
          log("embla.destroy() threw", err);
        }
        delete el.__embla;
      }

      el.removeAttribute("data-embla-initialized");
    }

    log("dispatching carousel:setup");
    document.dispatchEvent(new CustomEvent("carousel:setup"));
  });
}

function nodeHasNewCarousel(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;

  if (node.classList?.contains("carousel") && !node.hasAttribute("data-embla-initialized")) {
    return true;
  }

  return !!node.querySelector?.(".carousel:not([data-embla-initialized])");
}

const observer = new MutationObserver((mutations) => {
  let shouldSetupNewCarousels = false;

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
        resetCarousel(target.closest(".carousel"), `attr:${attributeName}`);
        continue;
      }
    }

    if (type === "childList") {
      if (target instanceof Element && target.classList.contains("track")) {
        resetCarousel(target.closest(".carousel"), "slides changed");
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node.dataset?.colSpan || node.dataset?.rowSpan) {
          syncBentoBoxSpans(node);
        }

        for (const child of node.querySelectorAll("[data-col-span], [data-row-span]")) {
          syncBentoBoxSpans(child);
        }

        if (nodeHasNewCarousel(node)) {
          shouldSetupNewCarousels = true;
        }
      }
    }
  }

  if (shouldSetupNewCarousels) {
    log("new carousel detected in DOM, dispatching carousel:setup");
    document.dispatchEvent(new CustomEvent("carousel:setup"));
  }
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: [...BENTO_BOX_ATTRS, ...CAROUSEL_INNER_ATTRS],
  childList: true,
  subtree: true,
});

log("observer active", {
  bentoAttrs: BENTO_BOX_ATTRS,
  carouselAttrs: CAROUSEL_INNER_ATTRS,
});

export {};
