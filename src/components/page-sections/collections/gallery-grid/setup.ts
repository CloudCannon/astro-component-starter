/**
 * Masonry layout + lightbox for GalleryGrid (`.gallery-grid`). Used by
 * `GalleryGrid.astro`'s inline script and by `editor-live-sync.js`, where
 * inline scripts don't run. Masonry comes from the shared `masonryEnhance`
 * util; the lightbox is a `.modal-popover`, so focus trapping and scroll
 * locking come from the shared modal setup.
 */

import { setupModalShell } from "../../../building-blocks/wrappers/modal/setup";
import { enhanceMasonryLayout } from "../../../utils/masonryEnhance";

const SWIPE_THRESHOLD_PX = 40;

export function setupGallery(root: HTMLElement): void {
  if (root.hasAttribute("data-gallery-initialized")) return;
  root.setAttribute("data-gallery-initialized", "");

  const masonryList = root.querySelector<HTMLElement>(".gallery-items.masonry");

  if (masonryList) enhanceMasonryLayout(masonryList, masonryList);

  const popover = root.querySelector<HTMLElement>(".gallery-lightbox");

  if (!popover) return; // lightbox turned off — tiles are static figures

  setupModalShell(popover);

  const tiles = Array.from(root.querySelectorAll<HTMLElement>("button.gallery-tile"));
  const figure = popover.querySelector<HTMLElement>(".gallery-lightbox-figure");
  const photos = Array.from(popover.querySelectorAll<HTMLElement>(".gallery-lightbox-photo"));
  const caption = popover.querySelector<HTMLElement>(".gallery-lightbox-caption");
  const counter = popover.querySelector<HTMLElement>(".gallery-lightbox-counter");
  const thumbs = Array.from(popover.querySelectorAll<HTMLElement>(".gallery-lightbox-thumb"));
  const total = photos.length;

  let current = 0;
  let openedFrom: HTMLElement | null = null;
  let pointerStartX: number | null = null;
  let didSwipe = false;

  const applyFigureAspect = (photo: HTMLElement | undefined) => {
    if (!figure || !photo) return;

    const img = photo.querySelector("img");

    if (!img) return;

    const width = img.naturalWidth || Number(img.getAttribute("width"));
    const height = img.naturalHeight || Number(img.getAttribute("height"));

    if (width > 0 && height > 0) {
      figure.style.setProperty("--gallery-photo-aspect", String(width / height));
    }
  };

  const show = (index: number, instant = false) => {
    if (!total) return;

    current = ((index % total) + total) % total;

    if (instant) figure?.classList.add("is-instant");

    applyFigureAspect(photos[current]);
    photos.forEach((photo, i) => {
      const active = i === current;

      photo.setAttribute("data-active", String(active));
      photo.setAttribute("aria-hidden", String(!active));
    });

    const text = photos[current]?.dataset.caption ?? "";

    if (caption) {
      caption.textContent = text;
      caption.hidden = !text;
    }

    if (counter) counter.textContent = `${current + 1} / ${total}`;

    thumbs.forEach((thumb, i) => {
      const selected = i === current;

      thumb.setAttribute("data-selected", String(selected));
      if (selected) thumb.setAttribute("aria-current", "true");
      else thumb.removeAttribute("aria-current");
    });

    if (instant && figure) {
      void figure.offsetWidth;
      figure.classList.remove("is-instant");
    }
  };

  photos.forEach((photo) => {
    photo.querySelector("img")?.addEventListener("load", () => {
      if (photo === photos[current]) applyFigureAspect(photo);
    });
  });

  applyFigureAspect(photos[0]);

  const step = (delta: number) => show(current + delta);

  tiles.forEach((tile, index) => {
    tile.addEventListener("click", () => {
      openedFrom = tile;
      show(index, true);
      popover.showPopover();
    });
  });

  popover
    .querySelector<HTMLElement>(".gallery-lightbox-prev")
    ?.addEventListener("click", () => step(-1));
  popover
    .querySelector<HTMLElement>(".gallery-lightbox-next")
    ?.addEventListener("click", () => step(1));

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => show(index));
  });

  popover.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // Horizontal swipe on the photo (no extra dependency — the repo has no
  // standalone gesture helper now that the lightbox no longer wraps Carousel).
  if (figure && total > 1) {
    figure.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      pointerStartX = e.clientX;
      figure.setPointerCapture(e.pointerId);
    });

    figure.addEventListener("pointerup", (e) => {
      if (pointerStartX == null) return;

      const dx = e.clientX - pointerStartX;

      pointerStartX = null;
      if (Math.abs(dx) <= SWIPE_THRESHOLD_PX) return;

      didSwipe = true;
      if (dx > 0) step(-1);
      else step(1);
    });

    figure.addEventListener("pointercancel", () => {
      pointerStartX = null;
    });
  }

  // The overlay fills the viewport, so the popover API's light dismiss never
  // fires — a click on the dark surround closes instead. Clicks on the photo
  // (including through the pointer-events: none scrim), its controls, or
  // the thumbnail strip stay inside the frame.
  popover.addEventListener("click", (e) => {
    if (didSwipe) {
      didSwipe = false;

      return;
    }

    const target = e.target as HTMLElement;

    if (target.closest(".gallery-lightbox-frame")) return;

    popover.hidePopover();
  });

  popover
    .querySelector<HTMLElement>(".gallery-lightbox-close")
    ?.addEventListener("click", () => popover.hidePopover());

  // With no outside `popovertarget` trigger, the shell's toggle handler has
  // nowhere to restore focus to — this one returns it to the clicked tile.
  popover.addEventListener("toggle", (e) => {
    if ((e as ToggleEvent).newState === "closed") openedFrom?.focus();
  });
}

export function setupAllGalleries(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".gallery-grid").forEach((el) => setupGallery(el));
}
