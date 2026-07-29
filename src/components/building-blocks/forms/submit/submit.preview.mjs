import { preview, pill } from "../../../../../scripts/previews/kit.mjs";

// Just the submit control, big. Exempt: this is one button, and stretching it to
// a band would make it indistinguishable from a filled section.
export default preview({
  width: 220,
  exempt: true,
  draw: pill(530, 0, 220, 76, { label: 112 }),
});
