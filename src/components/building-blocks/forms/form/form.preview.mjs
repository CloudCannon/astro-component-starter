import {
  preview,
  band,
  bar,
  field,
  pill,
  caret,
  glyph,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// The mix of field heights is what distinguishes this from a single field component.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 146, "label"),
    field(B.left, 26, 760, 54),

    bar(B.left, 108, 205, "label"),
    field(B.left, 134, 760, 54),
    caret(958, 155, 27, { h: 14, fill: glyph }),

    bar(B.left, 216, 117, "label"),
    field(B.left, 242, 760, 110),

    pill(B.left, 384, 166, 52, { label: 62 }),
  ],
});
