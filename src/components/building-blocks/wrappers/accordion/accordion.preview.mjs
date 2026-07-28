import {
  frame,
  stack,
  row,
  card,
  heading,
  text,
  chip,
} from "../../../../../scripts/previews/kit.mjs";

// Accordion: stacked full-width rows, each a header bar + chevron chip.
// First row is expanded, revealing body copy.
const panel = (expanded) =>
  card({ pad: 22, gap: 16, w: 760 }, [
    row({ justify: "between", align: "center", w: 760 }, [
      heading({ w: 240, h: 18 }),
      chip({ w: 26 }),
    ]),
    ...(expanded ? [text({ lines: 3, w: 660, last: 0.5 })] : []),
  ]);

export default frame(
  stack({ gap: 16, align: "center" }, [panel(true), panel(false), panel(false)])
);
