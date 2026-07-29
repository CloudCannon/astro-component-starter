import { preview, band, media, sun, peak } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Square-cornered, full-bleed and glyph-forward: the plainest possible photo.
export default preview({
  width: B.w,
  draw: [media(B.left, 120, 760, 560, { r: 0 }), sun(860, 260, 46), peak(332, 800, 564, 680, 428)],
});
