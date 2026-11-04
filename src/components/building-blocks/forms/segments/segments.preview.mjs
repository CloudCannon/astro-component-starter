import {
  preview,
  band,
  bar,
  box,
  repeat,
  STROKE,
  glyph,
  ink,
  paper,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 283, "heading"),
    repeat(3, (i) => {
      const x = B.left + i * 320;
      const on = i === 0;
      const mark = on ? paper : glyph;

      return [
        box(x, 46, 320, 70, { fill: on ? ink : paper, stroke: glyph, sw: STROKE.control }),
        box(x + 25, 68, 26, 26, { fill: mark }),
        bar(x + 68, 75, 120, "body", { fill: mark }),
      ];
    }),
  ],
});
