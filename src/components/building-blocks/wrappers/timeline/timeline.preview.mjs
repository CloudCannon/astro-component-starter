import { preview, band, bar, box, ink, line } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// Dates in a left column, small dots on one continuous rail — not numbered
// circles, so it does not read as Steps.
export default preview({
  width: B.w,
  draw: [
    box(B.left + 132, 18, 2, 268, { fill: line }),
    [0, 1, 2].map((i) => {
      const y = i * 124;

      return [
        bar(B.left, y + 8, 88, "label"),
        box(B.left + 126, y + 12, 14, 14, { r: 7, fill: ink }),
        bar(B.left + 168, y + 4, 200, "heading"),
        bar(B.left + 168, y + 40, B.w - 168, "micro"),
      ];
    }),
  ],
});
