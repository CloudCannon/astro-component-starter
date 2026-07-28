import {
  frame,
  card,
  row,
  heading,
  text,
  button,
  chip,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// Modal: a floating dialog (heading + close, copy, actions) over a dimmed page.
export default frame(
  { bg: T.frameAlt },
  card({ pad: 32, gap: 22, w: 460 }, [
    row({ justify: "between", align: "center", w: 460 }, [
      heading({ w: 220, h: 22 }),
      chip({ w: 26 }),
    ]),
    text({ lines: 3, w: 460, last: 0.5 }),
    row({ gap: 14, justify: "end", w: 460 }, [
      button({ w: 120, variant: "ghost" }),
      button({ w: 120 }),
    ]),
  ])
);
