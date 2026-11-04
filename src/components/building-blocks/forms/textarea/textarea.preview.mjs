import { preview, band, bar, field, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 240, 150, "label"),
    field(B.left, 276, 760, 248),
    bar(290, 306, 300, "body", { fill: glyph }),
  ],
});
