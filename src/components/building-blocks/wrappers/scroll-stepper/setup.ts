const desktopQuery = "(min-width: 768px)";

function isStacked(stepper: HTMLElement): boolean {
  const layout = stepper.querySelector<HTMLElement>(".scroll-stepper-layout");

  if (!layout) return false;

  return (
    getComputedStyle(layout).getPropertyValue("--scroll-stepper-layout-mode").trim() === "stack"
  );
}

function setActive(stepper: HTMLElement, index: number): void {
  const panels = [...stepper.querySelectorAll<HTMLElement>(".scroll-stepper-media-panel")];
  const steps = [
    ...stepper.querySelectorAll<HTMLElement>(".scroll-stepper-steps > .scroll-stepper-step"),
  ];
  const dots = [...stepper.querySelectorAll<HTMLElement>(".scroll-stepper-progress-dot")];
  const activeIndex = Math.max(0, Math.min(index, panels.length - 1));

  panels.forEach((panel, panelIndex) => {
    const active = panelIndex === activeIndex;

    panel.toggleAttribute("data-active", active);
    panel.setAttribute("aria-hidden", String(!active));
  });
  steps.forEach((step, stepIndex) => {
    const active = stepIndex === activeIndex;

    step.toggleAttribute("data-active", active);
    step.setAttribute("aria-hidden", String(!active));
  });
  dots.forEach((dot, dotIndex) => dot.toggleAttribute("data-active", dotIndex === activeIndex));
}

function scrollport(track: HTMLElement): HTMLElement | null {
  let ancestor = track.parentElement;

  while (ancestor) {
    const { overflowY } = getComputedStyle(ancestor);

    if (
      ["auto", "scroll", "overlay"].includes(overflowY) &&
      ancestor.scrollHeight > ancestor.clientHeight
    ) {
      return ancestor;
    }

    ancestor = ancestor.parentElement;
  }

  return null;
}

function mediaCenter(stepper: HTMLElement): number {
  const media = stepper.querySelector<HTMLElement>(".scroll-stepper-media");

  if (!media) return window.innerHeight / 2;

  const bounds = media.getBoundingClientRect();

  return bounds.top + bounds.height / 2;
}

function screenBottom(stepper: HTMLElement): number {
  const media = stepper.querySelector<HTMLElement>(".scroll-stepper-media");
  const port = media ? scrollport(media) : null;

  return port ? port.getBoundingClientRect().bottom : window.innerHeight;
}

function activationPoint(stepper: HTMLElement, scene: HTMLElement): number {
  const track = stepper.querySelector<HTMLElement>(".scroll-stepper-steps");

  if (track?.classList.contains("height-screen")) return screenBottom(stepper);

  return track?.classList.contains("height-content")
    ? mediaCenter(stepper) + scene.getBoundingClientRect().height / 2
    : mediaCenter(stepper);
}

function updateActive(stepper: HTMLElement, scenes: HTMLElement[]): void {
  const track = stepper.querySelector<HTMLElement>(".scroll-stepper-steps");
  const activeIndex = scenes.reduce((currentIndex, scene, index) => {
    const content = scene.querySelector<HTMLElement>(".scroll-stepper-step-content");

    const contentBounds = content?.getBoundingClientRect();
    const position = track?.classList.contains("height-screen")
      ? contentBounds?.top
      : contentBounds && contentBounds.top + contentBounds.height / 2;

    return position !== undefined && position <= activationPoint(stepper, scene)
      ? index
      : currentIndex;
  }, 0);

  setActive(stepper, activeIndex);
}

function updateProgress(stepper: HTMLElement, scenes: HTMLElement[]): void {
  const first = scenes[0];
  const last = scenes[scenes.length - 1];

  if (!first || !last) return;

  const firstContent = first.querySelector<HTMLElement>(".scroll-stepper-step-content");
  const lastContent = last.querySelector<HTMLElement>(".scroll-stepper-step-content");

  if (!firstContent || !lastContent) return;

  const firstBounds = firstContent.getBoundingClientRect();
  const lastBounds = lastContent.getBoundingClientRect();
  const firstCenter = firstBounds.top + firstBounds.height / 2;
  const lastCenter = lastBounds.top + lastBounds.height / 2;
  const start = stepper.__scrollStepperProgressStart ?? firstCenter;
  const end = activationPoint(stepper, last) - (lastCenter - firstCenter);
  const distance = start - end;
  const progress = distance ? Math.max(0, Math.min(1, (start - firstCenter) / distance)) : 0;

  stepper.__scrollStepperProgressStart = start;
  stepper.style.setProperty("--scroll-stepper-progress", String(progress));
}

