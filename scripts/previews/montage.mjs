/**
 * Montage generator — a single labelled PNG contact sheet of every built preview.
 *
 *   node scripts/previews/montage.mjs [out.png]
 *
 * Rasterizes every SVG in public/component-previews/ into one labelled grid so
 * the whole set can be eyeballed at once. `previews:check` guards existence,
 * wiring and staleness — it cannot judge whether a preview is *legible*, which
 * is what this is for. Reviewing tiles side by side is the only way to catch a
 * component whose thumbnail is too faint or too similar to its siblings.
 *
 * PNG rather than HTML deliberately: rendering it needs no browser, matching
 * the rest of the preview pipeline.
 *
 * Output is a scratch review artifact and is gitignored.
 */
import { globSync } from "glob";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const previewsDir = join(root, "public", "component-previews");
const out = process.argv[2] || join(root, ".preview-montage.png");

// Grid geometry. Tiles keep the previews' native 16:9; each gets a label strip.
const COLS = 7;
const TILE_W = 224;
const TILE_H = 126;
const LABEL_H = 22;
const PAD = 4;
const CELL_W = TILE_W + PAD * 2;
const CELL_H = TILE_H + LABEL_H + PAD * 2;

const files = globSync("**/*.svg", { cwd: previewsDir }).sort();

if (files.length === 0) {
  console.error("No preview SVGs found. Run `npm run previews:build` first.");
  process.exit(1);
}

const rows = Math.ceil(files.length / COLS);

const escapeXml = (value) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]
  );

/** `forms/input.svg` -> `forms / input` — enough context to find the file. */
function label(file) {
  const parts = file.replace(/\.svg$/, "").split("/");

  return parts.slice(-2).join(" / ");
}

const tiles = [];

for (const [index, file] of files.entries()) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const cellX = col * CELL_W;
  const cellY = row * CELL_H;

  tiles.push({
    input: await sharp(readFileSync(join(previewsDir, file)))
      .resize(TILE_W, TILE_H, { fit: "contain", background: "#ffffff" })
      .png()
      .toBuffer(),
    left: cellX + PAD,
    top: cellY + PAD,
  });

  tiles.push({
    input: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_W}" height="${LABEL_H}">` +
        `<text x="2" y="14" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" ` +
        `font-size="11" fill="#1f1f1f">${escapeXml(label(file))}</text></svg>`
    ),
    left: cellX + PAD,
    top: cellY + PAD + TILE_H,
  });
}

await sharp({
  create: {
    width: COLS * CELL_W,
    height: rows * CELL_H,
    channels: 3,
    // Mid grey gutters so white tiles read as distinct panels.
    background: "#8f8f8f",
  },
})
  .composite(tiles)
  .png()
  .toFile(out);

console.log(`Montage: ${files.length} previews in a ${COLS}x${rows} grid -> ${out}`);
