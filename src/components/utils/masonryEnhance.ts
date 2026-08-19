/**
 * Order-preserving masonry — upgrades a consumer's CSS-columns baseline to a
 * grid with measured row spans, without moving DOM nodes (so tab order and
 * CloudCannon editable bindings survive). No-ops where `display: masonry` is
 * native: the consumer's `@supports` block must test the exact string tested
 * here. Shared by the Masonry wrapper and Gallery Grid.
 */

import { masonrySpan } from "./masonrySpan";

/* A measurement quantum, not a design token. Must match `grid-auto-rows` in
 * every consumer's enhanced CSS block. */
export const ROW_UNIT = 8;

/** `root` takes the `data-masonry-enhanced` attribute the consumer's CSS keys
 *  on; Gallery Grid passes the same element as both root and inner. */
export function enhanceMasonryLayout(root: HTMLElement, inner: HTMLElement): void {
  if (CSS.supports("display", "masonry")) return;

  root.setAttribute("data-masonry-enhanced", "");

  let frame = 0;

  const relayout = () => {
    frame = 0;

    const gap = parseFloat(getComputedStyle(inner).columnGap) || 0;

    for (const item of Array.from(inner.children) as HTMLElement[]) {
      // Measure the item's content wrapper, never the spanning item itself —
      // the span changes the item's height, and measuring that would loop.
      const probe = (item.firstElementChild as HTMLElement | null) ?? item;
      const span = masonrySpan(probe.getBoundingClientRect().height, gap, ROW_UNIT);
      const value = `span ${span}`;

      if (item.style.gridRow !== value) item.style.gridRow = value;
    }
  };

  const queueRelayout = () => {
    if (!frame) frame = requestAnimationFrame(relayout);
  };

  const observeItems = () => {
    for (const item of Array.from(inner.children)) {
      if (item.firstElementChild) resizeObserver.observe(item.firstElementChild);
    }
  };

  // Container resizes (column-count) and content resizes (image loads, editor
  // typing) both re-span. Observing an element twice is a no-op.
  const resizeObserver = new ResizeObserver(queueRelayout);

  resizeObserver.observe(inner);
  observeItems();

  // The editor adds and removes items live.
  new MutationObserver(() => {
    observeItems();
    queueRelayout();
  }).observe(inner, { childList: true });

  queueRelayout();
}
