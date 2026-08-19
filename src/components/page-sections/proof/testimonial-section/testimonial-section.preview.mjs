import { preview, band, bar, dot, media } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A quote on a filled full-width surface, attribution centred beneath. The
// panel is what makes it a section, vs the `testimonial` block on bare paper.
export default preview({
  width: B.w,
  draw: [
    media(B.left, 200, 960, 400),

    bar(252, 260, 775, "label"),
    bar(280, 294, 720, "label"),
    bar(400, 328, 480, "label"),

    dot(530, 430, 32),
    bar(576, 412, 166, "label"),
    bar(576, 440, 203, "body"),
  ],
});
