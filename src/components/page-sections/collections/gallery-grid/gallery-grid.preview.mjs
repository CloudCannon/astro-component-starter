import { preview, band, bar, media, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Equal-size repeated photo glyphs read as "gallery", vs latest-posts and logo-cloud.
export default preview({
  width: B.w,
  draw: [
    [160, 488, 816].map((x) => [
      media(x, 0, 304, 198),
      bar(x, 214, 132, "micro", { fill: glyph }),
      media(x, 252, 304, 198),
      bar(x, 466, 132, "micro", { fill: glyph }),
    ]),
  ],
});
