import {
  frame,
  stack,
  row,
  card,
  chip,
  image,
  heading,
  text,
} from "../../../../../scripts/previews/kit.mjs";

// Content selector: a row of tabs above the selected content panel.
export default frame(
  stack({ gap: 24, align: "center" }, [
    row({ gap: 12, justify: "center" }, [chip({ w: 100 }), chip({ w: 100 }), chip({ w: 100 })]),
    card({ pad: 28, gap: 20, w: 640 }, [
      row({ gap: 28, align: "center", w: 640 }, [
        image({ w: 260, h: 200 }),
        stack({ gap: 14, w: 340 }, [
          heading({ w: 240, h: 20 }),
          text({ lines: 3, w: 340, last: 0.6 }),
        ]),
      ]),
    ]),
  ])
);
