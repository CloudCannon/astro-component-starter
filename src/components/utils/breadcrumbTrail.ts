import type { BreadcrumbItem } from "../../types";

/** "case-studies" -> "Case studies". Slugs are the only label source for
 *  intermediate segments, so they're humanized rather than looked up. */
export function humanizeSlug(slug: string): string {
  const words = slug.replace(/[-_]+/g, " ").trim();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Crumbs *after* the leading Home item, which `Breadcrumbs` adds itself. The
 * last segment is the current page and gets no `url` (pass `currentLabel` to
 * override its humanized slug). Empty for the home page.
 */
export function trailFromPathname(pathname: string, currentLabel?: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const isCurrent = index === segments.length - 1;
    const label = isCurrent && currentLabel ? currentLabel : humanizeSlug(segment);

    return isCurrent ? { label } : { label, url: `/${segments.slice(0, index + 1).join("/")}/` };
  });
}

/**
 * Schema.org BreadcrumbList for a trail *after* Home. Same shape `Breadcrumbs`
 * emits next to the visible nav — posts reuse this without rendering the trail.
 */
export function breadcrumbListJsonLd(
  items: BreadcrumbItem[],
  options: { homeLabel?: string; base: URL | string }
) {
  const homeLabel = String(options.homeLabel ?? "").trim() || "Home";
  const trail = [{ label: homeLabel, url: "/" }, ...items];
  const base = options.base;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.url ? { item: new URL(item.url, base).href } : {}),
    })),
  };
}
