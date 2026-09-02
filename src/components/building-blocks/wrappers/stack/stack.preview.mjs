import { preview, band, bar, box, lines } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// One column of MIXED blocks — heading, media, body copy — separated by one
// identical gap. The even gap is the subject; the blocks are deliberately
// different kinds so it doesn't read as Grid's uniform columns.
const GAP = 48;
const headingBottom = 26;
const mediaTop = headingBottom + GAP;
const mediaBottom = mediaTop + 150;
const copyTop = mediaBottom + GAP;

export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 320, "heading"),
    box(B.left, mediaTop, B.w, 150),
    lines(B.left, copyTop, [760, 452]),
  ],
});
