import {
  preview,
  band,
  bar,
  dot,
  media,
  navButton,
  glyph,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A content slide with the control row below — round arrow buttons flanking the
// position dots, matching where the component actually puts them. The active
// dot is the darker one, not a bigger or longer one.
export default preview({
  width: B.w,
  draw: [
    media(B.left, 150, 960, 380),
    bar(410, 260, 459, "heading"),
    bar(363, 310, 555, "body", { fill: glyph }),
    bar(420, 334, 440, "body", { fill: glyph }),

    navButton(550, 600, "left", { r: 28, half: 13, reach: 7, stem: 6 }),
    dot(618, 600, 6, { fill: subject }),
    dot(640, 600, 6),
    dot(662, 600, 6),
    navButton(730, 600, "right", { r: 28, half: 13, reach: 7, stem: 6 }),
  ],
});