// A custom property computes to its raw authored value ("5rem"), so it's resolved via a probe.
function resolveNavHeight(stepper: HTMLElement): number {
  const probe = document.createElement("div");

  probe.style.cssText = "position:absolute;visibility:hidden;height:var(--main-nav-height, 0px);";
  stepper.appendChild(probe);

  const navHeight = Number.parseFloat(getComputedStyle(probe).height);

  probe.remove();

  return Number.isFinite(navHeight) ? navHeight : 0;
}

function setTrailingRunway(stepper: HTMLElement, scenes: HTMLElement[]): void {
  const media = stepper.querySelector<HTMLElement>(".scroll-stepper-media");
  const first = scenes[0];
  const track = stepper.querySelector<HTMLElement>(".scroll-stepper-steps");

  if (!media || !first || !track) return;

  const port = scrollport(media);
  const navHeight = resolveNavHeight(stepper);
  const viewportHeight = port ? port.clientHeight : Math.max(0, window.innerHeight - navHeight);

  stepper.style.setProperty("--scroll-stepper-viewport-height", `${viewportHeight}px`);

  const mediaHeight = media.getBoundingClientRect().height;
  const last = scenes[scenes.length - 1] ?? first;
  const lastStepHeight = last.getBoundingClientRect().height;
  // Any more runway keeps the media stuck after the last step lands.
  const runway = track.classList.contains("height-content")
    ? Math.max((mediaHeight - lastStepHeight) / 2, 0)
    : Math.max(mediaHeight - lastStepHeight, 0);
  const content = first.querySelector<HTMLElement>(".scroll-stepper-step-content");
  const contentDelta =
    track.classList.contains("height-content") && content
      ? media.getBoundingClientRect().top +
        mediaHeight / 2 -
        (content.getBoundingClientRect().top + content.getBoundingClientRect().height / 2)
      : 0;
  const contentOffset = track.classList.contains("height-content")
    ? Math.max(
        0,
        (stepper.__scrollStepperContentOffset ?? 0) +
          (stepper.__scrollStepperContentOffsetSettled ? 0 : contentDelta)
      )
    : 0;

  stepper.__scrollStepperContentOffset = contentOffset;
  stepper.style.setProperty("--scroll-stepper-trailing-runway", `${runway}px`);
  stepper.style.setProperty("--scroll-stepper-content-offset", `${contentOffset}px`);

  if (track.classList.contains("height-content") && !stepper.__scrollStepperContentOffsetSettled) {
    // The offset settles over several frames; a baseline kept now starts the bar partway.
    stepper.__scrollStepperProgressStart = undefined;

    if (Math.abs(contentDelta) <= 1) {
      stepper.__scrollStepperContentOffsetSettled = true;
    } else if (!stepper.__scrollStepperContentOffsetFrame) {
      stepper.__scrollStepperContentOffsetFrame = requestAnimationFrame(() => {
        stepper.__scrollStepperContentOffsetFrame = undefined;
        setupScrollStepper(stepper);
      });
    }
  }

  // Not `top: 50%` + `translate: -50%`: before sticking, the translate lifts the media
  // above its container over the previous section.
  const visibleAreaTop = port ? 0 : navHeight;
  const stickyTop = visibleAreaTop + Math.max(0, (viewportHeight - mediaHeight) / 2);

  stepper.style.setProperty("--scroll-stepper-sticky-top", `${stickyTop}px`);
  stepper.style.setProperty("--scroll-stepper-sticky-translate", "none");
}

