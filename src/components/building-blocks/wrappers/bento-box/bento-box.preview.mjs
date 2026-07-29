import { preview, band, bar, lines, media, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Four panels at three different sizes — one wide, one tall, two square. The
// asymmetry is the whole component; an even grid would just be `grid`.
export default preview({
  width: B.w,
  draw: [
    media(B.left, 180, 499, 208),
    bar(282, 214, 181, "label"),
    lines(282, 246, [434, 326], { fill: glyph }),

    media(781, 180, 239, 440),
    bar(803, 214, 127, "label"),
    lines(803, 246, [195, 163, 181], { fill: glyph }),

    media(B.left, 412, 239, 208),
    bar(282, 446, 127, "label"),

    media(521, 412, 239, 208),
    bar(542, 446, 127, "label"),
  ],
});
