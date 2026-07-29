import {
  preview,
  band,
  bar,
  dot,
  lines,
  repeat,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Rich text: a heading, a paragraph, then a bulleted list. The mix is the point —
// it is what separates this from `simple-text`.
const BULLETS = [120, 140, 130, 110];

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 268, 520, "heading"),
    lines(B.left, 318, [760, 760, 520]),
    repeat(4, (i) => [
      dot(268, 424 + i * 24, 6, { fill: subject }),
      bar(300, 418 + i * 24, BULLETS[i], "body"),
    ]),
  ],
});
