import { preview, band, bar, dot, lines } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// The quote is `label`-weight subject across the full band — pulled up to the
// subject role because the quote, not the attribution, is the component.
export default preview({
  width: B.w,
  draw: [
    lines(B.left, 296, [760, 760, 520], { size: "label", gap: 18 }),
    dot(292, 448, 32),
    bar(344, 428, 200, "label"),
    bar(344, 456, 260, "body"),
  ],
});
