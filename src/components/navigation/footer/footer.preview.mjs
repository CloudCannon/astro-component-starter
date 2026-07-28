import {
  frame,
  stack,
  row,
  heading,
  text,
  icon,
  divider,
} from "../../../../scripts/previews/kit.mjs";

// Footer: logo/blurb column + several link columns, a divider, and a bottom row
// with copyright and social icons. Faint page content sits above it.
const link = (w) => heading({ w, h: 13 });
const col = (h) =>
  stack({ gap: 15 }, [heading({ w: h, h: 15 }), link(120), link(100), link(112), link(88)]);

export default frame(
  stack({ gap: 52, w: 1140 }, [
    stack({ gap: 20, align: "center", w: 1140 }, [
      heading({ w: 440, h: 26 }),
      text({ lines: 1, w: 560, align: "center" }),
    ]),
    divider({ w: 1140 }),
    row({ justify: "between", align: "start", w: 1140 }, [
      stack({ gap: 16, w: 260 }, [
        heading({ w: 150, h: 22 }),
        text({ lines: 2, w: 240, last: 0.7 }),
      ]),
      col(78),
      col(92),
      col(70),
    ]),
    divider({ w: 1140 }),
    row({ justify: "between", align: "center", w: 1140 }, [
      text({ lines: 1, w: 220 }),
      row({ gap: 14 }, [icon({ d: 28 }), icon({ d: 28 }), icon({ d: 28 })]),
    ]),
  ])
);
