import { frame, row, button } from "../../../../../scripts/previews/kit.mjs";

// A row of page-number cells; the current page is filled (primary), the rest
// are outlined.
export default frame(
  row({ gap: 12, justify: "center" }, [
    button({ w: 92, h: 72, variant: "ghost" }),
    button({ w: 92, h: 72, variant: "ghost" }),
    button({ w: 92, h: 72, variant: "primary" }),
    button({ w: 92, h: 72, variant: "ghost" }),
    button({ w: 92, h: 72, variant: "ghost" }),
  ])
);
