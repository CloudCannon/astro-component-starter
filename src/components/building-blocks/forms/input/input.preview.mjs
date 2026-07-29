import { preview, band, bar, dot, field, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// The baseline single-line field. The dot after the label is the required marker;
// otherwise this is deliberately the plainest control in the set, and everything
// else in `forms/` differs from it by exactly one added affordance.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 296, 150, "label"),
    dot(428, 304, 6),
    field(B.left, 332, 760, 72),
    bar(290, 362, 260, "body", { fill: glyph }),
  ],
});
