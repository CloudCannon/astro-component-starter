import { frame, stack, text, chip, spacer } from "../../../../../scripts/previews/kit.mjs";

// Adjustable vertical space between content: a labeled gap between two faint
// blocks of copy.
export default frame(
  stack({ gap: 0, align: "center" }, [
    text({ lines: 2, w: 620, last: 0.7, align: "center" }),
    spacer({ size: 44 }),
    chip({ w: 120 }),
    spacer({ size: 44 }),
    text({ lines: 2, w: 620, last: 0.6, align: "center" }),
  ])
);
