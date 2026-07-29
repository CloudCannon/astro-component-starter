import {
  preview,
  band,
  bar,
  box,
  lines,
  pill,
  plate,
  panel,
  line,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// The trigger button above the dialog it opens. Showing both is the only way a
// static thumbnail can say "modal" rather than "card".
export default preview({
  width: B.w,
  draw: [
    pill(555, 0, 171, 44, { label: 68 }),

    plate(B.left, 76, 560, 170),
    bar(394, 109, 235, "heading"),
    box(859, 108, 26, 26, { r: 13, fill: panel, stroke: line }),
    lines(394, 154, [492, 492, 246]),
  ],
});
