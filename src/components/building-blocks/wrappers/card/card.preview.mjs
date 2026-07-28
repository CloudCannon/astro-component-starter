import { frame, card, image, heading, text, button } from "../../../../../scripts/previews/kit.mjs";

// Card: a single bordered surface grouping image + heading + copy + action.
export default frame(
  card({ pad: 28, gap: 20, w: 460 }, [
    image({ w: 460, h: 260 }),
    heading({ w: 300, h: 24 }),
    text({ lines: 3, w: 460, last: 0.6 }),
    button({ w: 150 }),
  ])
);
