import { preview, band, bar, tile, glyph } from "../../../../../scripts/previews/kit.mjs";

const B = band(1120);

const TILE_X = [80, 373, 666, 959];
const HEAD_X = [142, 435, 728, 1019];
const COPY_X = [80, 373, 666, 959];

export default preview({
  width: B.w,
  draw: [
    bar(585, 0, 110, "body", { fill: glyph }),
    bar(329, 32, 622, "display"),
    bar(279, 88, 723, "body"),
    bar(453, 112, 373, "body"),

    TILE_X.map((x, i) => [
      tile(x, 190, 46),
      bar(HEAD_X[i], 200, 181, "heading"),
      bar(COPY_X[i], 256, 241, "body"),
      bar(HEAD_X[i], 280, 181, "body"),
    ]),
  ],
});
