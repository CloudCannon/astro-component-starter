import { frame, stack, eyebrow, heading, text } from "../../../../../scripts/previews/kit.mjs";

// A lone section heading with a small eyebrow above and a supporting line below.
export default frame(
  stack({ gap: 22, align: "start" }, [
    eyebrow({ w: 130 }),
    heading({ w: 660, h: 52 }),
    text({ lines: 1, w: 780 }),
  ])
);
