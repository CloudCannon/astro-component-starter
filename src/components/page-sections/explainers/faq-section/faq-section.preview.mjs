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

// Four rows on the 960 band distinguish it from the accordion block (three on 760).
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
