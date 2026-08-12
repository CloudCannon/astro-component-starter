import { preview, band, box, bar, poly, ink, onInk } from "../../../../scripts/previews/kit.mjs";

const B = band(1120);

// The full-width ink strip with a centred message, trailing link and dismiss X
// is the component; the muted heading/body bars beneath hint at the page it
// sits above.
export default preview({
  width: B.w,
  draw: [
    box(B.left, 0, B.w, 72, { fill: ink }),
    bar(445, 32, 290, "micro"),
    bar(751, 32, 84, "micro"),
    poly(
      [
        [1155, 28],
        [1158, 25],
        [1173, 44],
        [1170, 47],
      ],
      { fill: onInk }
    ),
    poly(
      [
        [1173, 28],
        [1170, 25],
        [1155, 44],
        [1158, 47],
      ],
      { fill: onInk }
    ),

    bar(B.left, 130, 430, "heading"),
    bar(B.left, 184, 780, "body"),
    bar(B.left, 212, 690, "body"),
  ],
});
