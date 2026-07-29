import {
  preview,
  band,
  bar,
  box,
  lines,
  rule,
  panel,
  line,
  glyph,
} from "../../../../scripts/previews/kit.mjs";

const B = band(960);

// A tinted sidebar with a section title, a rule, one active link and five
// inactive ones — beside the page content it navigates. The content column is
// what makes this read as a sidebar rather than a standalone menu.
const LINKS = [160, 210, 150, 180, 140];

export default preview({
  width: B.w,
  title: "Side navigation",
  draw: [
    box(B.left, 233, 292, 334, { fill: panel, stroke: line }),
    bar(188, 261, 146, "label"),
    rule(188, 303, 236),
    bar(188, 325, 200, "label"),
    LINKS.map((w, i) => bar(188, 363 + i * 38, w, "label", { fill: glyph })),

    bar(516, 233, 420, "heading"),
    lines(516, 285, [604, 604, 604, 302]),
    lines(516, 391, [604, 604, 438]),
  ],
});
