import {
  preview,
  band,
  bar,
  box,
  plate,
  repeat,
  panel,
  line,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// All rows collapsed deliberately: an expanded one reads as the FAQ section.
export default preview({
  width: B.w,
  draw: repeat(3, (i) => {
    const y = i * 84;

    return [
      plate(B.left, y, 760, 68),
      bar(281, y + 21, 227, "heading"),
      box(974, y + 21, 26, 26, { r: 13, fill: panel, stroke: line }),
    ];
  }),
});
