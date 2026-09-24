import { preview, band, bar, field } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

export default preview({
  width: B.w,
  draw: [
    field(B.left, 330, 760, 140, { dash: "8 12" }),
    bar(310, 392, 180, "label", { opacity: 0.45 }),
    bar(530, 394, 240, "body", { opacity: 0.45 }),
  ],
});
