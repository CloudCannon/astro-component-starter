import type { BreadcrumbItem } from "../../types";

export function humanizeSlug(slug: string): string {
  const words = slug.replace(/[-_]+/g, " ").trim();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Excludes Home, which `Breadcrumbs` adds itself. The current page gets no `url`. */
export function trailFromPathname(pathname: string, currentLabel?: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const isCurrent = index === segments.length - 1;
    const label = isCurrent && currentLabel ? currentLabel : humanizeSlug(segment);

    return isCurrent ? { label } : { label, url: `/${segments.slice(0, index + 1).join("/")}/` };
  });
}

/** Takes a trail without Home, as `trailFromPathname` returns it. */
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
