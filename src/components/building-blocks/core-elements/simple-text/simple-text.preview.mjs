import { preview, band, lines } from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

export default preview({
  width: B.w,
  draw: lines(B.left, 358, [760, 760, 760, 418]),
});
