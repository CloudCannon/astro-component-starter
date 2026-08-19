import { preview, box, bar, ink, glyph, body } from "../../../../../scripts/previews/kit.mjs";

// Four-and-a-half filled marks and a value bar — the half mark is the cue that
// this is a rating, not a button row. Exempt from the width bands.
export default preview({
  width: 320,
  exempt: true,
  draw: [
    [0, 1, 2, 3].map((i) => box(480 + i * 48, 382, 36, 36, { r: 8, fill: ink })),
    box(672, 382, 36, 36, { r: 8, fill: glyph }),
    box(672, 382, 18, 36, { r: 8, fill: ink }),
    bar(744, 394, 56, "body", { fill: body }),
  ],
});
