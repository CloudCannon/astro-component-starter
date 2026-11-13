import { preview, box, bar, ink, onInk } from "../../../../../scripts/previews/kit.mjs";

// Exempt from the width bands: one control stretched to 560 reads as distorted.
export default preview({
  width: 280,
  exempt: true,
  draw: [
    box(500, 362, 280, 76, { fill: ink }),
    box(566, 390, 20, 20, { r: 5, fill: onInk }),
    bar(602, 394, 112, "body", { fill: onInk }),
  ],
});
