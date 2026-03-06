type InitCallback = () => void;

/**
 * Run client init on first load and on Astro page navigations.
 * Prevents duplicate runs for the same URL.
 */
export function onPageLoad(init: InitCallback): void {
  let lastUrl = "";

  const run = () => {
    const currentUrl = window.location.href;

    if (currentUrl === lastUrl) return;
    lastUrl = currentUrl;
    init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  document.addEventListener("astro:page-load", run);
}
