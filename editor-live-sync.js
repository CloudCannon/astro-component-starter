/**
 * Syncs data attributes on child elements to parent styles in the
 * CloudCannon editor. This works around CloudCannon's inability to
 * re-render props on a component's root element.
 */

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

const pendingCarouselReinits = new Set();
let carouselReinitScheduled = false;

function scheduleCarouselReinit(carousel) {
  if (!carousel || !carousel.hasAttribute("data-embla-initialized")) return;

  pendingCarouselReinits.add(carousel);

  if (carouselReinitScheduled) return;
  carouselReinitScheduled = true;

  requestAnimationFrame(() => {
    carouselReinitScheduled = false;

    const carousels = Array.from(pendingCarouselReinits);

    pendingCarouselReinits.clear();

    for (const el of carousels) {
      if (!el.isConnected) continue;
      el.dispatchEvent(new CustomEvent("carousel:reinit"));
    }
  });
}

function findCarouselFromInner(inner) {
  return inner.closest(".carousel");
}

function findCarouselFromTrack(track) {
  return track.closest(".carousel");
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
        scheduleCarouselReinit(findCarouselFromInner(target));
        continue;
      }
    }

    if (type === "childList") {
      if (target instanceof Element && target.classList.contains("track")) {
        scheduleCarouselReinit(findCarouselFromTrack(target));
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node.dataset?.colSpan || node.dataset?.rowSpan) {
          syncBentoBoxSpans(node);
        }

        for (const child of node.querySelectorAll("[data-col-span], [data-row-span]")) {
          syncBentoBoxSpans(child);
        }
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

export {};
