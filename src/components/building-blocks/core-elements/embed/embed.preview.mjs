import { preview, band, media, cropCorners } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Crop marks rather than a photo glyph — that is what separates "embedded
// third-party frame" from the plain image component at thumbnail size.
export default preview({
  width: B.w,
  draw: [media(B.left, 140, 960, 520), cropCorners(B.left, 140, 960, 520)],
});
