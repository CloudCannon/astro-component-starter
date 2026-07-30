/**
 * Surgically wire `image: /component-previews/<component>.svg` into a
 * component's structure-value YAML, under both `preview:` and `picker_preview:`.
 *
 * Formatting-preserving and idempotent: an already-correct line is left
 * byte-identical, so re-running the build produces no spurious diffs.
 */
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Ensure `image: <imagePath>` exists under a YAML block (`preview:` /
 * `picker_preview:`), preserving existing formatting.
 *
 * `indent` is the block header's own indentation — `""` for the top-level
 * blocks in a structure-value file, `"  "` for the blocks nested under a
 * snippet name in a snippets file.
 * @param {string[]} lines
 * @param {string} blockName
 * @param {string} imagePath
 * @param {string} [indent]
 * @returns {string[]}
 */
export function ensureImageLine(lines, blockName, imagePath, indent = "") {
  const blockStart = lines.findIndex((line) =>
    new RegExp(`^${indent}${blockName}:\\s*$`).test(line)
  );

  if (blockStart === -1) {
    // Block is missing — create a minimal one before the first `_`-prefixed
    // meta key (`_inputs_from_glob:`, `_structures:`, …), else at the end.
    const insertAt = lines.findIndex((line) => new RegExp(`^${indent}_[a-z]`).test(line));
    const block = [`${indent}${blockName}:`, `${indent}  image: ${imagePath}`];
    const at = insertAt === -1 ? lines.length : insertAt;

    return [...lines.slice(0, at), ...block, ...lines.slice(at)];
  }

  // Body runs until the next key at or outdented past the block header.
  const dedented = new RegExp(`^\\s{0,${indent.length}}\\S`);
  let blockEnd = lines.length;

  for (let i = blockStart + 1; i < lines.length; i++) {
    if (dedented.test(lines[i])) {
      blockEnd = i;
      break;
    }
  }

  const childIndentMatch = lines
    .slice(blockStart + 1, blockEnd)
    .map((line) => line.match(/^(\s+)\S/))
    .find(Boolean);
  const childIndent = childIndentMatch ? childIndentMatch[1] : "  ";
  const newLine = `${childIndent}image: ${imagePath}`;

  // Only ever match a *direct* child of the block. A deeper `image:` belongs to
  // a nested sub-block (`gallery:` uses one) and must be left alone.
  const directChild = (key) => new RegExp(`^${childIndent}${key}:`);
  const isDirectChild = (line, key) =>
    directChild(key).test(line) && !/^\s/.test(line.slice(childIndent.length));

  const imageIdx = lines.findIndex(
    (line, i) => i > blockStart && i < blockEnd && isDirectChild(line, "image")
  );

  if (imageIdx !== -1) {
    if (lines[imageIdx].replace(/^\s+image:\s*/, "").trim() === imagePath) {
      return lines; // Already correct — leave byte-identical.
    }
    const next = [...lines];

    next[imageIdx] = newLine;
    return next;
  }

  // Insert before the existing `icon:` fallback if present, else at block end.
  const iconIdx = lines.findIndex(
    (line, i) => i > blockStart && i < blockEnd && isDirectChild(line, "icon")
  );
  const insertAt = iconIdx !== -1 ? iconIdx : blockEnd;

  return [...lines.slice(0, insertAt), newLine, ...lines.slice(insertAt)];
}

/**
 * Wire the preview image into a component's structure-value YAML.
 * @param {string} component  kebab `_component` path
 * @param {string} absFile    absolute path to the structure-value YAML
 * @returns {"written" | "unchanged"}
 */
export function wirePreviewImage(component, absFile) {
  const original = readFileSync(absFile, "utf8");
  const imagePath = `/component-previews/${component}.svg`;
  let lines = original.split("\n");

  lines = ensureImageLine(lines, "preview", imagePath);
  lines = ensureImageLine(lines, "picker_preview", imagePath);

  const updated = lines.join("\n");

  if (updated === original) return "unchanged";

  writeFileSync(absFile, updated);
  return "written";
}

/**
 * Whether a snippets file should get the static component thumbnail.
 *
 * A snippet whose preview defines a `gallery:` block already renders an image
 * pulled from the author's own content (`Image` uses `gallery.image: key:
 * source`). That is strictly more informative than a generic component
 * thumbnail, so those snippets opt out.
 *
 * Shared by the wiring (build.mjs) and the drift guard (check.mjs) so the two
 * cannot disagree about which files are expected to carry the line.
 * @param {string} source  contents of the snippets YAML
 * @returns {boolean}
 */
export function snippetWantsPreviewImage(source) {
  return !/^\s+gallery:\s*$/m.test(source);
}

/**
 * Wire the preview image into a component's snippets YAML.
 *
 * A snippets file nests its blocks one level under the snippet name, so the
 * `preview:` block sits at indent 2. Only `preview:` is wired — a snippet's
 * `picker_preview` uses `preview` as its base, so the image is inherited by the
 * snippet picker without a second block.
 * @param {string} component  kebab `_component` path
 * @param {string} absFile    absolute path to the snippets YAML
 * @returns {"written" | "unchanged" | "skipped"}
 */
export function wireSnippetPreviewImage(component, absFile) {
  const original = readFileSync(absFile, "utf8");

  if (!snippetWantsPreviewImage(original)) return "skipped";

  const imagePath = `/component-previews/${component}.svg`;
  const updated = ensureImageLine(original.split("\n"), "preview", imagePath, "  ").join("\n");

  if (updated === original) return "unchanged";

  writeFileSync(absFile, updated);
  return "written";
}
