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

// Three cover cards in a row — the open card (photo + badge + title) without
// section heading chrome, so it reads as the wrapper, not Card Collection.
const card = (x) => [
  plate(x, 0, 304, 396),
  media(x, 0, 304, 176, { r: 0 }),
  sun(x + 236, 52, 20),
  peak(x + 16, x + 180, x + 98, 176, 80),
  peak(x + 132, x + 288, x + 210, 176, 104),
  pill(x + 24, 200, 92, 28, { variant: "outline", label: 48, r: 14 }),
  bar(x + 24, 248, 200, "label", { fill: subject }),
  bar(x + 24, 284, 256, "micro", { fill: glyph }),
  bar(x + 24, 310, 232, "micro", { fill: glyph }),
];

export default preview({
  width: B.w,
  draw: [...card(160), ...card(488), ...card(816)],
});
