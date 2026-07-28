import { frame, stack, icon, text } from "../../../../../scripts/previews/kit.mjs";

// A single SVG icon tile, shown large with a short caption for context.
export default frame(
  stack({ gap: 26, align: "center" }, [
    icon({ d: 200 }),
    text({ lines: 1, w: 300, align: "center" }),
  ])
);
