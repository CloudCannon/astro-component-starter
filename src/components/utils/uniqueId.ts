// Keyed on the per-render Request so numbering restarts on each dev-server re-render.
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
