import {
  preview,
  band,
  bar,
  box,
  line,
  glyph,
  body,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

const COL_X = [260, 468, 664, 860];

// Caption, uppercase header row over a heavy rule, then hairline-ruled rows —
// the rules-only silhouette says "table", not "list" or "definition list".
export default preview({
  width: B.w,
  draw: [
    bar(260, 0, 220, "micro", { fill: glyph }),
    COL_X.map((x, i) => bar(x, 32, i === 3 ? 160 : 110, "micro", { fill: body })),
    box(260, 60, 760, 3, { fill: subject }),

    [0, 1, 2, 3]
      .map((row) => [
        bar(260, 88 + row * 48, 120, "micro", { fill: subject }),
        COL_X.slice(1).map((x, i) =>
          bar(x, 88 + row * 48, i === 2 ? 160 : 96, "micro", { fill: glyph })
        ),
        row < 3 && box(260, 116 + row * 48, 760, 1, { fill: line }),
      ])
      .flat()
      .filter(Boolean),
  ],
});
