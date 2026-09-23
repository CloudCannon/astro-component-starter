/**
 * A page-unique id from a readable base: the first use on a page keeps the base
 * as-is, later ones take a numbered suffix. Two instances that derive the same
 * base — a default `aria-label`, a repeated heading — would otherwise mint the
 * same id, and `<label for>` / `popovertarget` silently resolve to the first.
 *
 * Keyed on the render's own Request, which is a fresh object per page render,
 * so numbering restarts instead of climbing across a dev server's re-renders.
 */
const perRender = new WeakMap<Request, Map<string, number>>();

export function uniqueId(request: Request, base: string): string {
  let used = perRender.get(request);

  if (!used) {
    used = new Map();
    perRender.set(request, used);
  }

  const count = (used.get(base) ?? 0) + 1;

  used.set(base, count);

  return count === 1 ? base : `${base}-${count}`;
}
