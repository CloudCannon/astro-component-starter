import { preview, band, bar, dot, glyph, subject } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// A breadcrumb line, then a big left-aligned title and one intro line. The left
// alignment and crumb row separate it from Hero Center's centred stack.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 56, "micro", { fill: glyph }),
    dot(B.left + 68, 6, 3, { fill: glyph }),
    bar(B.left + 80, 0, 72, "micro", { fill: glyph }),
    dot(B.left + 164, 6, 3, { fill: glyph }),
    bar(B.left + 176, 0, 88, "micro", { fill: glyph }),

    bar(B.left, 36, 400, "display", { fill: subject }),

    bar(B.left, 108, B.w, "body", { fill: glyph }),
    bar(B.left, 140, 520, "body", { fill: glyph }),
  ],
});
