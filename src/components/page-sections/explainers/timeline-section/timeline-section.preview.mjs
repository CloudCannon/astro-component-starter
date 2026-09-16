import { preview, band, bar, box, ink, line } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// A split rail beneath section chrome keeps the section distinct from the
// wrapper and makes the responsive alternate layout visible in the picker.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, B.w, "heading"),
    box(B.cx - 1, 86, 2, 268, { fill: line }),
    [0, 1, 2].map((i) => {
      const y = 68 + i * 124;

      return [
        box(B.cx - 9, y + 8, 18, 18, { r: 9, fill: ink }),
        i % 2 === 0
          ? [bar(B.left, y + 4, 260, "heading"), bar(B.left + 150, y + 40, 110, "micro")]
          : [bar(B.cx + 54, y + 4, 326, "heading"), bar(B.cx + 54, y + 40, 110, "micro")],
      ];
    }),
  ],
});
