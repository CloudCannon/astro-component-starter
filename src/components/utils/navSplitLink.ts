const SPLIT_PATH_PREFIXES = ["/", "http://", "https://", "mailto:", "tel:"] as const;

/**
 * Use split row (navigable link + separate submenu toggle) only when `path` is a
 * real destination. Placeholder values such as `#` from generated nav are treated
 * as no link so the whole row stays a single toggle.
 */
export function itemHasSplitNavLink(item: { path?: unknown }): boolean {
  const raw = item?.path;
  const p = typeof raw === "string" ? raw.trim() : "";

  if (!p || p === "#") return false;
  return SPLIT_PATH_PREFIXES.some((prefix) => p.startsWith(prefix));
}
