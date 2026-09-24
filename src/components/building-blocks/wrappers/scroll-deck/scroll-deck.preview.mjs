import {
  preview,
  band,
  bar,
  dot,
  lines,
  panel,
  plate,
  repeat,
  subject,
  surface,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

const STEP = 40;
const RAIL_X = B.right - 7;

export default preview({
  width: B.w,
  draw: [
    plate(B.left + 2 * STEP, 0, 900 - 4 * STEP, 320, { fill: surface }),
    plate(B.left + STEP, STEP, 900 - 2 * STEP, 320, { fill: panel }),
    plate(B.left, 2 * STEP, 900, 320),

    bar(B.left + 56, 2 * STEP + 64, 420, "heading"),
    lines(B.left + 56, 2 * STEP + 124, [640, 520]),
    bar(B.left + 56, 2 * STEP + 216, 150, "label", { fill: subject }),

    repeat(3, (i) => dot(RAIL_X, 150 + i * 32, 7, { fill: i === 2 ? subject : surface })),
  ],
});
