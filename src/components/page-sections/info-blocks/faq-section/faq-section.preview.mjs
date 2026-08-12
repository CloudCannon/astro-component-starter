import {
  preview,
  band,
  bar,
  box,
  plate,
  panel,
  line,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A display heading over four collapsed question rows, each with the same round
// chevron chip the `accordion` building block draws — the FAQ is that accordion
// inside a section. Four rows on the wider 960 band is the tell against the
// building block, which is three on 760.
const QUESTIONS = [265, 332, 288, 310];

export default preview({
  width: B.w,
  draw: [
    bar(352, 0, 575, "display"),
    QUESTIONS.map((w, i) => {
      const y = 72 + i * 86;

      return [
        plate(B.left, y, 960, 70),
        bar(187, y + 22, w, "heading"),
        box(1074, y + 22, 26, 26, { r: 13, fill: panel, stroke: line }),
      ];
    }),
  ],
});
