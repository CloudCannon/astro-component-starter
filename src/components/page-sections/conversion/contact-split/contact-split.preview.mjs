import {
  preview,
  band,
  bar,
  box,
  plate,
  field,
  pill,
  glyph,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// One bordered card: prose and icon-detail rows left, stacked form fields with
// an ink submit right. The field outlines say "contact form", not a split.
export default preview({
  width: B.w,
  draw: [
    plate(160, 0, 960, 380),

    bar(200, 40, 90, "micro", { fill: glyph }),
    bar(200, 68, 240, "heading"),
    bar(200, 116, 280, "body"),
    [160, 200, 240, 280].map((y) => [
      box(200, y, 18, 18, { r: 5, fill: glyph }),
      bar(228, y + 3, 180, "micro"),
    ]),

    field(560, 40, 520, 56),
    field(560, 112, 520, 56),
    field(560, 184, 520, 100),
    pill(560, 300, 180, 48),
  ],
});
