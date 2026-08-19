/**
 * Surgically wire `image: public/component-previews/<component>.svg` into a
 * component's structure-value YAML, under both `preview:` and `picker_preview:`
 * — as the top-level `image:` and as `gallery.image` (the large picker-card
 * slot). CloudCannon resolves these against the source tree, the same way the
 * icon picker uses `src/icons/{id}.svg`. A site URL (`/component-previews/...`)
 * does not exist as a file and the picker shows "No preview available".
 *
 * Formatting-preserving and idempotent: an already-correct line is left
 * byte-identical, so re-running the build produces no spurious diffs.
 */
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Source-tree path CloudCannon can load for a component's preview SVG.
 * @param {string} component  kebab `_component` path
 * @returns {string}
 */
export function previewImagePath(component) {
  return `public/component-previews/${component}.svg`;
}

/**
 * Locate a YAML block (`preview:` / `picker_preview:`) and return its span
 * plus the indentation of its direct children.
 *
 * @param {string[]} lines
 * @param {string} blockName
 * @param {string} indent
 * @returns {{ start: number, end: number, childIndent: string } | null}
 */
function findBlock(lines, blockName, indent) {
  const start = lines.findIndex((line) => new RegExp(`^${indent}${blockName}:\\s*$`).test(line));

  if (start === -1) return null;

  const dedented = new RegExp(`^\\s{0,${indent.length}}\\S`);
  let end = lines.length;

  for (let i = start + 1; i < lines.length; i++) {
    if (dedented.test(lines[i])) {
      end = i;
      break;
    }
  }

  const childIndentMatch = lines
    .slice(start + 1, end)
    .map((line) => line.match(/^(\s+)\S/))
    .find(Boolean);

  return { start, end, childIndent: childIndentMatch ? childIndentMatch[1] : `${indent}  ` };
}

/**
 * True when `line` is a direct child key of a block at `childIndent`.
 * @param {string} line
 * @param {string} childIndent
 * @param {string} key
 */
function isDirectChild(line, childIndent, key) {
  return (
    new RegExp(`^${childIndent}${key}:`).test(line) && !/^\s/.test(line.slice(childIndent.length))
  );
}

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
  const block = findBlock(lines, blockName, indent);

  if (!block) {
    // Block is missing — create a minimal one before the first `_`-prefixed
    // meta key (`_inputs_from_glob:`, `_structures:`, …), else at the end.
    const insertAt = lines.findIndex((line) => new RegExp(`^${indent}_[a-z]`).test(line));
    const created = [`${indent}${blockName}:`, `${indent}  image: ${imagePath}`];
    const at = insertAt === -1 ? lines.length : insertAt;

    return [...lines.slice(0, at), ...created, ...lines.slice(at)];
  }

  const { start, end, childIndent } = block;
  const newLine = `${childIndent}image: ${imagePath}`;

  // Only ever match a *direct* child of the block. A deeper `image:` belongs to
  // a nested sub-block (`gallery:` uses one) and must be left alone here —
  // `ensureGalleryImage` owns that line.
  const imageIdx = lines.findIndex(
    (line, i) => i > start && i < end && isDirectChild(line, childIndent, "image")
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
    (line, i) => i > start && i < end && isDirectChild(line, childIndent, "icon")
  );
  const insertAt = iconIdx !== -1 ? iconIdx : end;

  return [...lines.slice(0, insertAt), newLine, ...lines.slice(insertAt)];
}

/**
 * Ensure `gallery.image` + `gallery.fit: cover` exist under a preview block.
 * The structure-picker modal uses this gallery slot for the large card image;
 * `cover` fills CloudCannon's card frame instead of pillarboxing the 16:9 SVG
 * inside the default `padded` fit.
 *
 * Leaves a gallery that already binds a content key (`image: { key: ... }` or
 * a list) alone — those show the author's own image, which beats a thumbnail.
 *
 * @param {string[]} lines
 * @param {string} blockName
 * @param {string} imagePath
 * @param {string} [indent]
 * @returns {string[]}
 */
