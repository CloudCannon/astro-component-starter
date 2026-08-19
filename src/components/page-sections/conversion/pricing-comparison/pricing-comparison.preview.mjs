import {
  preview,
  band,
  bar,
  rule,
  box,
  dot,
  pill,
  glyph,
  subject,
  surface,
  line,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A matrix: a feature label column, three plan columns of tick/dash marks, one
// tinted for the recommended plan. The marks separate it from Pricing Tiers.
const COLS = [520, 680, 840];
const ROWS = [140, 196, 252, 308, 364];

const tick = (cx, cy) => dot(cx, cy, 9, { fill: subject });
const dash = (cx, cy) => bar(cx - 9, cy - 3, 18, "micro", { fill: glyph });

export default preview({
  width: B.w,
  draw: [
    // Recommended column tint, drawn first so rules sit on top.
    box(660, 80, 152, 348, { r: 0, fill: surface }),

    bar(B.left, 88, 120, "label", { fill: glyph }),
    bar(524, 84, 96, "label", { fill: subject }),
    bar(684, 84, 96, "label", { fill: subject }),
    bar(844, 84, 96, "label", { fill: subject }),
    rule(B.left, 116, B.w, { fill: line, h: 2 }),

    ...ROWS.flatMap((y, rowIndex) => [
      bar(B.left, y, rowIndex % 2 === 0 ? 232 : 184, "micro", { fill: glyph }),
      rowIndex === 0
        ? tick(COLS[0], y + 4)
        : rowIndex % 2 === 0
          ? dash(COLS[0], y + 4)
          : tick(COLS[0], y + 4),
      tick(COLS[1], y + 4),
      rowIndex === 3 ? dash(COLS[2], y + 4) : tick(COLS[2], y + 4),
      rule(B.left, y + 28, B.w, { fill: line }),
    ]),

    pill(504, 440, 128, 36, { variant: "outline", label: 64 }),
    pill(664, 440, 128, 36, { label: 64 }),
    pill(824, 440, 128, 36, { variant: "outline", label: 64 }),
  ],
});
