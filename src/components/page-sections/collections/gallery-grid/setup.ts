import { setupModalShell } from "../../../building-blocks/wrappers/modal/setup";

const SWIPE_THRESHOLD_PX = 40;

export function setupGallery(root: HTMLElement): void {
  const popover = root.querySelector<HTMLElement>(".gallery-lightbox");

  if (!popover) return;

  // Flag the lightbox, not the root: the root survives an editor re-render that replaces the tiles.
  if (popover.hasAttribute("data-gallery-initialized")) return;
  popover.setAttribute("data-gallery-initialized", "");

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

  if (figure && total > 1) {
    const isZoomed = () => (window.visualViewport?.scale ?? 1) > 1.01;

    window.visualViewport?.addEventListener("resize", () => {
      figure.classList.toggle("is-zoomed", isZoomed());
    });

    figure.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("button") || isZoomed()) return;
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

  // The overlay fills the viewport, so the popover's light dismiss never fires.
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

  // No `popovertarget` trigger, so the shell has nowhere to return focus.
  popover.addEventListener("toggle", (e) => {
    if ((e as ToggleEvent).newState === "closed") openedFrom?.focus();
  });
}

export function setupAllGalleries(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".gallery-grid").forEach((el) => setupGallery(el));
}
