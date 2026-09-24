import {
  preview,
  band,
  bar,
  box,
  lines,
  media,
  photoGlyph,
  subject,
  surface,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(1120);

const STEPS_X = 640;

export default preview({
  width: B.w,
  draw: [
    media(B.left, 40, 480, 300),
    photoGlyph(B.left, 40, 480, 300),
    box(B.left, 364, 480, 8, { r: 4, fill: surface }),
    box(B.left, 364, 320, 8, { r: 4, fill: subject }),

    bar(STEPS_X, 70, 90, "micro", { fill: subject }),
    bar(STEPS_X, 102, 440, "heading", { fill: subject }),
    lines(STEPS_X, 148, [560, 470]),
    bar(STEPS_X, 244, 90, "micro", { fill: subject }),
    bar(STEPS_X, 276, 440, "heading", { fill: subject }),
    lines(STEPS_X, 322, [560, 470]),
  ],
});
