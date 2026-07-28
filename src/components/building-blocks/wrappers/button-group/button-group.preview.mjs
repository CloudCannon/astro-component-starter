import { frame, row, button } from "../../../../../scripts/previews/kit.mjs";

// Button group: buttons side by side, mixing primary + ghost.
export default frame(
  row({ gap: 20, justify: "center" }, [
    button({ w: 160 }),
    button({ w: 160, variant: "ghost" }),
    button({ w: 160, variant: "ghost" }),
  ])
);
