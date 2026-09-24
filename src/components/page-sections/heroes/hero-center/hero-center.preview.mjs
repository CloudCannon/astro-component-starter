import { preview, band, bar, pill, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// The wider band and `label`-weight eyebrow are what separate it from `cta-center`.
export default preview({
  width: B.w,
  draw: [
    bar(577, 296, 127, "label", { fill: glyph }),
    bar(313, 328, 654, "display"),
    bar(B.left, 392, 760, "body"),
    bar(374, 416, 532, "body"),
    pill(561, 460, 158, 44, { label: 68 }),
  ],
});
