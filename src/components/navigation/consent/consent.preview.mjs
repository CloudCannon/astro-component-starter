import {
  preview,
  band,
  bar,
  box,
  lines,
  pill,
  paper,
  line,
} from "../../../../scripts/previews/kit.mjs";

const B = band(1120);

// The three actions make this read as consent controls rather than a generic notice.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 360, "heading"),
    lines(B.left, 52, [760, 650]),

    box(B.left, 142, B.w, 190, { fill: paper, stroke: line }),
    bar(112, 178, 310, "heading"),
    lines(112, 222, [530, 470]),
    bar(112, 282, 154, "body"),
    pill(710, 209, 150, 44, { label: 72, variant: "ghost" }),
    pill(876, 209, 154, 44, { label: 82, variant: "ghost" }),
    pill(1046, 209, 154, 44, { label: 76, variant: "ghost" }),
  ],
});
