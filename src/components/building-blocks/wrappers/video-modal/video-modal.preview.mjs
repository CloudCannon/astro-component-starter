import {
  preview,
  band,
  bar,
  box,
  dot,
  media,
  plate,
  playDisc,
  ink,
  onInk,
} from "../../../../../scripts/previews/kit.mjs";

const B = band(760);

// A trigger with a leading play dot, above the dialog holding the player. Same
// trigger-plus-dialog logic as `modal`, with the video surface as the payload.
export default preview({
  width: B.w,
  draw: [
    box(537, 0, 205, 44, { fill: ink }),
    dot(568, 22, 10, { fill: onInk }),
    bar(589, 18, 113, "micro", { fill: onInk }),

    plate(B.left, 76, 760, 434),
    media(281, 96, 719, 394),
    playDisc(640, 293, 55, { back: 15, half: 28, reach: 26 }),
  ],
});
