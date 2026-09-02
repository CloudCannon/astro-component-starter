/**
 * Toggles `is-stuck` on the sticky main nav so CSS can fade in a shadow.
 * Used by `MainNav.astro`'s inline script and by `editor-live-sync.js`,
 * where inline scripts don't run.
 */

export function setupMainNav(nav: HTMLElement): void {
  if (nav.hasAttribute("data-main-nav-initialized")) return;
  if (getComputedStyle(nav).position !== "sticky") return;
  nav.setAttribute("data-main-nav-initialized", "");

  // A pinned sticky element's own offsets track the viewport, so watch a
  // sentinel left at the resting position instead.
  const sentinel = document.createElement("div");

  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "height:0;overflow:hidden;";
  nav.before(sentinel);

  // An observer (not a window scroll listener): setup re-runs on every
  // astro:page-load, and a scroll listener would outlive its swapped-out nav.
  // A detached target reports not-intersecting once — that's the cue to
  // disconnect so the old nav/sentinel pair can be collected.
  const observer = new IntersectionObserver(([entry]) => {
    if (!sentinel.isConnected) {
      observer.disconnect();
      return;
    }

    nav.classList.toggle("is-stuck", entry.boundingClientRect.top < 0);
  });

  observer.observe(sentinel);
}

export function setupAllMainNavs(root: ParentNode = document): void {
  for (const nav of root.querySelectorAll<HTMLElement>(".main-nav")) {
    setupMainNav(nav);
  }
}
