import {
  preview,
  band,
  bar,
  dot,
  lines,
  media,
  navButton,
  photoGlyph,
  glyph,
  paper,
  subject,
  surface,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(1120);

// One slide (copy two-thirds, portrait photo one-third) over a control row of
// arrows flanking position dots. Controls are drawn quieter than the content.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 140, 110, "body", { fill: glyph }),
    bar(B.left, 172, 470, "display"),
    lines(B.left, 232, [520, 520, 330]),

    media(850, 0, 350, 440),
    photoGlyph(850, 0, 350, 440),

    navButton(550, 490, "left", { r: 22, fill: glyph, tri: paper, half: 10, reach: 6, stem: 5 }),
    dot(616, 490, 6, { fill: subject }),
    dot(640, 490, 6, { fill: surface }),
    dot(664, 490, 6, { fill: surface }),
    navButton(730, 490, "right", { r: 22, fill: glyph, tri: paper, half: 10, reach: 6, stem: 5 }),
  ],
});
