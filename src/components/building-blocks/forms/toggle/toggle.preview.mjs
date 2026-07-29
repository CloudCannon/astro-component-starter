import { preview, band, bar, toggle } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// Switch in the on position beside its label. The knob pushed hard right is the
// whole signal, so the track is drawn at full ink rather than as an outline.
export default preview({
  width: B.w,
  draw: [toggle(B.left, 0, 97, 52, true), bar(494, 13, 426, "heading")],
});
