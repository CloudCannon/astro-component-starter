import {
  preview,
  band,
  bar,
  box,
  field,
  glyph,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 296, 150, "label"),
    field(B.left, 332, 760, 72),
    box(290, 350, 180, 36, { fill: subject }),
    bar(498, 362, 200, "body", { fill: glyph }),
  ],
});
