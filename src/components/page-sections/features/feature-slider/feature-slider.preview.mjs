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

// One slide — copy in the wide two-thirds column, portrait photo in the third —
// with the control row below: arrow buttons flanking the position dots, matching
// the component. The controls are drawn quieter than the content (glyph, not
// subject): this is a section. The active dot is the darker one.
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
