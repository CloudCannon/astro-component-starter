import { preview, band, bar, lines } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Two equal text columns with a wide gutter. Deliberately no media on either
// side — this wrapper splits whatever you put in it, so neither half is special.
const COLS = [
  { x: B.left, head: 267, last: 271 },
  { x: 669, head: 236, last: 361 },
];

export default preview({
  width: B.w,
  draw: COLS.map(({ x, head, last }) => [
    bar(x, 0, head, "heading"),
    lines(x, 46, [451, 451, 451, last]),
  ]),
});
