export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** One level below `level`, clamped at h6. */
export function nextHeadingLevel(level: string): HeadingLevel {
  const n = Number(String(level).replace("h", ""));

  return (Number.isFinite(n) ? `h${Math.min(6, Math.max(1, n) + 1)}` : "h3") as HeadingLevel;
}
