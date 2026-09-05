/**
 * Scroll-spy for the Scroll Stepper. Used by `ScrollStepper.astro`'s inline
 * script and by `editor-live-sync.js`, where inline scripts don't run.
 * Without it the first media panel stays shown and every step is still
 * readable — the swap is progressive enhancement.
 */

export function setupScrollStepper(stepper: HTMLElement): void {
  if (stepper.hasAttribute("data-scroll-stepper-initialized")) return;
  stepper.setAttribute("data-scroll-stepper-initialized", "");

  const media = stepper.querySelector<HTMLElement>(".scroll-stepper-media");
  const panels = Array.from(stepper.querySelectorAll<HTMLElement>(".scroll-stepper-media-panel"));
  const dots = Array.from(stepper.querySelectorAll<HTMLElement>(".scroll-stepper-progress-dot"));
  const steps = Array.from(stepper.querySelectorAll<HTMLElement>(".scroll-stepper-step"));

  if (!media || !steps.length) {
    // In the CloudCannon editor the subtree can be briefly incomplete while
    // content loads; the live-sync observer re-runs setup once it lands.
    if (import.meta.env.DEV) {
      console.debug("ScrollStepper: skipping setup, required elements missing", stepper);
    }
    return;
  }

  let active = -1;

  const setActive = (index: number) => {
    if (index === active || index < 0 || index >= steps.length) return;
    active = index;

    steps.forEach((step, i) => {
      if (i === index) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });

    panels.forEach((panel, i) => {
      if (i === index) panel.setAttribute("data-active", "");
      else panel.removeAttribute("data-active");
    });

    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute("data-active", "");
      else dot.removeAttribute("data-active");
    });

    media.style.setProperty("--stepper-progress", String((index + 1) / steps.length));
  };

  // A zero-height band on the viewport's centre line: the step crossing it is
  // the active one, so exactly one step intersects at a time.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(steps.indexOf(entry.target as HTMLElement));
      }
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );

  steps.forEach((step) => observer.observe(step));
  setActive(0);
}

export function setupAllScrollSteppers(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".scroll-stepper").forEach(setupScrollStepper);
}
