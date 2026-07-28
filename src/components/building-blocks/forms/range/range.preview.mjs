import {
  frame,
  stack,
  row,
  heading,
  text,
  avatar,
  divider,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// Slider: filled track up to a dark knob, light track after it.
export default frame(
  stack({ gap: 30, align: "start", w: 1000 }, [
    row({ justify: "between", align: "center", w: 1000 }, [
      heading({ w: 170, h: 16 }),
      text({ lines: 1, w: 60, fill: T.eyebrow }),
    ]),
    row({ gap: 0, align: "center", w: 1000 }, [
      divider({ w: 500, h: 10, fill: T.primary }),
      avatar({ d: 40, fill: T.primary }),
      divider({ w: 460, h: 10, fill: T.controlBorder }),
    ]),
  ])
);
