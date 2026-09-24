import { preview, band, bar, box, lines } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

const GAP = 48;
const headingBottom = 26;
const mediaTop = headingBottom + GAP;
const mediaBottom = mediaTop + 150;
const copyTop = mediaBottom + GAP;

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 320, "heading"),
    box(B.left, mediaTop, B.w, 150),
    lines(B.left, copyTop, [760, 452]),
  ],
});
