import { frame, grid, card, image, heading, text } from "../../../../../scripts/previews/kit.mjs";

// Grid: uniform columns of content cards (image + heading + copy).
const cell = () =>
  card({ pad: 16, gap: 14, w: 240 }, [
    image({ w: 240, h: 150 }),
    heading({ w: 150, h: 16 }),
    text({ lines: 2, w: 240, last: 0.7 }),
  ]);

export default frame(grid({ cols: 3, gap: 28, cell }));
