import {
  frame,
  card,
  row,
  heading,
  text,
  avatar,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// Radio/checkbox group: a stack of option rows with the first one selected.
const option = (selected = false) =>
  row({ gap: 20, align: "center" }, [
    avatar({ d: 26, fill: selected ? T.primary : T.controlBorder }),
    text({ lines: 1, w: 190, fill: T.eyebrow }),
  ]);

export default frame(
  card({ pad: 40, gap: 30, align: "start", w: 940, border: T.controlBorder }, [
    heading({ w: 220, h: 16 }),
    option(true),
    option(),
    option(),
  ])
);
