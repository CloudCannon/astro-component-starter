import { preview, band, bar, repeat } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

const TERMS = [200, 180, 230, 200, 160];
const DEFS = [220, 220, 300, 300, 160];

export default preview({
  width: B.w,
  draw: repeat(5, (i) => [
    bar(B.left, 300 + i * 48, TERMS[i], "label"),
    bar(620, 302 + i * 48, DEFS[i], "body"),
  ]),
});
