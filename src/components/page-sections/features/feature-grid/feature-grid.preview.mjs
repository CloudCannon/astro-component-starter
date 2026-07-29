import { preview, band, bar, tile, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(1120);

// Centred eyebrow / display heading / copy, then four centred icon-and-text
// columns. Four columns rather than three: it is the widest band in the set and
// three would leave the row looking loose.
//
// Explicit per-column x values — the reference set nudges the first tile a pixel
// off an even 293 pitch, and matching it keeps the built SVG diff-clean.
const TILE_X = [177, 471, 764, 1057];
const HEAD_X = [110, 403, 696, 989];
const COPY_X = [80, 373, 666, 959];

export default preview({
  width: B.w,
  draw: [
    bar(585, 0, 110, "body", { fill: glyph }),
    bar(329, 32, 622, "display"),
    bar(279, 88, 723, "body"),
    bar(453, 112, 373, "body"),

    TILE_X.map((x, i) => [
      tile(x, 180, 46),
      bar(HEAD_X[i], 244, 181, "heading"),
      bar(COPY_X[i], 286, 241, "body"),
      bar(HEAD_X[i], 310, 181, "body"),
    ]),
  ],
});
