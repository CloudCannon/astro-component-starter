import { preview, band, bar, box, glyph, surface } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A shallow strip (unlike every full-height section): a muted lead bar over one
// even row of logo tiles — the cue against a stats or feature row.
export default preview({
  width: B.w,
  draw: [
    bar(530, 0, 220, "body", { fill: glyph }),
    Array.from({ length: 6 }, (_, i) => [
      box(160 + i * 168, 48, 120, 44, { r: 6, fill: surface }),
      bar(184 + i * 168, 66, 72, "micro", { fill: glyph }),
    ]),
  ],
});
