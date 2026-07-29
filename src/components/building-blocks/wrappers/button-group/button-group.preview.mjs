import { preview, band, pill } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// One filled and one outlined button with a wide gap — the pairing, and the
// contrast between the two variants, is what this wrapper is for.
export default preview({
  width: B.w,
  draw: [
    pill(B.left, 0, 255, 44, { label: 82 }),
    pill(640, 0, 280, 44, { variant: "ghost", label: 82 }),
  ],
});
