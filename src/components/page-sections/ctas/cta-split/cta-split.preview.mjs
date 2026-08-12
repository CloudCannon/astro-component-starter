import {
  preview,
  band,
  bar,
  lines,
  media,
  peak,
  pill,
  sun,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Copy left with the button pair below it — as the component lays them out —
// and photo right. No eyebrow — that is what keeps it tighter than
// `hero-split`, which is otherwise the same shape.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 120, 316, "display"),
    lines(B.left, 178, [354, 212]),

    pill(B.left, 246, 167, 44, { label: 60 }),
    pill(343, 246, 167, 44, { variant: "ghost", label: 60 }),

    media(774, 0, 346, 400),
    sun(1053, 96, 20),
    peak(811, 941, 886, 320, 220),
    peak(915, 1053, 982, 320, 236),
  ],
});
