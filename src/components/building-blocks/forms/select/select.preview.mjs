import { preview, band, bar, field, caret, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// The caret is the cue that reads as "opens a menu". Without it a select is the
// same silhouette as a text input, so it is drawn large and in `subject`.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 296, 150, "label"),
    field(B.left, 332, 760, 72),
    bar(290, 362, 220, "body", { fill: glyph }),
    caret(940, 356, 50, { h: 28 }),
  ],
});
