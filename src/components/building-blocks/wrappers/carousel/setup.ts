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
  // A sibling of .controls-wrapper, not a child — it's a full-width strip.
  const thumbnailsContainer = inner?.querySelector<HTMLElement>(".carousel-thumbnails");

  if (!inner || !viewport || !track || !slides || !slides.length) {
    // Silently skip: in the CloudCannon editor the inner DOM can be
    // briefly incomplete while content loads; the live-sync observer
    // will re-run setup once slides are inserted.
    if (import.meta.env.DEV) {
      console.debug("Carousel: skipping setup, required elements missing", carousel);
    }
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

  // Embla moves slides with JS, so the global reduced-motion CSS rule
  // can't stop it; manual navigation still works without the plugins.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (inner.hasAttribute("data-autoplay") && !prefersReducedMotion) {
    const autoplayInterval = Number(inner.getAttribute("data-autoplay")) * 1000 || 3000;
    // With `stopOnInteraction: false`, `stopOnMouseEnter` pauses autoplay on
    // mouseenter and resumes it on mouseleave (pause-on-hover behaviour).
    const pauseOnHover = inner.getAttribute("data-pause-on-hover") === "true";

    plugins.push(
      Autoplay({
        delay: autoplayInterval,
        stopOnInteraction: false,
        stopOnMouseEnter: pauseOnHover,
        stopOnFocusIn: true,
      })
    );
  }

  let watchDrag = true;

  if (inner.hasAttribute("data-autoscroll") && !prefersReducedMotion) {
    const scrollValue = parseFloat(inner.getAttribute("data-autoscroll") || "1");
    const speed = isNaN(scrollValue) ? 1 : scrollValue;

    plugins.push(AutoScroll({ speed, stopOnFocusIn: true }));
    watchDrag = false;
  }

  const startIndex = Number(inner.getAttribute("data-start-index")) || 0;

  const embla = EmblaCarousel(
    viewport,
    {
      loop,
      slidesToScroll,
      align,
      watchDrag,
      duration: 20,
      startIndex,
      skipSnaps: false,
      inViewThreshold: 0.7,
    },
    plugins
  );

  carousel.setAttribute("data-embla-initialized", "true");
  carousel.__embla = embla;

  // Consumers listen for this instead of reaching into Embla. Fired on
  // init, selection, and reInit.
  const emitSelect = () => {
    carousel.dispatchEvent(
      new CustomEvent("carousel:select", {
        bubbles: true,
        detail: { index: embla.selectedScrollSnap(), total: embla.scrollSnapList().length },
      })
    );
  };

  embla.on("select", emitSelect);
  embla.on("reInit", emitSelect);
  emitSelect();

  const prevButton = inner.querySelector<HTMLButtonElement>(".prev > .button-inner");
  const nextButton = inner.querySelector<HTMLButtonElement>(".next > .button-inner");

  if (prevButton) prevButton.style.borderRadius = "var(--radius-full)";
  if (nextButton) nextButton.style.borderRadius = "var(--radius-full)";

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
        // A button, not a div: a dot is a control, and a div takes no focus.
        const dot = document.createElement("button");
        const selected = index === embla.selectedScrollSnap();

        dot.type = "button";
        dot.className = "indicator";
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.setAttribute("data-selected", selected.toString());
        if (selected) dot.setAttribute("aria-current", "true");
        dot.addEventListener("click", () => embla.scrollTo(index));
        indicatorsContainer.appendChild(dot);
      });
    };

    const updateSelectedDot = () => {
      indicatorsContainer.querySelectorAll(".indicator").forEach((dot, index) => {
        const isSelected = index === embla.selectedScrollSnap();

        dot.setAttribute("data-selected", isSelected.toString());
        if (isSelected) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    };

    embla.on("select", updateSelectedDot);
    embla.on("reInit", renderDots);
    renderDots();
  }

  const motion = embla.plugins().autoplay ?? embla.plugins().autoScroll;

  if (motion && controlsWrapper) {
    // WCAG 2.2.2: movement that starts on its own and runs past five seconds
    // needs a control to stop it. Hover and focus only pause it while they
    // last, so neither counts.
    const pause = document.createElement("button");
    const setLabel = () => {
      const playing = motion.isPlaying();

      pause.textContent = playing ? "Pause" : "Play";
      pause.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow");
    };

    pause.type = "button";
    pause.className = "carousel-pause";
    setLabel();
    pause.addEventListener("click", () => {
      if (motion.isPlaying()) motion.stop();
      else motion.play();
      setLabel();
    });
    controlsWrapper.appendChild(pause);
  }

  if (thumbnailsContainer) {
    // One thumbnail per scroll snap, imaged from the snap's slide. Meaningful
    // when each snap is one slide (the lightbox/product-gallery shape); a
    // slide with no <img> falls back to a numbered button.
    const renderThumbnails = () => {
      thumbnailsContainer.innerHTML = "";

      embla.scrollSnapList().forEach((_, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "carousel-thumbnail";
        button.setAttribute("aria-label", `Go to slide ${index + 1}`);
        button.setAttribute("data-selected", (index === embla.selectedScrollSnap()).toString());

        const slideImg = slides[index]?.querySelector("img");

        if (slideImg) {
          const thumb = document.createElement("img");

          thumb.src = slideImg.currentSrc || slideImg.src;
          thumb.alt = "";
          thumb.loading = "lazy";
          button.appendChild(thumb);
        } else {
          button.textContent = String(index + 1);
        }

        button.addEventListener("click", () => embla.scrollTo(index));
        thumbnailsContainer.appendChild(button);
      });
    };

    const updateSelectedThumbnail = () => {
      thumbnailsContainer.querySelectorAll(".carousel-thumbnail").forEach((button, index) => {
        button.setAttribute("data-selected", (index === embla.selectedScrollSnap()).toString());
      });
    };

    embla.on("select", updateSelectedThumbnail);
    embla.on("reInit", renderThumbnails);
    renderThumbnails();
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
