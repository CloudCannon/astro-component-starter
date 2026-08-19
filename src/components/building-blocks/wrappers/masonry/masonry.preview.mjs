import { preview, band, plate, bar, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Three columns of unequal plates with staggered, ragged bottoms — the
// stagger is what says "masonry" next to Grid's evenly-bottomed tiles.
export default preview({
  width: B.w,
  draw: [
    plate(160, 0, 304, 200),
    bar(176, 24, 160, "label"),
    bar(176, 56, 240, "micro", { fill: glyph }),
    plate(160, 224, 304, 120),
    plate(160, 368, 304, 120),
    plate(488, 0, 304, 120),
    plate(488, 144, 304, 220),
    bar(504, 168, 160, "label"),
    bar(504, 200, 240, "micro", { fill: glyph }),
    plate(488, 388, 304, 140),
    plate(816, 0, 304, 260),
    bar(832, 24, 160, "label"),
    bar(832, 56, 240, "micro", { fill: glyph }),
    plate(816, 284, 304, 110),
    plate(816, 418, 304, 90),
  ],
});
