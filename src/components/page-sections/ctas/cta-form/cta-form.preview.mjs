import {
  frame,
  row,
  stack,
  card,
  heading,
  text,
  button,
  image,
} from "../../../../../scripts/previews/kit.mjs";

// Split CTA with a contact form: heading + copy + label/field pairs + submit on the left, image on the right.
const field = (h = 44) =>
  stack({ gap: 8 }, [text({ lines: 1, w: 70 }), card({ pad: 0, w: 360, h })]);

export default frame(
  row({ gap: 64, align: "center" }, [
    stack({ gap: 22, align: "start", w: 400 }, [
      heading({ w: 300, h: 34 }),
      text({ lines: 2, w: 380, last: 0.6 }),
      field(),
      field(),
      field(96),
      button({ w: 150 }),
    ]),
    image({ w: 520, h: 560 }),
  ])
);
