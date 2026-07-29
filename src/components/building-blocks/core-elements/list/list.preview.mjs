import {
  preview,
  band,
  bar,
  box,
  repeat,
  subject,
  body,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Square subject markers, generously spaced — a bulleted list at a glance. The
// marker shape (square, not a dot) is what separates this from `text`'s bullets.
const WIDTHS = [650, 711, 569];

export default preview({
  width: B.w,
  draw: repeat(3, (i) => [
    box(B.left, 300 + i * 52, 28, 28, { fill: subject }),
    bar(309, 306 + i * 52, WIDTHS[i], "label", { fill: body }),
  ]),
});
