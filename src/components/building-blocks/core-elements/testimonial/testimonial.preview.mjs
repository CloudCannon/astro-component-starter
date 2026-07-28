import { frame, stack, avatar, heading, text } from "../../../../../scripts/previews/kit.mjs";

// A centered customer quote with the author's avatar, name, and role beneath.
export default frame(
  stack({ gap: 32, align: "center" }, [
    text({ lines: 2, w: 720, last: 0.6, gap: 18, align: "center" }),
    stack({ gap: 12, align: "center" }, [
      avatar({ d: 72 }),
      heading({ w: 180, h: 16 }),
      text({ lines: 1, w: 120, align: "center" }),
    ]),
  ])
);
