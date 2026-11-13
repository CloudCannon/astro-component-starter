import {
  preview,
  band,
  bar,
  box,
  field,
  paper,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// The calendar tile keeps it from twinning `select`'s chevron thumbnail.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 296, 150, "label"),
    field(B.left, 332, 760, 72),
    bar(290, 362, 40, "body"),
    bar(342, 362, 40, "body"),
    bar(394, 362, 72, "body"),
    box(955, 351, 34, 34, { fill: subject }),
    box(954, 362, 36, 3, { r: 0, fill: paper }),
  ],
});
