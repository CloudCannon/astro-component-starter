import {
  preview,
  band,
  plate,
  box,
  bar,
  dot,
  glyph,
  subject,
  panel,
  ink,
  onInk,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Equal rows and the 2 × 2 lead cell separate it from Testimonial Wall's masonry.
const quote = (x, y, w, h, lines, o = {}) => [
  o.fill === ink ? box(x, y, w, h, { fill: ink }) : plate(x, y, w, h, { fill: o.fill }),
  ...lines.map((lw, i) =>
    bar(x + 24, y + 26 + i * (o.big ? 30 : 22), lw, o.big ? "label" : "micro", {
      fill: o.fill === ink ? onInk : glyph,
    })
  ),
  dot(x + 38, y + h - 36, o.big ? 18 : 14, { fill: o.fill === ink ? onInk : subject }),
  bar(x + 62, y + h - 44, 104, "micro", { fill: o.fill === ink ? onInk : subject }),
  bar(x + 62, y + h - 28, 72, "micro", { fill: o.fill === ink ? onInk : glyph }),
];

export default preview({
  width: B.w,
  draw: [
    bar(460, 0, 360, "heading", { fill: subject }),
    bar(400, 44, 480, "micro", { fill: glyph }),

    ...quote(B.left, 108, 632, 324, [520, 560, 480, 360], { big: true, fill: panel }),
    ...quote(816, 108, 304, 150, [248, 200]),
    ...quote(816, 282, 304, 150, [232, 176], { fill: ink }),
    ...quote(B.left, 456, B.w, 150, [720, 540]),
  ],
});
