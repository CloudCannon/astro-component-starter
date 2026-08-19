/** Row-span math for masonry's grid enhancement — an item spans enough tiny
 *  auto-rows to cover its content plus one visual gap. Pure, so it unit-tests. */
export function masonrySpan(contentHeight: number, gapPx: number, unitPx: number): number {
  if (!Number.isFinite(contentHeight) || contentHeight <= 0) return 1;

  const gap = Number.isFinite(gapPx) && gapPx > 0 ? gapPx : 0;

  return Math.max(1, Math.ceil((contentHeight + gap) / unitPx));
}
