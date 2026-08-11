/**
 * The render-time icon registry: every SVG under `src/icons/`, keyed by id.
 *
 * The glob runs at build time only — nothing here ships to the browser. Ids come
 * from `iconKey.mjs`, shared with `scripts/icons/sync.mjs` so this registry and
 * the CloudCannon picker cannot disagree about what exists.
 */
import { iconKeyFromPath } from "./iconKey.mjs";
import { normalizeIconSvg, type NormalizedIcon } from "./iconSvg";

const sources: Record<string, string> = import.meta.glob("/src/icons/**/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const sourcesById = new Map<string, string>(
  Object.entries(sources).map(([path, source]) => [iconKeyFromPath(path), source])
);

/** Every available icon id, sorted — the same list the picker is generated from. */
export const iconNames: string[] = [...sourcesById.keys()].sort();

/** Parsing is deferred so one malformed icon only breaks pages that use it. */
const normalized = new Map<string, NormalizedIcon>();

/**
 * Look up and normalize an icon.
 *
 * @returns the icon, or `null` when no SVG matches — an id can come from content
 *   an editor typed, so callers decide how loudly to fail.
 */
export function getIcon(name: string): NormalizedIcon | null {
  const id = name.trim();
  const cached = normalized.get(id);

  if (cached) return cached;

  const source = sourcesById.get(id);

  if (source === undefined) return null;

  const icon = normalizeIconSvg(source, id);

  normalized.set(id, icon);

  return icon;
}

/** Levenshtein distance, two-row DP — the icon set is small and the ids short. */
function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];

    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }

    previous = current;
  }

  return previous[b.length];
}

/**
 * Ids closest to `name`, for turning a typo into an actionable dev warning.
 * Ranked by edit distance, not shared prefix — the set is full of near siblings
 * like `chevron-down` and `chevron-double-down`.
 */
export function suggestIconNames(name: string, limit = 3): string[] {
  const target = name.trim();

  // Scaled to length, so a long id tolerates a bigger slip and something
  // unrelated matches nothing.
  const tolerance = Math.max(2, Math.ceil(target.length / 4));

  return iconNames
    .map((candidate) => ({ candidate, distance: editDistance(target, candidate) }))
    .filter(({ distance }) => distance <= tolerance)
    .sort((a, b) => a.distance - b.distance || a.candidate.localeCompare(b.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
