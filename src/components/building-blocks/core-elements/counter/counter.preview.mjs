import { frame, stack, heading, text } from "../../../../../scripts/previews/kit.mjs";

// One oversized stat number (e.g. "$100M") with a small caption underneath.
export default frame(
  stack({ gap: 22, align: "center" }, [
    heading({ w: 540, h: 96 }),
    text({ lines: 1, w: 240, align: "center" }),
  ])
);
