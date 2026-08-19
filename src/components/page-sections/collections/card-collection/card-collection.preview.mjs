import {
  preview,
  band,
  plate,
  media,
  bar,
  pill,
  glyph,
  subject,
  sun,
  peak,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Three cards, each a cover photo over a badge / title / description stack. The
// cover + badge separate it from Feature Grid (icons) and Team Grid (portraits).
const card = (x) => [
  plate(x, 120, 304, 396),
  media(x, 120, 304, 176, { r: 0 }),
  sun(x + 236, 172, 20),
  peak(x + 16, x + 180, x + 98, 296, 200),
  peak(x + 132, x + 288, x + 210, 296, 224),
  pill(x + 24, 320, 92, 28, { variant: "outline", label: 48, r: 14 }),
  bar(x + 24, 368, 200, "label", { fill: subject }),
  bar(x + 24, 404, 256, "micro", { fill: glyph }),
  bar(x + 24, 430, 232, "micro", { fill: glyph }),
];

export default preview({
  width: B.w,
  draw: [
    bar(480, 0, 320, "heading", { fill: subject }),
    bar(420, 44, 440, "micro", { fill: glyph }),

    ...card(160),
    ...card(488),
    ...card(816),
  ],
});
