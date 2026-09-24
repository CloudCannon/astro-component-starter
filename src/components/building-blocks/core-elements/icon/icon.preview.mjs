import { preview, box, poly, R, surface, subject } from "../../../../../scripts/previews/kit.mjs";

// Exempt: a single 200px icon stretched to a 560 band becomes a wide slab.
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
