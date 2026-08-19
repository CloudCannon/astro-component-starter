import { preview, band, bar, box, ink, line } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// One unbroken rail from the first marker to the last — no stubs, no tail
// past the final disc. That is what separates this from a gapped tick list.
export default preview({
  width: B.w,
  draw: [
    box(B.left + 13, 14, 2, 248, { fill: line }),
    [0, 1, 2].map((i) => {
      const y = i * 124;

      return [
        box(B.left, y, 28, 28, { r: 14, fill: ink }),
        bar(B.left + 52, y + 6, 200, "heading"),
        bar(B.left + 52, y + 40, B.w - 52, "micro"),
      ];
    }),
  ],
});
