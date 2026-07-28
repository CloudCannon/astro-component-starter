import { frame, stack, avatar, heading, text, T } from "../../../../../scripts/previews/kit.mjs";

// Centered customer testimonial on the tinted `surface` background:
// a multi-line quote, then avatar + author name + role.
export default frame(
  { bg: T.frameAlt },
  stack({ gap: 40, align: "center" }, [
    text({ lines: 3, w: 760, last: 0.5, gap: 18, align: "center" }),
    stack({ gap: 14, align: "center" }, [
      avatar({ d: 64 }),
      heading({ w: 170, h: 16 }),
      text({ lines: 1, w: 130, align: "center" }),
    ]),
  ])
);
