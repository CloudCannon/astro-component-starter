import {
  frame,
  stack,
  grid,
  eyebrow,
  heading,
  text,
  icon,
} from "../../../../../scripts/previews/kit.mjs";

// Centered header, then a 3-up grid of feature cells (icon + title + copy).
const cell = () =>
  stack({ gap: 14, align: "center", w: 200 }, [
    icon({ d: 46 }),
    heading({ w: 130, h: 16 }),
    text({ lines: 2, w: 184, last: 0.7, align: "center" }),
  ]);

export default frame(
  stack({ gap: 56, align: "center" }, [
    stack({ gap: 20, align: "center" }, [
      eyebrow({ w: 110 }),
      heading({ w: 460, h: 36 }),
      text({ lines: 2, w: 620, last: 0.6, align: "center" }),
    ]),
    grid({ cols: 3, gap: 48, cell }),
  ])
);
