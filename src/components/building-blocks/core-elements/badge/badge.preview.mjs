import {
  preview,
  box,
  bar,
  ink,
  onInk,
  paper,
  glyph,
  subject,
  body,
} from "../../../../../scripts/previews/kit.mjs";

// Two small pills — tinted outline with a status dot, and a brand fill — so it
// reads as "labels", not a shrunken Button. Exempt from the width bands.
export default preview({
  width: 320,
  exempt: true,
  draw: [
    box(480, 378, 160, 44, { r: 22, fill: paper, stroke: glyph, sw: 2 }),
    box(502, 393, 14, 14, { r: 7, fill: subject }),
    bar(528, 396, 92, "micro", { fill: body }),
    box(664, 378, 136, 44, { r: 22, fill: ink }),
    bar(686, 396, 92, "micro", { fill: onInk }),
  ],
});
