import {
  frame,
  stack,
  row,
  card,
  eyebrow,
  heading,
  text,
  icon,
  avatar,
} from "../../../../../scripts/previews/kit.mjs";

// Feature slider: centered header, a wide row of feature cards, and carousel nav dots below.
const slide = () =>
  card({ pad: 28, gap: 16, w: 300 }, [
    icon({ d: 46 }),
    heading({ w: 150, h: 18 }),
    text({ lines: 3, w: 250, last: 0.6 }),
  ]);

export default frame(
  stack({ gap: 40, align: "center" }, [
    stack({ gap: 16, align: "center" }, [
      eyebrow({ w: 110 }),
      heading({ w: 380, h: 32 }),
      text({ lines: 1, w: 520, align: "center" }),
    ]),
    row({ gap: 28 }, [slide(), slide(), slide()]),
    row({ gap: 12, justify: "center" }, [avatar({ d: 12 }), avatar({ d: 12 }), avatar({ d: 12 })]),
  ])
);
