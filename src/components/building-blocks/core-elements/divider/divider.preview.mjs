import { frame, stack, text, divider } from "../../../../../scripts/previews/kit.mjs";

// A horizontal rule separating two blocks of content.
export default frame(
  stack({ gap: 32, align: "center" }, [
    text({ lines: 2, w: 680, last: 0.7, align: "center" }),
    divider({ w: 760 }),
    text({ lines: 2, w: 680, last: 0.6, align: "center" }),
  ])
);
