import {
  preview,
  band,
  bar,
  box,
  caret,
  chevron,
  media,
  plate,
  rule,
  tile,
  glyph,
} from "../../../../scripts/previews/kit.mjs";

const B = band(1120);

// Logo left, links and a search tile right, a full-width rule, then two open
// dropdowns. The logo plus the rule are what separate this from `bar`.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 8, 159, "heading"),
    bar(496, 13, 69, "label"),
    bar(609, 13, 109, "label"),
    caret(726, 17, 18, { h: 9 }),
    bar(788, 13, 87, "label"),
    tile(1033, 0, 42),
    bar(1097, 13, 83, "label"),
    box(1188, 15, 12, 12, { r: 3, fill: glyph }),

    rule(B.left, 74, 1120),

    media(609, 106, 317, 156),
    bar(639, 136, 159, "label", { fill: glyph }),
    bar(639, 176, 208, "label", { fill: glyph }),
    chevron(883, 177, 14, 14, "right"),
    bar(639, 216, 149, "label", { fill: glyph }),

    plate(942, 160, 258, 116),
    bar(972, 190, 168, "label", { fill: glyph }),
    bar(972, 230, 139, "label", { fill: glyph }),
  ],
});
