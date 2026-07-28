import { frame, stack, row, eyebrow, button } from "../../../../../scripts/previews/kit.mjs";

// A single call-to-action button (primary), paired with a ghost variant so the
// pill shape reads clearly at thumbnail size.
export default frame(
  stack({ gap: 30, align: "center" }, [
    eyebrow({ w: 130 }),
    row({ gap: 24, justify: "center" }, [
      button({ w: 260, h: 62 }),
      button({ w: 260, h: 62, variant: "ghost" }),
    ]),
  ])
);
