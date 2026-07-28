import { frame, stack, row, heading, text } from "../../../../../scripts/previews/kit.mjs";

// Term/definition pairs: a bold term on the left, its definition on the right.
const pair = () =>
  row({ gap: 48, align: "start" }, [heading({ w: 220, h: 18 }), text({ lines: 1, w: 440 })]);

export default frame(stack({ gap: 26, align: "start" }, [pair(), pair(), pair()]));
