/**
 * Shared component-key derivation: the single source of truth for turning a
 * component's file path into its `_component` registry key.
 *
 * Imported by everything that must agree on that key:
 *   - src/components/utils/renderBlock.astro  (the render registry)
 *   - live-editing.js                         (the Visual Editor registry)
 *   - scripts/cms/lint.mjs                    (the CloudCannon drift linter)
 *
 * Dependency-free ESM so it loads from Astro/Vite frontmatter, the browser
 * editor bundle, and plain `node` alike. Keep it that way — no imports.
 */

/**
 * Convert a PascalCase name to kebab-case (e.g. "HeroCenter" -> "hero-center").
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
 * Derive the `_component` registry key for a component file.
 *
 * The filename collapses into its parent directory when its kebab-cased name
 * matches that directory (`hero-center/HeroCenter.astro` -> `.../hero-center`);
 * a child whose name differs keeps it (`accordion/AccordionItem.astro` ->
 * `.../accordion/accordion-item`).
 *
 * @param {string} relativePath path relative to `src/components/`, POSIX
 *   separators, with or without the `.astro`/`.jsx` extension
 *   (e.g. "building-blocks/core-elements/button/Button.astro").
 * @returns {string} the kebab-case registry key.
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
