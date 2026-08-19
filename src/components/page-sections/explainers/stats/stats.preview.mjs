import {
  preview,
  band,
  bar,
  box,
  line,
  glyph,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Four oversized number bars over small uppercase labels, split by hairline
// rules — the size jump and rules distinguish it from feature-grid and steps.
export default preview({
  width: B.w,
  draw: [
    bar(160, 12, 176, "display", { fill: subject }),
    bar(160, 78, 110, "micro"),

    bar(400, 12, 200, "display", { fill: subject }),
    bar(400, 78, 96, "micro"),
    bar(400, 102, 130, "micro", { fill: glyph }),

    bar(640, 12, 150, "display", { fill: subject }),
    bar(640, 78, 120, "micro"),

    bar(880, 12, 240, "display", { fill: subject }),
    bar(880, 78, 128, "micro"),
    bar(880, 102, 100, "micro", { fill: glyph }),

    [384, 624, 864].map((x) => box(x, 8, 2, 110, { fill: line })),
  ],
});
