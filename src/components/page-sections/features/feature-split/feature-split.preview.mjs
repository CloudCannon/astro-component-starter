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

// Feature split: eyebrow + heading + copy + a row of buttons on the left, tall portrait image on the right.
export default frame(
  row({ gap: 72, align: "center" }, [
    stack({ gap: 22, align: "start", w: 430 }, [
      eyebrow({ w: 120 }),
      heading({ w: 400, h: 38 }),
      text({ lines: 2, w: 420, last: 0.55 }),
      row({ gap: 12 }, [button({ w: 100 }), button({ w: 100, variant: "ghost" })]),
    ]),
    image({ w: 420, h: 540 }),
  ])
);
