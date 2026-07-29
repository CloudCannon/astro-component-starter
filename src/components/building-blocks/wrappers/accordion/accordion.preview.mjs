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

// Three collapsed rows, each a header plus a round chevron chip. All collapsed
// deliberately: an expanded row would make this read as the FAQ section instead.
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
