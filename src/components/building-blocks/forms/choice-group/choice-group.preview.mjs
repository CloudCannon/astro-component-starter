import { preview, bar, checkbox, repeat, glyph } from "../../../../../scripts/previews/kit.mjs";

// Exempt from the width bands: stretched to 560 the labels float in space.
const OPTIONS = [190, 230, 170, 200];

export default preview({
  width: 270,
  exempt: true,
  draw: [
    bar(505, 0, 220, "label"),
    repeat(4, (i) => [
      checkbox(505, 44 + i * 56, 26, i === 1),
      bar(545, 51 + i * 56, OPTIONS[i], "body", { fill: glyph }),
    ]),
  ],
});
