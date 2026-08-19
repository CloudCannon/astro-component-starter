import {
  preview,
  band,
  plate,
  bar,
  dot,
  glyph,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Three columns of quote cards with ragged bottoms under a header. The stagger
// says "masonry wall" (vs Team Grid); avatar dots + attribution say "quotes".
const card = (x, y, h, lines) => [
  plate(x, y, 304, h),
  ...lines.map((w, i) => bar(x + 24, y + 28 + i * 26, w, "micro", { fill: glyph })),
  dot(x + 40, y + h - 44, 16, { fill: subject }),
  bar(x + 68, y + h - 52, 120, "micro", { fill: subject }),
  bar(x + 68, y + h - 30, 88, "micro", { fill: glyph }),
];

export default preview({
  width: B.w,
  draw: [
    bar(460, 0, 360, "heading", { fill: subject }),
    bar(400, 44, 480, "micro", { fill: glyph }),

    ...card(160, 108, 236, [256, 240, 208]),
    ...card(160, 368, 200, [240, 176]),

    ...card(488, 108, 196, [256, 184]),
    ...card(488, 328, 258, [256, 248, 232, 160]),

    ...card(816, 108, 272, [256, 244, 224, 180]),
    ...card(816, 404, 188, [232, 152]),
  ],
});
