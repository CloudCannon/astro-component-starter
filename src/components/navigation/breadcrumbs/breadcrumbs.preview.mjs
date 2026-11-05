import { band, bar, chevron, glyph, preview, subject } from "../../../../scripts/previews/kit.mjs";

const B = band(560);

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 88, "label", { fill: glyph }),
    chevron(B.left + 102, 1, 14, 14, "right"),
    bar(B.left + 130, 0, 88, "label", { fill: glyph }),
    chevron(B.left + 232, 1, 14, 14, "right"),
    bar(B.left + 260, 0, 300, "label", { fill: subject }),
  ],
});
