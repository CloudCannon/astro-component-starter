/** Rows of `unitPx` covering the content plus one gap. */
export function masonrySpan(contentHeight: number, gapPx: number, unitPx: number): number {
  if (!Number.isFinite(contentHeight) || contentHeight <= 0) return 1;

  const gap = Number.isFinite(gapPx) && gapPx > 0 ? gapPx : 0;

  return Math.max(1, Math.ceil((contentHeight + gap) / unitPx));
}
