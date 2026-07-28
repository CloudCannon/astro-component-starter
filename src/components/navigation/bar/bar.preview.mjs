import { frame, stack, row, heading, text, divider } from "../../../../scripts/previews/kit.mjs";

// Horizontal top nav: logo left, a row of links right — read as a page header
// with faint hero content beneath it.
const link = (w) => heading({ w, h: 14 });

export default frame(
  stack({ gap: 76, w: 1140 }, [
    row({ justify: "between", align: "center", w: 1140 }, [
      heading({ w: 160, h: 22 }),
      row({ gap: 44, align: "center" }, [link(70), link(92), link(80), link(66)]),
    ]),
    divider({ w: 1140 }),
    stack({ gap: 24, align: "center", w: 1140 }, [
      heading({ w: 520, h: 34 }),
      text({ lines: 2, w: 640, last: 0.6, align: "center" }),
    ]),
  ])
);
