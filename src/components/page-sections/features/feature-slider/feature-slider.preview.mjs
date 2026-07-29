import {
  preview,
  band,
  bar,
  dot,
  lines,
  media,
  peak,
  sun,
  glyph,
  surface,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(1120);

// One slide — copy left, photo right — with the nav controls and dots on a row
// below. The controls are drawn in `surface` rather than `subject` here: this is
// a section, so the arrows should stay quieter than the content.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 94, 110, "body", { fill: glyph }),
    bar(B.left, 126, 379, "display"),
    lines(B.left, 186, [418, 418, 259]),

    media(638, 0, 562, 340),
    sun(1126, 76, 20),
    peak(678, 817, 758, 270, 180),
    peak(789, 947, 867, 270, 190),

    dot(102, 386, 22, { fill: surface }),
    dot(1178, 386, 22, { fill: surface }),
    dot(616, 386, 6, { fill: glyph }),
    dot(640, 386, 6, { fill: surface }),
    dot(664, 386, 6, { fill: surface }),
  ],
});
