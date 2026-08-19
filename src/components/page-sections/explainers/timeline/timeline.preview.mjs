import { preview, band, bar, box, ink, line } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Same vertical rail as the wrapper, plus a heading bar so the page section
// does not twin the wrapper tile.
export default preview({
  width: B.w,
  draw: [
    bar(B.left + 140, 0, 480, "heading"),
    box(B.left + 148, 86, 2, 268, { fill: line }),
    [0, 1, 2].map((i) => {
      const y = 68 + i * 124;

      return [
        bar(B.left, y + 8, 100, "label"),
        box(B.left + 142, y + 12, 14, 14, { r: 7, fill: ink }),
        bar(B.left + 184, y + 4, 280, "heading"),
        bar(B.left + 184, y + 40, B.w - 184, "micro"),
      ];
    }),
  ],
});
