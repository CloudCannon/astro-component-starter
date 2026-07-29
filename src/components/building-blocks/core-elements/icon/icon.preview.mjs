import { preview, box, poly, R, surface, subject } from "../../../../../scripts/previews/kit.mjs";

// A generic glyph on a big rounded plate. Exempt: stretching a single 200px
// icon to a 560 band would turn it into a wide slab.
export default preview({
  width: 200,
  exempt: true,
  draw: [
    box(540, 300, 200, 200, { r: R.tile, fill: surface }),
    poly(
      [
        [640, 346],
        [684, 400],
        [640, 454],
        [596, 400],
      ],
      { fill: subject }
    ),
  ],
});
