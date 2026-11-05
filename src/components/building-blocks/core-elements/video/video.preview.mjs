import { preview, band, media, playDisc } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// No photo glyph: the play mark alone separates it from the image preview.
export default preview({
  width: B.w,
  draw: [media(B.left, 130, 960, 540), playDisc(640, 400, 72)],
});
