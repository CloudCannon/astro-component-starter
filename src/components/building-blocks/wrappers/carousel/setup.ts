/**
 * Shared Embla setup logic for the Carousel component.
 *
 * Used by:
 * - `Carousel.astro`'s inline `<script>` on the live site
 * - `editor-live-sync.js` in the CloudCannon editor, because CC's
 *   editable-regions renderer uses `renderToStaticMarkup` and does
 *   not execute inline scripts, so we need to initialize carousels
 *   from the live-sync script in that context.
 */

import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import Autoplay from "embla-carousel-autoplay";

export interface CarouselElement extends HTMLElement {
  __embla?: EmblaCarouselType;
}

export function setupCarousel(carousel: CarouselElement): void {
  if (carousel.hasAttribute("data-embla-initialized")) return;

  const inner = carousel.querySelector<HTMLElement>(".carousel-inner");
  const viewport = inner?.querySelector<HTMLElement>(".viewport");
  const track = viewport?.querySelector<HTMLElement>(".track");
  const slides = track?.querySelectorAll<HTMLElement>(".slide");
  const controlsWrapper = inner?.querySelector<HTMLElement>(".controls-wrapper");
  const indicatorsContainer = controlsWrapper?.querySelector<HTMLElement>(".indicators");
  const fractionEl = controlsWrapper?.querySelector<HTMLElement>(".carousel-fraction");

  if (!inner || !viewport || !track || !slides || !slides.length) {
    console.warn("Carousel: Missing required elements");
    return;
  }

  const loop = inner.getAttribute("data-loop") !== "false";
  const slidesToScroll = inner.hasAttribute("data-slides-to-scroll")
    ? Number(inner.getAttribute("data-slides-to-scroll")) || "auto"
    : "auto";
  const alignAttr = inner.getAttribute("data-align");
  const align =
    alignAttr === "start" || alignAttr === "center" || alignAttr === "end"
      ? (alignAttr as "start" | "center" | "end")
      : "start";

  const plugins = [];
  if (inner.hasAttribute("data-autoplay")) {
    const autoplayInterval = Number(inner.getAttribute("data-autoplay")) * 1000 || 3000;
    plugins.push(Autoplay({ delay: autoplayInterval, stopOnInteraction: false }));
  }

  let watchDrag = true;
  if (inner.hasAttribute("data-autoscroll")) {
    const scrollValue = parseFloat(inner.getAttribute("data-autoscroll") || "1");
    const speed = isNaN(scrollValue) ? 1 : scrollValue;
    plugins.push(AutoScroll({ speed }));
    watchDrag = false;
  }

  const embla = EmblaCarousel(
    viewport,
    {
      loop,
      slidesToScroll,
      align,
      watchDrag,
      duration: 20,
      startIndex: 0,
      skipSnaps: false,
      inViewThreshold: 0.7,
    },
    plugins
  );

  carousel.setAttribute("data-embla-initialized", "true");
  carousel.__embla = embla;

  const prevButton = inner.querySelector<HTMLButtonElement>(".prev > .button-inner");
  const nextButton = inner.querySelector<HTMLButtonElement>(".next > .button-inner");

  if (prevButton) prevButton.style.borderRadius = "9999px";
  if (nextButton) nextButton.style.borderRadius = "9999px";

  const updateButtons = () => {
    if (prevButton) prevButton.disabled = !embla.canScrollPrev();
    if (nextButton) nextButton.disabled = !embla.canScrollNext();
  };

  updateButtons();
  embla.on("select", updateButtons);
  if (prevButton) prevButton.addEventListener("click", () => embla.scrollPrev());
  if (nextButton) nextButton.addEventListener("click", () => embla.scrollNext());

  if (indicatorsContainer) {
    const renderDots = () => {
      indicatorsContainer.innerHTML = "";
      embla.scrollSnapList().forEach((_, index) => {
        const dot = document.createElement("div");
        dot.className = "indicator";
        dot.setAttribute("data-selected", (index === embla.selectedScrollSnap()).toString());
        dot.addEventListener("click", () => embla.scrollTo(index));
        indicatorsContainer.appendChild(dot);
      });
    };

    const updateSelectedDot = () => {
      indicatorsContainer.querySelectorAll(".indicator").forEach((dot, index) => {
        const isSelected = index === embla.selectedScrollSnap();
        dot.setAttribute("data-selected", isSelected.toString());
      });
    };

    embla.on("select", updateSelectedDot);
    embla.on("reInit", renderDots);
    renderDots();
  }

  if (fractionEl) {
    const updateFraction = () => {
      const snaps = embla.scrollSnapList().length;
      const current = embla.selectedScrollSnap() + 1;
      const safeTotal = Math.max(snaps, 1);
      const safeCurrent = Math.min(current, safeTotal);
      fractionEl.textContent = `${safeCurrent}/${safeTotal}`;
      fractionEl.setAttribute("aria-label", `Slide ${safeCurrent} of ${safeTotal}`);
    };

    embla.on("select", updateFraction);
    embla.on("reInit", updateFraction);
    updateFraction();
  }
}

export function setupAllCarousels(root: ParentNode = document): void {
  root.querySelectorAll<CarouselElement>(".carousel").forEach((el) => setupCarousel(el));
}

export function destroyCarousel(carousel: CarouselElement): void {
  const embla = carousel.__embla;

  if (embla) {
    try {
      embla.destroy();
    } catch (err) {
      console.warn("Carousel destroy failed", err);
    }
    delete carousel.__embla;
  }

  carousel.removeAttribute("data-embla-initialized");
}
