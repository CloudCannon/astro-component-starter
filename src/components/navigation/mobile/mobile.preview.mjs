import { preview, bar, box, caret, tile, panel, line } from "../../../../scripts/previews/kit.mjs";

// Exempt from the width bands: stretching it would destroy the phone proportion.
const MENU = [150, 190, 160, 200, 130];

export default preview({
  width: 480,
  exempt: true,
  draw: [
    box(400, 0, 480, 420, { fill: panel, stroke: line }),
    tile(806, 32, 42),
    MENU.map((w, i) => bar(432, 110 + i * 62, w, "heading")),
    caret(814, 181, 18, { h: 9 }),
    caret(814, 305, 18, { h: 9 }),
  ],
});
