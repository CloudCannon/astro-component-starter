/** Negative darkens (black), positive lightens (white); alpha is the magnitude. */
export function overlayColor(overlay: number): string {
  const rgb = overlay < 0 ? "0, 0, 0" : "255, 255, 255";

  return `rgba(${rgb}, ${Math.abs(overlay)})`;
}
