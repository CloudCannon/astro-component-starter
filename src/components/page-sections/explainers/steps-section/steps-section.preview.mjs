import { preview, band, bar, box, ink, line } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// No rail crosses the column gap, so this does not read as a Timeline.
export default preview({
  width: B.w,
  draw: [
    [0, 1, 2, 3].map((i) => {
      const x = B.left + i * 240;

      return [
        box(x, 0, 28, 28, { r: 14, fill: ink }),
        box(x + 36, 13, 204, 2, { fill: line }),
        bar(x, 48, 160, "heading"),
        bar(x, 80, i === 3 ? 240 : 180, "micro"),
      ];
    }),
  ],
});
