import {
  frame,
  row,
  stack,
  card,
  heading,
  text,
  divider,
} from "../../../../scripts/previews/kit.mjs";

// Sidebar nav: a narrow bordered panel of link bars on the left (logo on top),
// with faint main content to the right for context.
const link = (w) => heading({ w, h: 15 });

export default frame(
  row({ gap: 64, align: "start", w: 1140 }, [
    card({ pad: 28, gap: 20, w: 240 }, [
      heading({ w: 150, h: 22 }),
      divider({ w: 240 }),
      link(200),
      link(160),
      link(210),
      link(150),
      link(180),
      link(140),
    ]),
    stack({ gap: 22, w: 780 }, [
      heading({ w: 420, h: 30 }),
      text({ lines: 4, w: 780, last: 0.5 }),
      text({ lines: 3, w: 780, last: 0.72 }),
    ]),
  ])
);
