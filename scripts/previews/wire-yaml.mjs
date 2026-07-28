/**
 * Surgically wire `image: /component-previews/<component>.svg` into a
 * component's structure-value YAML, under both `preview:` and `picker_preview:`.
 *
 * Formatting-preserving and idempotent: an already-correct line is left
 * byte-identical, so re-running the build produces no spurious diffs.
 */
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Ensure `image: <imagePath>` exists under a top-level YAML block
 * (`preview:` / `picker_preview:`), preserving existing formatting.
 * @param {string[]} lines
 * @param {string} blockName
 * @param {string} imagePath
 * @returns {string[]}
 */
export function ensureImageLine(lines, blockName, imagePath) {
  const blockStart = lines.findIndex((line) => new RegExp(`^${blockName}:\\s*$`).test(line));

  if (blockStart === -1) {
    // Block is missing — create a minimal one before the first `_`-prefixed
    // meta key (`_inputs_from_glob:`, `_structures:`, …), else at the end.
    const insertAt = lines.findIndex((line) => /^_[a-z]/.test(line));
    const block = [`${blockName}:`, `  image: ${imagePath}`];
    const at = insertAt === -1 ? lines.length : insertAt;

    return [...lines.slice(0, at), ...block, ...lines.slice(at)];
  }

  // Body runs until the next top-level key (a line starting non-whitespace).
  let blockEnd = lines.length;

  for (let i = blockStart + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) {
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

  const imageIdx = lines.findIndex(
    (line, i) => i > blockStart && i < blockEnd && /^\s+image:\s*/.test(line)
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
    (line, i) => i > blockStart && i < blockEnd && /^\s+icon:/.test(line)
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
