import {
  frame,
  stack,
  row,
  card,
  heading,
  text,
  icon,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// Segmented control: adjacent segments with the active one filled.
const seg = (active = false) =>
  card({ pad: 22, w: 250, bg: active ? T.primary : T.frame, border: T.controlBorder }, [
    row({ gap: 14, align: "center", w: 206 }, [
      icon({ d: 26, fill: active ? T.primaryOn : T.controlBorder }),
      text({ lines: 1, w: 110, fill: active ? T.primaryOn : T.eyebrow }),
    ]),
  ]);

export default frame(
  stack({ gap: 26, align: "start" }, [
    heading({ w: 260, h: 24 }),
    row({ gap: 0 }, [seg(true), seg(), seg()]),
  ])
);
