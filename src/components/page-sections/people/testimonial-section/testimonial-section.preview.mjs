import { preview, band, bar, dot, media } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A quote on a filled full-width surface, with the attribution centred beneath.
// The surface panel is what makes this a section rather than the `testimonial`
// building block, which sits on bare paper.
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
