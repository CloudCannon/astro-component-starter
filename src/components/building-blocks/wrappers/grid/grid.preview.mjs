import { preview, band, bar, lines } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Three even text columns. Explicit column x values rather than a computed pitch:
// the reference set spaces these 330 / 331 so the outer edges land on the band.
const COLS = [
  { x: B.left, head: 198, last: 209 },
  { x: 490, head: 176, last: 165 },
  { x: 821, head: 220, last: 247 },
];

export default preview({
  width: B.w,
  draw: COLS.map(({ x, head, last }) => [
    bar(x, 0, head, "heading"),
    lines(x, 46, [299, 299, last]),
  ]),
});
