/**
 * Masonry wrapper (`.masonry`) — technique lives in `utils/masonryEnhance`.
 * Used by `Masonry.astro`'s inline script and by `editor-live-sync.js`, where
 * inline scripts don't run.
 */

import { enhanceMasonryLayout } from "../../../utils/masonryEnhance";

export function setupMasonry(root: HTMLElement): void {
  if (root.hasAttribute("data-masonry-initialized")) return;
  root.setAttribute("data-masonry-initialized", "");

  const inner = root.querySelector<HTMLElement>(".masonry-inner");

  if (!inner) return;

  enhanceMasonryLayout(root, inner);
}

export function setupAllMasonry(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".masonry").forEach((el) => setupMasonry(el));
}
