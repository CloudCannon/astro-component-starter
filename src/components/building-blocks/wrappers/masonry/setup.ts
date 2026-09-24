/** Also run by `editor-live-sync.js`, where inline scripts don't run. */

import { enhanceMasonryLayout } from "../../../utils/masonryEnhance";

const teardowns = new WeakMap<HTMLElement, () => void>();

export function setupMasonry(root: HTMLElement): void {
  if (root.hasAttribute("data-masonry-initialized")) return;
  root.setAttribute("data-masonry-initialized", "");

  const inner = root.querySelector<HTMLElement>(".masonry-inner");

  if (!inner) return;

  teardowns.set(root, enhanceMasonryLayout(root, inner));
}

export function destroyMasonry(root: HTMLElement): void {
  teardowns.get(root)?.();
  teardowns.delete(root);
  root.removeAttribute("data-masonry-initialized");
}

export function setupAllMasonry(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".masonry").forEach((el) => setupMasonry(el));
}
