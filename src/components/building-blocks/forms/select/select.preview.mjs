import {
  frame,
  stack,
  card,
  row,
  heading,
  text,
  caret,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// The chevron is the cue that reads as "opens a menu" — without it a select is
// the same silhouette as a text input.
export default frame(
  stack({ gap: 18, align: "start", w: 940 }, [
    heading({ w: 150, h: 16 }),
    card({ pad: 20, w: 940, border: T.controlBorder }, [
      row({ justify: "between", align: "center", w: 900 }, [
        text({ lines: 1, w: 150, fill: T.eyebrow }),
        caret({ w: 22 }),
      ]),
    ]),
  ])
);
