/**
 * The page's pathname, also inside CloudCannon's in-browser re-render, where `Astro.url` is
 * undefined and reading `.pathname` off it throws. Falls back to the `<html data-pathname>` the
 * layouts stamp.
 */
export function currentPathname(url: URL | undefined): string {
  return (
    url?.pathname ??
    (typeof document === "undefined" ? "" : (document.documentElement.dataset.pathname ?? ""))
  );
}
