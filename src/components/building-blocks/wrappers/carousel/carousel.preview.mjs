import {
  preview,
  band,
  bar,
  box,
  dot,
  media,
  navButton,
  glyph,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A content slide flanked by round arrow buttons that sit OUTSIDE the panel, plus
// position dots below. The arrows are the component; without them this is a card.
// The active dot is an elongated bar — at this size a bigger circle is invisible.
export default preview({
  width: B.w,
  draw: [
    media(276, 190, 727, 380),
    bar(410, 300, 459, "heading"),
    bar(363, 350, 555, "body", { fill: glyph }),
    bar(420, 374, 440, "body", { fill: glyph }),

    navButton(200, 380, "left"),
    navButton(1080, 380, "right"),

    box(598, 621, 31, 8, { r: 4, fill: subject }),
    dot(651, 625, 5),
    dot(671, 625, 5),
  ],
});
