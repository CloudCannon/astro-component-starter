import { preview, band, media, playDisc } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// 16:9 surface with a big centred play button and no photo glyph — the play mark
// alone has to carry "video" against the image component's mountains.
export default preview({
  width: B.w,
  draw: [media(B.left, 130, 960, 540), playDisc(640, 400, 72)],
});
