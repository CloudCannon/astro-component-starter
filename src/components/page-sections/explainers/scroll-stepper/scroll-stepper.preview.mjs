import {
  preview,
  band,
  bar,
  box,
  glyph,
  lines,
  media,
  photoGlyph,
  subject,
  surface,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(1120);

const STEPS_X = 640;

// A pinned panel with a part-filled progress bar, beside three steps of which
// only the middle one is live. Spelling the inactive steps as bare headings is
// what separates this from feature-split at contact-sheet size: the subject is
// the swap, not the side-by-side.
export default preview({
  width: B.w,
  draw: [
    media(B.left, 40, 480, 300),
    photoGlyph(B.left, 40, 480, 300),
    box(B.left, 364, 480, 8, { r: 4, fill: surface }),
    box(B.left, 364, 320, 8, { r: 4, fill: subject }),

    bar(STEPS_X, 0, 380, "heading", { fill: glyph }),

    bar(STEPS_X, 96, 90, "micro", { fill: subject }),
    bar(STEPS_X, 122, 440, "heading", { fill: subject }),
    lines(STEPS_X, 168, [560, 470]),

    bar(STEPS_X, 300, 380, "heading", { fill: glyph }),
  ],
});
