import {
  preview,
  band,
  bar,
  box,
  panel,
  line,
  subject,
  body,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// One tinted plate with a status disc, bold title, and two lines of prose —
// the tint + leading disc are what say "callout" instead of "card".
export default preview({
  width: B.w,
  draw: [
    box(260, 0, 760, 132, { r: 12, fill: panel, stroke: line, sw: 2 }),
    box(292, 32, 24, 24, { r: 12, fill: subject }),
    bar(332, 34, 190, "heading", { fill: subject }),
    bar(332, 74, 420, "body", { fill: body }),
    bar(332, 98, 330, "body", { fill: body }),
  ],
});
