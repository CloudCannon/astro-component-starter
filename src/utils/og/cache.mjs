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
 * Plain `.mjs`: `astro.config.mjs` imports it and cannot load TypeScript on the minimum Node.
 * Freshness is mtime, not a module variable: the endpoint and the integration run in
 * separate module graphs, so a shared set would read empty and prune everything.
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
 * Build-only: in dev most entries are legitimately untouched and would be pruned.
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
