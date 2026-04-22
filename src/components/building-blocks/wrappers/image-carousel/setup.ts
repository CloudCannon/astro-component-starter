/**
 * Shared Embla setup logic for the ImageCarousel component.
 *
 * Used by:
 * - `ImageCarousel.astro`'s inline `<script>` on the live site
 * - `editor-live-sync.js` in the CloudCannon editor, because CC's
 *   editable-regions renderer uses `renderToStaticMarkup` and does
 *   not execute inline scripts, so we need to initialize carousels
 *   from the live-sync script in that context.
 */

import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";

export interface ImageCarouselElement extends HTMLElement {
  __embla?: EmblaCarouselType;
}

export function setupImageCarousel(carousel: ImageCarouselElement): void {
  if (carousel.hasAttribute("data-embla-initialized")) return;

  const mainViewport = carousel.querySelector<HTMLElement>(".main-viewport");
  const mainTrack = mainViewport?.querySelector<HTMLElement>(".main-track");
  const mainSlides = mainTrack?.querySelectorAll<HTMLElement>(".main-slide");
  const thumbButtons = carousel.querySelectorAll<HTMLButtonElement>(".thumb");

  if (!mainViewport || !mainTrack || !mainSlides?.length || !thumbButtons.length) {
    // Silently skip: in the CloudCannon editor the inner DOM can be
    // briefly incomplete while content loads; the live-sync observer
    // will re-run setup once images are inserted.
    if (import.meta.env.DEV) {
      console.debug("ImageCarousel: skipping setup, required elements missing", carousel);
    }
    return;
  }

  syncThumbnailSources(mainSlides, thumbButtons);

  const loop = carousel.getAttribute("data-loop") !== "false";

  const mainEmbla = EmblaCarousel(mainViewport, {
    loop,
    align: "start",
    duration: 20,
    startIndex: 0,
    skipSnaps: false,
  });

  carousel.setAttribute("data-embla-initialized", "true");
  carousel.__embla = mainEmbla;

  let isInitialUpdate = true;

  const updateSelectedThumb = () => {
    const selected = mainEmbla.selectedScrollSnap();

    thumbButtons.forEach((btn, i) => {
      const isSelected = i === selected;

      btn.setAttribute("data-selected", isSelected.toString());

      if (isSelected && !isInitialUpdate) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });

    isInitialUpdate = false;
  };

  thumbButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      mainEmbla.scrollTo(index);
    });
  });

  mainEmbla.on("select", updateSelectedThumb);

  const prevButton = carousel.querySelector<HTMLButtonElement>(".arrow-prev .button-inner");
  const nextButton = carousel.querySelector<HTMLButtonElement>(".arrow-next .button-inner");

  if (prevButton) prevButton.addEventListener("click", () => mainEmbla.scrollPrev());
  if (nextButton) nextButton.addEventListener("click", () => mainEmbla.scrollNext());

  updateSelectedThumb();
}

export function setupAllImageCarousels(root: ParentNode = document): void {
  root
    .querySelectorAll<ImageCarouselElement>(".image-carousel")
    .forEach((el) => setupImageCarousel(el));
}

/**
 * Mirror each main-slide `<img>` src onto its matching thumbnail.
 *
 * Thumbnails deliberately aren't marked `data-editable="image"`, so
 * the CloudCannon editor doesn't rewrite their src to its session
 * file URL, and `astro:assets` build-time resolution doesn't run
 * in the editor either — leaving thumbnails with the raw `/src/...`
 * path which 404s. The main slide's img has already been rewritten
 * by CC (or by Astro at build time on the live site), so we copy
 * that src across.
 *
 * Guarded by a `/src/` prefix check so this is a no-op on the live
 * site, where the thumbnail src is already a valid Astro-built URL.
 */
function syncThumbnailSources(
  mainSlides: NodeListOf<HTMLElement>,
  thumbButtons: NodeListOf<HTMLButtonElement>
): void {
  thumbButtons.forEach((btn, index) => {
    const thumbImg = btn.querySelector<HTMLImageElement>("img");
    const mainImg = mainSlides[index]?.querySelector<HTMLImageElement>("img");

    if (!thumbImg || !mainImg) return;

    const thumbSrc = thumbImg.getAttribute("src") ?? "";

    if (!thumbSrc.startsWith("/src/")) return;

    const resolvedSrc = mainImg.getAttribute("src");

    if (resolvedSrc && resolvedSrc !== thumbSrc) {
      thumbImg.src = resolvedSrc;
    }
  });
}

export function destroyImageCarousel(carousel: ImageCarouselElement): void {
  const embla = carousel.__embla;

  if (embla) {
    try {
      embla.destroy();
    } catch (err) {
      console.warn("ImageCarousel destroy failed", err);
    }
    delete carousel.__embla;
  }

  carousel.removeAttribute("data-embla-initialized");
}
