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

// The archetype: eyebrow, display heading, three copy lines and a button pair on
// the left, a landscape photo on the right.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 87, 103, "body", { fill: glyph }),
    bar(B.left, 123, 376, "display"),
    lines(B.left, 185, [395, 395, 217]),

    pill(B.left, 269, 141, 44, { label: 60 }),
    pill(320, 269, 160, 44, { variant: "ghost", label: 60 }),

    media(632, 0, 488, 400),
    sun(974, 128, 24),
    peak(720, 925, 836, 312, 200),
    peak(851, 1051, 954, 312, 224),
  ],
});
