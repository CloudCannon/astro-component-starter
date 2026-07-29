import { preview, band, bar, plate, tile } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// A display heading over four collapsed question rows. Four rows on the wider 960
// band is the tell against the `accordion` building block, which is three on 760.
const QUESTIONS = [265, 332, 288, 310];

export default preview({
  width: B.w,
  draw: [
    bar(352, 0, 575, "display"),
    QUESTIONS.map((w, i) => {
      const y = 72 + i * 86;

      return [plate(B.left, y, 960, 70), bar(187, y + 22, w, "heading"), tile(1017, y + 24, 22)];
    }),
  ],
});
