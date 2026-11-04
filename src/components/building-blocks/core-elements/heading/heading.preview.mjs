import { preview, band, bar, tile, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

export default preview({
  width: B.w,
  draw: [tile(B.left, 380, 40, { fill: glyph }), bar(419, 380, 501, "display")],
});
