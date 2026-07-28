import {
  frame,
  stack,
  grid,
  eyebrow,
  heading,
  text,
  image,
} from "../../../../../scripts/previews/kit.mjs";

// Team grid: centered eyebrow + heading + copy, then a 3-up grid of member cards (photo + name + role + bio).
const person = () =>
  stack({ gap: 0, w: 240 }, [
    image({ w: 240, h: 280 }),
    stack({ pad: 20, gap: 10, w: 240 }, [
      heading({ w: 150, h: 18 }),
      text({ lines: 1, w: 90 }),
      text({ lines: 2, w: 200, last: 0.7 }),
    ]),
  ]);

export default frame(
  stack({ gap: 48, align: "center" }, [
    stack({ gap: 16, align: "center" }, [
      eyebrow({ w: 100 }),
      heading({ w: 360, h: 34 }),
      text({ lines: 1, w: 340, align: "center" }),
    ]),
    grid({ cols: 3, gap: 32, cell: person }),
  ])
);
