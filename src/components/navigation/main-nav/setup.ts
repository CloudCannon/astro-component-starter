export function setupMainNav(nav: HTMLElement): void {
  if (nav.hasAttribute("data-main-nav-initialized")) return;
  if (getComputedStyle(nav).position !== "sticky") return;
  nav.setAttribute("data-main-nav-initialized", "");

  // A pinned sticky element's offsets track the viewport, so watch a sentinel instead.
  const sentinel = document.createElement("div");

  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "height:0;overflow:hidden;";
  nav.before(sentinel);

  // Not a scroll listener: setup re-runs on every astro:page-load, and a listener
  // would outlive its swapped-out nav.
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
