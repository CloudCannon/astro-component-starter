import {
  frame,
  stack,
  row,
  eyebrow,
  heading,
  text,
  button,
} from "../../../../../scripts/previews/kit.mjs";

// Centered hero: eyebrow, big heading, supporting copy, primary + ghost CTAs.
export default frame(
  stack({ align: "center", gap: 28 }, [
    eyebrow({ w: 120 }),
    heading({ w: 620, h: 40 }),
    text({ lines: 2, w: 720, last: 0.7, align: "center" }),
    row({ gap: 16, justify: "center" }, [button({ w: 150 }), button({ w: 150, variant: "ghost" })]),
  ])
);
