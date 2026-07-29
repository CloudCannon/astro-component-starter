import { preview, box, glyph, subject } from "../../../../../scripts/previews/kit.mjs";

// Three tall digit plates between a short prefix and suffix — the silhouette of
// a big animated number. Exempt: a lone stat stretched to a band reads as bars.
export default preview({
  width: 302,
  exempt: true,
  draw: [
    box(489, 370, 30, 60, { fill: glyph }),
    box(535, 356, 56, 88, { fill: subject }),
    box(607, 356, 56, 88, { fill: subject }),
    box(679, 356, 56, 88, { fill: subject }),
    box(751, 370, 40, 60, { fill: glyph }),
  ],
});
