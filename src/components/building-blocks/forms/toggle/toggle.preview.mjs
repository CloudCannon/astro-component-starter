import { frame, row, card, heading, avatar, T } from "../../../../../scripts/previews/kit.mjs";

// Switch track with a dark knob pushed to one end, beside its label.
export default frame(
  row({ gap: 40, align: "center" }, [
    card({ pad: 10, w: 180, align: "end", border: T.controlBorder }, [
      avatar({ d: 64, fill: T.primary }),
    ]),
    heading({ w: 420, h: 28 }),
  ])
);
