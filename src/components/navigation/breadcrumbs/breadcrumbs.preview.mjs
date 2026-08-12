import { band, bar, chevron, glyph, preview, subject } from "../../../../scripts/previews/kit.mjs";

const B = band(560);

// A single wayfinding row: two quiet ancestor links separated by chevrons, then
// a stronger current-page bar running to the band edge — the clamped title.
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
