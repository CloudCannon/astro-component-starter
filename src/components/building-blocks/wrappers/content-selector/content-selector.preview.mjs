import { preview, band, bar, lines, pill, plate } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// Vertical tabs, not a top strip, so it does not read as `segments`.
export default preview({
  width: B.w,
  draw: [
    pill(B.left, 0, 239, 56, { label: 152 }),
    plate(B.left, 72, 239, 56),
    bar(303, 94, 130, "body"),
    plate(B.left, 144, 239, 56),
    bar(303, 166, 163, "body"),

    bar(564, 0, 326, "heading"),
    lines(564, 46, [456, 456, 456, 282]),
  ],
});
