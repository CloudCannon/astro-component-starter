import {
  frame,
  card,
  stack,
  heading,
  spacer,
  button,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// The whole-form wrapper: several labelled fields plus a submit button.
const field = (labelW) =>
  stack({ gap: 12, align: "start", w: 780 }, [
    heading({ w: labelW, h: 14 }),
    card({ pad: 0, w: 780, h: 54, border: T.controlBorder }),
  ]);

export default frame(
  card({ pad: 48, gap: 28, align: "start", w: 860 }, [
    field(150),
    field(210),
    field(120),
    spacer({ size: 2 }),
    button({ w: 170, h: 52 }),
  ])
);
