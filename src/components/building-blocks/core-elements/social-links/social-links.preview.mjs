import { preview, box, glyph, ink, onInk } from "../../../../../scripts/previews/kit.mjs";

// Four ghost glyph squares over four solid ink tiles — showing both variants
// distinguishes this from button-group. Exempt from the width bands.
export default preview({
  width: 280,
  exempt: true,
  draw: [
    [0, 1, 2, 3].map((i) => box(492 + i * 76, 330, 28, 28, { r: 8, fill: glyph })),
    [0, 1, 2, 3].map((i) => [
      box(480 + i * 76, 406, 52, 52, { r: 10, fill: ink }),
      box(494 + i * 76, 420, 24, 24, { r: 7, fill: onInk }),
    ]),
  ],
});
