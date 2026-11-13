import {
  preview,
  band,
  bar,
  box,
  ink,
  line,
  panel,
  rule,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

export default preview({
  width: B.w,
  draw: [
    box(B.left, 0, B.w, 222, { r: 10, fill: panel, stroke: line, sw: 2 }),
    bar(B.left + 26, 18, 56, "micro", { fill: subject }),
    bar(B.left + 106, 18, 48, "micro", { fill: subject, opacity: 0.55 }),
    bar(B.right - 78, 18, 48, "micro", { fill: subject }),
    rule(B.left, 46, B.w),
    rule(B.left + 26, 44, 56, { fill: ink, h: 4 }),
    bar(B.left + 28, 78, 220, "body", { fill: subject }),
    bar(B.left + 52, 108, 206, "body", { fill: subject }),
    bar(B.left + 52, 138, 318, "body", { fill: subject }),
    bar(B.left + 28, 168, 34, "body", { fill: subject }),
    rule(B.left, 190, B.w),
    bar(B.left + 28, 202, 202, "micro", { fill: subject }),
  ],
});
