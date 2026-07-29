import { preview, band, bar, dot, glyph, ink } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Filled track up to the knob, empty after it, with min/max ticks below. Drawn
// as one track split in two rather than a single bar so the fill reads as value.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 163, "label"),
    bar(1062, 2, 58, "body", { fill: glyph }),

    bar(640, 61, 480, "body", { fill: glyph }),
    bar(B.left, 61, 480, "body", { fill: ink }),
    dot(640, 67, 20, { fill: ink }),

    bar(B.left, 104, 27, "micro", { fill: glyph }),
    bar(1084, 104, 36, "micro", { fill: glyph }),
  ],
});
