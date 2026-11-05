import { preview, band, bar, box, ink, line } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

export default preview({
  width: B.w,
  draw: [
    box(B.cx - 1, 18, 2, 268, { fill: line }),
    [0, 1, 2].map((i) => {
      const y = i * 124;

      return [
        box(B.cx - 9, y + 8, 18, 18, { r: 9, fill: ink }),
        i % 2 === 0
          ? [bar(B.left, y + 4, 180, "heading"), bar(B.left + 76, y + 40, 104, "micro")]
          : [bar(B.cx + 54, y + 4, 226, "heading"), bar(B.cx + 54, y + 40, 104, "micro")],
      ];
    }),
  ],
});
