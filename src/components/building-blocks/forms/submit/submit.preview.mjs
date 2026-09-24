import { preview, pill } from "../../../../../scripts/previews/kit.mjs";

// Exempt: stretched to a band, one button reads as a filled section.
export default preview({
  width: 220,
  exempt: true,
  draw: pill(530, 0, 220, 76, { label: 112 }),
});
