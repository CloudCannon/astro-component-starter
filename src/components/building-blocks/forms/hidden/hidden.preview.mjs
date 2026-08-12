import { preview, band, bar, field } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// A hidden field renders nothing on the page, so the preview stands in for what
// it *is*: a key/value pair carried with the form. The dashed outline and the
// half-opacity contents are the "not rendered" cue.
export default preview({
  width: B.w,
  draw: [
    field(B.left, 330, 760, 140, { dash: "8 12" }),
    bar(310, 392, 180, "label", { opacity: 0.45 }),
    bar(530, 394, 240, "body", { opacity: 0.45 }),
  ],
});
