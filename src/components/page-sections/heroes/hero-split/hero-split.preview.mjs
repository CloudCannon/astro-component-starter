import {
  frame,
  row,
  stack,
  eyebrow,
  heading,
  text,
  button,
  image,
} from "../../../../../scripts/previews/kit.mjs";

// Split hero: eyebrow + heading + copy + CTA on the left, image on the right.
export default frame(
  row({ gap: 72, align: "center" }, [
    stack({ gap: 24, align: "start", w: 430 }, [
      eyebrow({ w: 110 }),
      heading({ w: 400, h: 38 }),
      text({ lines: 3, w: 420, last: 0.55 }),
      button({ w: 150 }),
    ]),
    image({ w: 520, h: 400 }),
  ])
);
