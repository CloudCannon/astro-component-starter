import { frame, stack, heading, text } from "../../../../../scripts/previews/kit.mjs";

// A block of markdown-formatted content: a subheading plus flowing paragraphs.
export default frame(
  stack({ gap: 18, align: "start" }, [
    heading({ w: 420, h: 26 }),
    text({ lines: 3, w: 800, last: 0.75, gap: 14 }),
    text({ lines: 2, w: 800, last: 0.4, gap: 14 }),
  ])
);
