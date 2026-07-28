import {
  frame,
  stack,
  card,
  row,
  heading,
  text,
  button,
  T,
} from "../../../../../scripts/previews/kit.mjs";

// "Choose file" control: a ghost button paired with the selected-filename text.
export default frame(
  stack({ gap: 18, align: "start", w: 940 }, [
    heading({ w: 190, h: 16 }),
    card({ pad: 16, w: 940, border: T.controlBorder }, [
      row({ gap: 20, align: "center" }, [
        button({ w: 180, h: 44, variant: "ghost" }),
        text({ lines: 1, w: 200, fill: T.eyebrow }),
      ]),
    ]),
  ])
);
