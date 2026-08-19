import {
  preview,
  band,
  bar,
  box,
  dot,
  media,
  playDisc,
  ink,
  onInk,
  panel,
  line,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// A trigger with a leading play dot, above the player. Close sits in a tile
// above the video (lightbox chrome) rather than on the dialog plate.
export default preview({
  width: B.w,
  draw: [
    box(537, 0, 205, 44, { fill: ink }),
    dot(568, 22, 10, { fill: onInk }),
    bar(589, 18, 113, "micro", { fill: onInk }),

    box(B.right - 28, 68, 28, 28, { fill: panel, stroke: line, r: 6 }),
    media(B.left, 108, 760, 428),
    playDisc(640, 322, 55, { back: 15, half: 28, reach: 26 }),
  ],
});