export function ensureGalleryImage(lines, blockName, imagePath, indent = "") {
  const block = findBlock(lines, blockName, indent);

  if (!block) return lines;

  const { start, end, childIndent } = block;
  const galleryHeader = `${childIndent}gallery:`;
  const galleryIdx = lines.findIndex((line, i) => i > start && i < end && line === galleryHeader);
  const galleryChildIndent = `${childIndent}  `;
  const imageLine = `${galleryChildIndent}image: ${imagePath}`;
  const fitLine = `${galleryChildIndent}fit: cover`;

  if (galleryIdx === -1) {
    const galleryBlock = [`${childIndent}gallery:`, imageLine, fitLine];

    return [...lines.slice(0, end), ...galleryBlock, ...lines.slice(end)];
  }

  let galleryEnd = end;

  for (let i = galleryIdx + 1; i < end; i++) {
    if (!lines[i].startsWith(galleryChildIndent) && lines[i].trim() !== "") {
      galleryEnd = i;
      break;
    }
  }

  const imageIdx = lines.findIndex(
    (line, i) =>
      i > galleryIdx && i < galleryEnd && isDirectChild(line, galleryChildIndent, "image")
  );

  if (imageIdx !== -1) {
    const current = lines[imageIdx].replace(/^\s+image:\s*/, "").trim();

    // A `key:` / list-style gallery is the author's content image — do not replace.
    if (current === "" || current.startsWith("-") || current.includes("key:")) {
      return lines;
    }
  }

  let next = [...lines];

  if (imageIdx === -1) {
    next = [...next.slice(0, galleryIdx + 1), imageLine, ...next.slice(galleryIdx + 1)];
    galleryEnd += 1;
  } else if (next[imageIdx] !== imageLine) {
    next[imageIdx] = imageLine;
  }

  const fitIdx = next.findIndex(
    (line, i) => i > galleryIdx && i < galleryEnd && isDirectChild(line, galleryChildIndent, "fit")
  );
  const imageAt = next.findIndex(
    (line, i) =>
      i > galleryIdx && i < galleryEnd + 1 && isDirectChild(line, galleryChildIndent, "image")
  );

  if (fitIdx === -1) {
    const insertAt = (imageAt !== -1 ? imageAt : galleryIdx) + 1;

    next = [...next.slice(0, insertAt), fitLine, ...next.slice(insertAt)];
  } else if (next[fitIdx] !== fitLine) {
    next[fitIdx] = fitLine;
  }

  return next.join("\n") === lines.join("\n") ? lines : next;
}

/**
 * Wire the preview image into a component's structure-value YAML.
 * @param {string} component  kebab `_component` path
 * @param {string} absFile    absolute path to the structure-value YAML
 * @returns {"written" | "unchanged"}
 */
export function wirePreviewImage(component, absFile) {
  const original = readFileSync(absFile, "utf8");
  const imagePath = previewImagePath(component);
  let lines = original.split("\n");

  lines = ensureImageLine(lines, "preview", imagePath);
  lines = ensureImageLine(lines, "picker_preview", imagePath);
  lines = ensureGalleryImage(lines, "preview", imagePath);
  lines = ensureGalleryImage(lines, "picker_preview", imagePath);

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
  // Opt out only when gallery already shows the author's own image
  // (`image: { key: ... }` / a key cascade). A gallery we wired ourselves
  // (`image: public/component-previews/...`) must stay updatable.
  return !/gallery:\s*\n\s+image:\s*\n\s+-?\s*key:/m.test(source);
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

  const imagePath = previewImagePath(component);
  let lines = original.split("\n");

  lines = ensureImageLine(lines, "preview", imagePath, "  ");
  lines = ensureGalleryImage(lines, "preview", imagePath, "  ");

  const updated = lines.join("\n");

  if (updated === original) return "unchanged";

  writeFileSync(absFile, updated);
  return "written";
}
