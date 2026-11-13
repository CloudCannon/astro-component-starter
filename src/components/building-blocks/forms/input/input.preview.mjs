import { preview, band, bar, dot, field, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 296, 150, "label"),
    dot(428, 304, 6),
    field(B.left, 332, 760, 72),
    bar(290, 362, 260, "body", { fill: glyph }),
  ],
});
