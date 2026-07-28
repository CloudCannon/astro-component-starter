import { frame, stack, card, heading, text, T } from "../../../../../scripts/previews/kit.mjs";

// Baseline single-line text field: label above one bordered box with a placeholder.
export default frame(
  stack({ gap: 18, align: "start", w: 940 }, [
    heading({ w: 150, h: 16 }),
    card({ pad: 20, w: 940, border: T.controlBorder }, [
      text({ lines: 1, w: 170, fill: T.eyebrow }),
    ]),
  ])
);
