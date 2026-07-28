import { frame, stack, heading, text, button, T } from "../../../../../scripts/previews/kit.mjs";

// Tight centered call-to-action on the tinted surface: heading, supporting copy, one primary button.
export default frame(
  { bg: T.frameAlt },
  stack({ align: "center", gap: 24 }, [
    heading({ w: 540, h: 36 }),
    text({ lines: 2, w: 640, last: 0.65, align: "center" }),
    button({ w: 150 }),
  ])
);
