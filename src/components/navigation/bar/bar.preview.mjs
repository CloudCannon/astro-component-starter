import {
  preview,
  band,
  bar,
  caret,
  chevron,
  media,
  plate,
  glyph,
} from "../../../../scripts/previews/kit.mjs";

const B = band(760);

// A link row with two open dropdowns beneath it — one filled panel, one bordered
// with a nested submenu arrow. The open menus are the component: a bare row of
// labels would be indistinguishable from `main-nav`, which has the logo and rule.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 74, "label"),
    bar(381, 0, 106, "label"),
    caret(495, 4, 19, { h: 9 }),
    bar(561, 0, 102, "label"),
    caret(671, 4, 19, { h: 9 }),
    bar(736, 0, 116, "label"),
    caret(861, 4, 19, { h: 9 }),
    bar(927, 0, 93, "label"),

    media(381, 46, 318, 156),
    bar(412, 76, 191, "label", { fill: glyph }),
    bar(412, 116, 159, "label", { fill: glyph }),
    chevron(609, 117, 15, 14, "right"),
    bar(412, 156, 212, "label", { fill: glyph }),

    plate(715, 100, 275, 116),
    bar(747, 130, 169, "label", { fill: glyph }),
    bar(747, 170, 138, "label", { fill: glyph }),
  ],
});