function showStaticGallery(stepper: HTMLElement): void {
  if (stepper.__scrollStepperOnScroll) {
    document.removeEventListener("scroll", stepper.__scrollStepperOnScroll, true);
    stepper.__scrollStepperOnScroll = undefined;
  }
  stepper.removeAttribute("data-scroll-stepper-initialized");
  stepper.__scrollStepperProgressStart = undefined;
  stepper.style.removeProperty("--scroll-stepper-progress");
  stepper.style.removeProperty("--scroll-stepper-trailing-runway");
  stepper.style.removeProperty("--scroll-stepper-content-offset");
  stepper.style.removeProperty("--scroll-stepper-viewport-height");
  stepper.style.removeProperty("--scroll-stepper-sticky-top");
  stepper.style.removeProperty("--scroll-stepper-sticky-translate");
  stepper.__scrollStepperContentOffset = undefined;
  stepper.__scrollStepperContentOffsetSettled = undefined;
  if (stepper.__scrollStepperContentOffsetFrame) {
    cancelAnimationFrame(stepper.__scrollStepperContentOffsetFrame);
    stepper.__scrollStepperContentOffsetFrame = undefined;
  }
  stepper
    .querySelectorAll(
      ".scroll-stepper-media-panel, .scroll-stepper-steps > .scroll-stepper-step, .scroll-stepper-progress-dot"
    )
    .forEach((item) => {
      item.removeAttribute("data-active");
      item.removeAttribute("aria-hidden");
    });
}

// ClientRouter navigation discards the stepper but not its `document`/MediaQueryList listeners.
function teardownIfDetached(stepper: HTMLElement): boolean {
  if (stepper.isConnected) return false;

  if (stepper.__scrollStepperOnScroll) {
    document.removeEventListener("scroll", stepper.__scrollStepperOnScroll, true);
    stepper.__scrollStepperOnScroll = undefined;
  }

  if (stepper.__scrollStepperOnMediaChange) {
    stepper.__scrollStepperMediaQuery?.removeEventListener(
      "change",
      stepper.__scrollStepperOnMediaChange
    );
    stepper.__scrollStepperOnMediaChange = undefined;
    stepper.__scrollStepperMediaQuery = undefined;
  }

  stepper.__scrollStepperResizeObserver?.disconnect();
  stepper.__scrollStepperResizeObserver = undefined;

  return true;
}

export function setupScrollStepper(stepper: HTMLElement): void {
  if (teardownIfDetached(stepper)) return;

  const scenes = [
    ...stepper.querySelectorAll<HTMLElement>(".scroll-stepper-steps > .scroll-stepper-step"),
  ];
  const panels = stepper.querySelectorAll(".scroll-stepper-media-panel");

  if (!stepper.__scrollStepperMediaQuery) {
    const mediaQuery = window.matchMedia(desktopQuery);
    const onMediaChange = () => setupScrollStepper(stepper);

    stepper.__scrollStepperMediaQuery = mediaQuery;
    stepper.__scrollStepperOnMediaChange = onMediaChange;
    mediaQuery.addEventListener("change", onMediaChange);
  }

  if (!stepper.__scrollStepperResizeObserver) {
    const resizeObserver = new ResizeObserver(() => setupScrollStepper(stepper));

    resizeObserver.observe(stepper);
    stepper.__scrollStepperResizeObserver = resizeObserver;
  }

  if (
    !scenes.length ||
    !panels.length ||
    !stepper.__scrollStepperMediaQuery.matches ||
    isStacked(stepper)
  ) {
    showStaticGallery(stepper);
    return;
  }

  stepper.setAttribute("data-scroll-stepper-initialized", "");
  setTrailingRunway(stepper, scenes);
  updateActive(stepper, scenes);
  updateProgress(stepper, scenes);

  if (stepper.__scrollStepperOnScroll) {
    document.removeEventListener("scroll", stepper.__scrollStepperOnScroll, true);
  }

  const onScroll = () => {
    if (teardownIfDetached(stepper)) return;

    updateActive(stepper, scenes);
    updateProgress(stepper, scenes);
  };

  stepper.__scrollStepperOnScroll = onScroll;
  document.addEventListener("scroll", onScroll, { capture: true, passive: true });
}

export function setupAllScrollSteppers(root: ParentNode = document): void {
  const parentStepper =
    root instanceof Element ? root.closest<HTMLElement>(".scroll-stepper") : null;
  const steppers = [
    ...(parentStepper ? [parentStepper] : []),
    ...(root instanceof HTMLElement && root.matches(".scroll-stepper") ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(".scroll-stepper")),
  ];

  [...new Set(steppers)].forEach(setupScrollStepper);
}

declare global {
  interface HTMLElement {
    __scrollStepperMediaQuery?: MediaQueryList;
    __scrollStepperOnScroll?: () => void;
    __scrollStepperOnMediaChange?: () => void;
    __scrollStepperResizeObserver?: ResizeObserver;
    __scrollStepperProgressStart?: number;
    __scrollStepperContentOffset?: number;
    __scrollStepperContentOffsetSettled?: boolean;
    __scrollStepperContentOffsetFrame?: number;
  }
}
