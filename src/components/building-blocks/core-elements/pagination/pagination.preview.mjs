import { preview, bar, box, dot, ink, glyph, onInk } from "../../../../../scripts/previews/kit.mjs";

// Page numbers with the current page filled, then an ellipsis and a "last" link.
// Exempt: a row of small number chips has no business filling a 560 band.
export default preview({
  width: 440,
  exempt: true,
  draw: [
    bar(420, 392, 28, "label", { fill: glyph }),
    bar(488, 392, 28, "label", { fill: glyph }),
    box(556, 372, 72, 56, { fill: ink }),
    bar(578, 392, 28, "label", { fill: onInk }),
    bar(668, 392, 28, "label", { fill: glyph }),
    dot(740, 400, 4),
    dot(756, 400, 4),
    dot(772, 400, 4),
    bar(816, 392, 44, "label", { fill: glyph }),
  ],
});
