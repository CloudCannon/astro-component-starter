// Single source of truth for `_component` keys (renderBlock.astro, live-editing.js,
// scripts/cms/lint.mjs). Keep it import-free: it also runs in the editor bundle and plain node.

/**
 * @param {string} pascal
 * @returns {string}
 */
export function pascalToKebab(pascal) {
  return pascal
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
}

/**
 * The filename collapses into its directory when the kebab names match
 * (`hero-center/HeroCenter.astro` -> `.../hero-center`).
 * @param {string} relativePath relative to `src/components/`, POSIX separators, extension optional.
 * @returns {string}
 */
export function componentKeyFromPath(relativePath) {
  const parts = relativePath.replace(/\.(astro|jsx)$/, "").split("/");
  const filename = parts[parts.length - 1];
  const kebabFilename = pascalToKebab(filename);
  const parent = parts.length > 1 ? parts[parts.length - 2] : null;

  if (parent !== null && kebabFilename === pascalToKebab(parent)) {
    parts.pop();
  }
  parts[parts.length - 1] = kebabFilename;

  return parts.join("/");
}
