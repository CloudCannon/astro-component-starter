import { preview, band, bar, media, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A 3×2 wall of captioned photo tiles — repeated glyphs at equal size read as
// "gallery", vs latest-posts (one cover + text per card) and logo-cloud.
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
