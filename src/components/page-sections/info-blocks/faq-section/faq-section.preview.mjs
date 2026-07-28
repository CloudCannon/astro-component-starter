import {
  frame,
  stack,
  row,
  card,
  heading,
  text,
  icon,
} from "../../../../../scripts/previews/kit.mjs";

// FAQ accordion: centered heading, then a vertical stack of question rows (chevron chip), first one expanded.
const q = (open = false) =>
  card({ pad: 24, w: 820, gap: 16 }, [
    row({ justify: "between", w: 772 }, [heading({ w: 240, h: 18 }), icon({ d: 22 })]),
    ...(open ? [text({ lines: 2, w: 640, last: 0.7 })] : []),
  ]);

export default frame(
  stack({ gap: 36, align: "center" }, [
    heading({ w: 520, h: 34 }),
    stack({ gap: 16 }, [q(true), q(), q()]),
  ])
);
