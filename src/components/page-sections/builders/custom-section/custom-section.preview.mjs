import { preview, band, bar, lines, media } from "../../../../../scripts/previews/kit.mjs";

const B = band(1120);

export default preview({
  width: B.w,
  draw: [
    media(B.left, 0, 1120, 240, { r: 0 }),
    bar(139, 70, 511, "heading"),
    lines(139, 122, [747, 413]),
  ],
});
