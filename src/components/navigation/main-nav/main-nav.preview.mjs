import {
  frame,
  stack,
  row,
  heading,
  text,
  button,
  divider,
} from "../../../../scripts/previews/kit.mjs";

// Header nav: logo left, links right, plus an action button — the distinguishing
// feature vs. the plain bar. Faint hero beneath reads it as a page header.
const link = (w) => heading({ w, h: 14 });

export default frame(
  stack({ gap: 76, w: 1140 }, [
    row({ justify: "between", align: "center", w: 1140 }, [
      heading({ w: 160, h: 22 }),
      row({ gap: 40, align: "center" }, [
        link(70),
        link(92),
        link(80),
        button({ w: 118, variant: "ghost" }),
      ]),
    ]),
    divider({ w: 1140 }),
    stack({ gap: 24, align: "center", w: 1140 }, [
      heading({ w: 520, h: 34 }),
      text({ lines: 2, w: 640, last: 0.6, align: "center" }),
    ]),
  ])
);
