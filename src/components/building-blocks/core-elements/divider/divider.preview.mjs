import { preview, band, box, lines, subject } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Copy, rule, copy. The rule is `subject` and sits in a wide gap on both sides —
// it has to be the loudest thing here or this reads as a plain text block.
export default preview({
  width: B.w,
  draw: [
    lines(B.left, 286, [760, 470]),
    box(B.left, 397, 760, 3, { r: 2, fill: subject }),
    lines(B.left, 474, [760, 560]),
  ],
});
