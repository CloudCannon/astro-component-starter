import { preview, band, bar, field, lines, pill } from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// The consent line keeps it distinct from the generic CTA layouts.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 168, 112, "micro"),
    bar(B.left, 196, 302, "heading"),
    lines(B.left, 236, [350, 262]),

    field(686, 186, 274, 52),
    pill(976, 186, 144, 52, { label: 62 }),
    lines(686, 258, [348, 274], { size: "micro", gap: 8 }),
  ],
});
