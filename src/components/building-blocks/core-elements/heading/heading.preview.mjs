import { preview, band, bar, tile, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// One display-weight line with a leading mark, so it reads as a titled heading
// rather than a stray bar.
export default preview({
  width: B.w,
  draw: [tile(B.left, 380, 40, { fill: glyph }), bar(419, 380, 501, "display")],
});
