import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

/**
 * Content-addressed store for rendered share cards, so an unchanged page is a
 * file read rather than a render on the next build.
 *
 * Plain `.mjs` because both `render.ts` and the `prune-og-cache` Astro
 * integration import it, and the integration is loaded by Node from
 * `astro.config.mjs`, which cannot import TypeScript on this repo's minimum
 * Node.
 *
 * Lives under Astro's cache directory: gitignored, and the path to name in a
 * host's between-build cache (CloudCannon "Preserved Paths"). That cache is
 * opt-in and best-effort, so nothing here may assume a warm start.
 *
 * Freshness is tracked by mtime, not an in-memory set: the endpoint and the
 * integration run in different module graphs, so a shared module variable would
 * read as empty from the integration and prune the whole cache. A hit therefore
 * re-stamps its file, and `pruneCache` drops whatever the build never touched.
 */

const CACHE_DIR = path.join("node_modules", ".astro", "og-cache");

/**
 * @param {unknown[]} parts
 * @returns {string}
 */
export function cacheKey(parts) {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 32);
}

/** @param {string} root */
export const cacheDir = (root) => path.join(root, CACHE_DIR);

/**
 * @param {string} root
 * @param {string} key
 */
const entryPath = (root, key) => path.join(cacheDir(root), `${key}.png`);

/**
 * @param {string} root
 * @param {string} key
 * @returns {Buffer | null}
 */
export function readCache(root, key) {
  const file = entryPath(root, key);

  if (!existsSync(file)) return null;

  try {
    const data = readFileSync(file);
    const now = new Date();

    utimesSync(file, now, now);

    return data;
  } catch {
    return null;
  }
}

/**
 * @param {string} root
 * @param {string} key
 * @param {Buffer} data
 */
export function writeCache(root, key, data) {
  const file = entryPath(root, key);

  try {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, data);
  } catch {
    // A cache that cannot be written is a slow build, not a broken one.
  }
}

/**
 * Drop entries untouched since `since`. Build-only: in dev the endpoint is hit
 * on demand, so most entries are legitimately untouched and pruning would throw
 * away live ones.
 *
 * @param {string} root
 * @param {number} since epoch ms
 * @returns {number} entries removed
 */
export function pruneCache(root, since) {
  const directory = cacheDir(root);

  if (!existsSync(directory)) return 0;

  let removed = 0;

  for (const entry of readdirSync(directory)) {
    if (!entry.endsWith(".png")) continue;

    const file = path.join(directory, entry);

    try {
      if (statSync(file).mtimeMs >= since) continue;

      unlinkSync(file);
      removed += 1;
    } catch {
      // Left behind; it will be a candidate again next build.
    }
  }

  return removed;
}
