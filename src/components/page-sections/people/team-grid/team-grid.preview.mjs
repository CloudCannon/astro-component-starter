import {
  preview,
  band,
  bar,
  lines,
  media,
  peak,
  sun,
  glyph,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Centred header, then three portrait cards with the name and bio BELOW the photo
// rather than inside it — that outside-the-frame text is what distinguishes a
// people grid from the generic `grid` wrapper.
//
// Explicit column x values: the reference set spaces these 264 / 263 so the outer
// edges land on the band, and nudges the third card's text a pixel.
const CARDS = [
  { x: B.left, text: 279 },
  { x: 524, text: 543 },
  { x: 787, text: 807 },
];

export default preview({
  width: B.w,
  draw: [
    bar(592, 0, 97, "body", { fill: glyph }),
    bar(466, 36, 349, "display"),
    bar(475, 98, 330, "body"),

    CARDS.map(({ x, text }) => [
      media(x, 158, 233, 280),
      sun(x + 163, 248, 14),
      peak(x + 42, x + 140, x + 98, 376, 298),
      peak(x + 105, x + 200, x + 153, 376, 315),
      bar(text, 458, 145, "heading"),
      lines(text, 508, [87, 194, 136]),
    ]),
  ],
});
