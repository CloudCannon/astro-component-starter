/**
 * Builds the CSS `rgba(...)` string for a background overlay.
 *
 * A negative `overlay` darkens (black); a positive one lightens (white).
 * The alpha is the magnitude of `overlay`. Callers only render the overlay
 * element when `overlay !== 0`, so the sign is always meaningful here.
 */
export function overlayColor(overlay: number): string {
  const rgb = overlay < 0 ? "0, 0, 0" : "255, 255, 255";

  return `rgba(${rgb}, ${Math.abs(overlay)})`;
}
