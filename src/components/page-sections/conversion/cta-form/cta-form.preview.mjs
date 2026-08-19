import {
  preview,
  band,
  bar,
  field,
  lines,
  media,
  peak,
  pill,
  sun,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Copy plus a three-field contact form on the left, a tall photo on the right.
// The form is what separates this from `cta-split`.
const FIELDS = [
  { label: 88, y: 156, h: 44 },
  { label: 78, y: 242, h: 44 },
  { label: 107, y: 328, h: 96 },
];

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 46, 293, "display"),
    lines(B.left, 102, [371, 222]),

    FIELDS.map(({ label, y, h }) => [
      bar(B.left, y, label, "label"),
      field(B.left, y + 24, 351, h),
    ]),
    pill(B.left, 470, 146, 44, { label: 62 }),

    media(613, 0, 507, 560),
    sun(968, 179, 31),
    peak(704, 917, 825, 437, 280),
    peak(841, 1049, 947, 437, 314),
  ],
});
