import { preview, band, bar, lines, media } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

export default preview({
  width: B.w,
  draw: [
    media(B.left, 0, 560, 212, { r: 0 }),
    bar(400, 48, 300, "heading"),
    lines(400, 104, [480, 480, 300]),
  ],
});
