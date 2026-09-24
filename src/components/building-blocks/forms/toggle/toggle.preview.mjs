import { preview, band, bar, toggle } from "../../../../../scripts/previews/kit.mjs";

const B = band(560);

export default preview({
  width: B.w,
  draw: [toggle(B.left, 0, 97, 52, true), bar(494, 13, 426, "heading")],
});
