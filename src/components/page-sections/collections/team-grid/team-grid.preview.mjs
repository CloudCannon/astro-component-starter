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

// Three portrait cards under a centred header, name and bio BELOW the photo —
// that outside-the-frame text separates it from the generic `grid` wrapper.
// Explicit column x values keep the built SVG diff-clean against the reference.
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
