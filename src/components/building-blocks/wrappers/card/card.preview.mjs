import { preview, band, bar, lines, media } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// A filled, square-cornered surface holding a heading and copy. Square corners
// and the full-bleed fill are what read as "one grouped block" at thumb size.
export default preview({
  width: B.w,
  draw: [
    media(B.left, 0, 560, 212, { r: 0 }),
    bar(400, 48, 300, "heading"),
    lines(400, 104, [480, 480, 300]),
  ],
});
