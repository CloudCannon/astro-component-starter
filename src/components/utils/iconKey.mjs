/**
 * Shared icon-id derivation, imported by `icons.ts` (the render-time registry)
 * and `scripts/icons/sync.mjs` (the CloudCannon picker + generated types).
 * Change it only here — a divergence silently breaks the picker.
 *
 * Keep this dependency-free ESM so it loads from Astro frontmatter and plain
 * `node` alike.
 */

/** Everything up to and including this prefix is stripped from a path. */
const ICONS_DIR = "src/icons/";

/**
 * Derive an icon id from a path to its SVG. Accepts a Vite glob key, an OS path
 * with backslashes, or a path already relative to `src/icons/`.
 *
 * @param {string} path path to an SVG file.
 * @returns {string} the id used to reference the icon (e.g. "social/github").
 */
export function iconKeyFromPath(path) {
  const posix = path.split(/[\\/]/).join("/");
  const index = posix.lastIndexOf(ICONS_DIR);

  return (index === -1 ? posix : posix.slice(index + ICONS_DIR.length))
    .replace(/^\/+/, "")
    .replace(/\.svg$/, "");
}
