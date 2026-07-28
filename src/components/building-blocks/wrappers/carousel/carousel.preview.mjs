import { frame, stack, row, image, avatar } from "../../../../../scripts/previews/kit.mjs";

// Carousel: a wide slide flanked by circular arrow controls, dots beneath.
export default frame(
  stack({ gap: 28, align: "center" }, [
    row({ gap: 32, align: "center" }, [
      avatar({ d: 40 }),
      image({ w: 720, h: 420 }),
      avatar({ d: 40 }),
    ]),
    row({ gap: 12, justify: "center" }, [avatar({ d: 12 }), avatar({ d: 12 }), avatar({ d: 12 })]),
  ])
);
