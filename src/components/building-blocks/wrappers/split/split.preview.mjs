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

// Split: two side-by-side columns — copy on one side, media on the other.
export default frame(
  row({ gap: 56, align: "center" }, [
    stack({ gap: 20, align: "start", w: 420 }, [
      eyebrow({ w: 110 }),
      heading({ w: 380, h: 34 }),
      text({ lines: 4, w: 420, last: 0.5 }),
      button({ w: 150 }),
    ]),
    image({ w: 460, h: 380 }),
  ])
);
