import {
  preview,
  band,
  bar,
  box,
  plate,
  media,
  pill,
  glyph,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(960);

// Three post cards (cover, tag pill, title, meta, excerpt) and a ghost view-all
// button. Covers + tag pills say "blog", vs pricing (bars) or features (icons).
export default preview({
  width: B.w,
  draw: [
    [160, 488, 816].map((x) => [
      plate(x, 0, 304, 296),
      media(x + 16, 16, 272, 120),
      box(x + 16, 152, 56, 22, { r: 11, fill: "none", stroke: glyph, sw: 2 }),
      bar(x + 16, 192, 220, "heading"),
      bar(x + 16, 228, 150, "micro", { fill: glyph }),
      bar(x + 16, 254, 250, "micro", { fill: glyph }),
    ]),
    pill(568, 336, 144, 48, { variant: "ghost" }),
  ],
});
