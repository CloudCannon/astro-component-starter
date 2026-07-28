import { frame, card, row, heading, text, T } from "../../../../../scripts/previews/kit.mjs";

// A hidden field renders nothing on the page, so the preview stands in for what
// it *is*: a tinted key/value pair carried with the form, with no visible label
// or input box of its own.
export default frame(
  card({ pad: 36, w: 700, bg: T.frameAlt, border: T.controlBorder, align: "center" }, [
    row({ gap: 24, align: "center" }, [
      heading({ w: 150, h: 14 }),
      text({ lines: 1, w: 320, fill: T.eyebrow }),
    ]),
  ])
);
