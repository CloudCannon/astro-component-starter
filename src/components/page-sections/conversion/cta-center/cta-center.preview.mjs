import { preview, band, bar, pill } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

// Centred heading, two centred copy lines, one button. The narrowest band in the
// set — the tight measure is what makes it read as a focused CTA, not a hero.
export default preview({
  width: B.w,
  draw: [
    bar(410, 330, 460, "heading"),
    bar(B.left, 378, 560, "body"),
    bar(440, 402, 400, "body"),
    pill(565, 446, 150, 44, { label: 64 }),
  ],
});
