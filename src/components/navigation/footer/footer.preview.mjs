import { preview, band, bar, rule, tile, repeat } from "../../../../scripts/previews/kit.mjs";

const B = band(1120);

// Brand and top links, a full-width rule, then the legal line and social tiles.
// The rule spanning the whole 1120 band is what makes this read as a footer.
export default preview({
  width: B.w,
  draw: [
    bar(B.left, 0, 157, "heading"),
    bar(858, 5, 69, "label"),
    bar(966, 5, 108, "label"),
    bar(1113, 5, 86, "label"),

    rule(B.left, 74, 1120),

    bar(B.left, 116, 314, "body"),
    repeat(3, (i) => tile(1090 + i * 41, 108, 28)),
  ],
});
