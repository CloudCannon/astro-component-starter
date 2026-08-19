import {
  preview,
  band,
  bar,
  lines,
  media,
  peak,
  pill,
  sun,
  glyph,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Eyebrow, heading, copy and a side-by-side button pair on the left; a tall
// portrait photo on the right. The eyebrow is what separates it from `cta-split`.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 169, 125, "body", { fill: glyph }),
    bar(B.left, 205, 417, "display"),
    lines(B.left, 267, [437, 241]),

    pill(B.left, 327, 104, 44, { label: 52 }),
    pill(277, 327, 104, 44, { variant: "ghost", label: 52 }),

    media(683, 0, 437, 540),
    sun(989, 173, 25),
    peak(762, 945, 866, 421, 270),
    peak(880, 1059, 971, 421, 302),
  ],
});
