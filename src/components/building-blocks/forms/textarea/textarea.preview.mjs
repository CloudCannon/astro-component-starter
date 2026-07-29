import { preview, band, bar, field, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// The tall box with a single placeholder line pinned to the top is what separates
// this from `input` — the empty space below is the affordance.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 240, 150, "label"),
    field(B.left, 276, 760, 248),
    bar(290, 306, 300, "body", { fill: glyph }),
  ],
});
