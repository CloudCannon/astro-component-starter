import {
  preview,
  band,
  media,
  navButton,
  peak,
  repeat,
  sun,
  STROKE,
  subject,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// The thumbnail strip separates it from the plain carousel, the photo glyph from the content one.
export default preview({
  width: B.w,
  draw: [
    media(264, 120, 752, 450),
    sun(858, 232, 37),
    peak(335, 798, 565, 570, 368),

    navButton(200, 345, "left"),
    navButton(1080, 345, "right"),

    repeat(5, (i) =>
      media(264 + i * 154, 596, 136, 82, {
        stroke: i === 0 ? subject : undefined,
        sw: i === 0 ? STROKE.active : undefined,
      })
    ),
  ],
});
