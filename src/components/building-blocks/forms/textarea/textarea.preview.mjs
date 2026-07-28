import { frame, stack, card, heading, text, T } from "../../../../../scripts/previews/kit.mjs";

// Multi-line field: the tall box plus wrapped placeholder lines are what
// separate it from `input` at thumbnail size.
export default frame(
  stack({ gap: 18, align: "start", w: 940 }, [
    heading({ w: 180, h: 16 }),
    card({ pad: 22, w: 940, h: 240, border: T.controlBorder }, [
      text({ lines: 3, w: 700, gap: 20, fill: T.eyebrow }),
    ]),
  ])
);
