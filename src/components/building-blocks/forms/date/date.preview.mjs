import {
  frame,
  stack,
  card,
  row,
  heading,
  text,
  icon,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// Trailing square tile reads as a calendar button — deliberately a different
// affordance from `select`'s chevron so the two thumbnails aren't twins.
export default frame(
  stack({ gap: 18, align: "start", w: 940 }, [
    heading({ w: 150, h: 16 }),
    card({ pad: 20, w: 940, border: T.controlBorder }, [
      row({ justify: "between", align: "center", w: 900 }, [
        text({ lines: 1, w: 150, fill: T.eyebrow }),
        icon({ d: 30, fill: T.controlBorder }),
      ]),
    ]),
  ])
);
