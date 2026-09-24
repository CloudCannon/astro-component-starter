import { preview, band, media, cropCorners } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Crop marks, not a photo glyph: that is what separates it from the image preview.
export default preview({
  width: B.w,
  draw: [media(B.left, 140, 960, 520), cropCorners(B.left, 140, 960, 520)],
});
