import { preview, band, box, lines, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

export default preview({
  width: B.w,
  draw: [
    lines(B.left, 278, [760, 470]),
    box(B.left, 354, 760, 96, { fill: glyph }),
    lines(B.left, 482, [760, 560]),
  ],
});
