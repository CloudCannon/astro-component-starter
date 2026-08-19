import {
  preview,
  band,
  box,
  bar,
  plate,
  pill,
  ink,
  line,
  glyph,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Three plan cards under a centred header. The cues vs other "grid of things"
// sections: a loud price bar, a bottom CTA pill, and the middle card's badge.
const CARD_X = [160, 488, 816];

export default preview({
  width: B.w,
  draw: [
    bar(585, 0, 110, "body", { fill: glyph }),
    bar(380, 32, 520, "display"),

    CARD_X.map((x, i) => {
      const highlighted = i === 1;

      return [
        highlighted
          ? box(x, 120, 304, 300, { r: 12, fill: "none", stroke: ink, sw: 3 })
          : plate(x, 120, 304, 300),
        highlighted && box(x + 28, 108, 96, 26, { r: 13, fill: ink }),
        bar(x + 28, 152, 110, "body"),
        bar(x + 28, 184, 150, "heading", { fill: subject }),
        box(x + 28, 232, 248, 2, { fill: line }),
        bar(x + 28, 252, 200, "body"),
        bar(x + 28, 276, 176, "body"),
        bar(x + 28, 300, 200, "body"),
        pill(x + 28, 340, 248, 48, { variant: highlighted ? "ink" : "ghost" }),
      ].filter(Boolean);
    }),
  ],
});
