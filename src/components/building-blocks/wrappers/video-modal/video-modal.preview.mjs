import { frame, card, image, button, T } from "../../../../../scripts/previews/kit.mjs";

// Video modal: a dialog holding a video frame with a play/watch control.
export default frame(
  { bg: T.frameAlt },
  card({ pad: 20, gap: 18, w: 700, align: "center" }, [
    image({ w: 700, h: 394, play: true }),
    button({ w: 170 }),
  ])
);
