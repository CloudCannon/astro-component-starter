import { frame, card, heading, text, T } from "../../../../../scripts/previews/kit.mjs";

// Freeform builder: a large outlined content area (tinted card) with a centered heading + copy placeholder.
export default frame(
  card({ pad: 80, w: 900, align: "center", gap: 20, bg: T.frameAlt }, [
    heading({ w: 260, h: 24 }),
    text({ lines: 2, w: 420, last: 0.6, align: "center" }),
  ])
);
