import {
  frame,
  row,
  stack,
  heading,
  text,
  button,
  image,
} from "../../../../../scripts/previews/kit.mjs";

// Split CTA: heading + copy + button on the left, image on the right (no eyebrow — tighter than the hero).
export default frame(
  row({ gap: 72, align: "center" }, [
    stack({ gap: 22, align: "start", w: 400 }, [
      heading({ w: 340, h: 36 }),
      text({ lines: 2, w: 380, last: 0.6 }),
      button({ w: 150 }),
    ]),
    image({ w: 560, h: 400 }),
  ])
);
