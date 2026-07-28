import { frame, stack, row, image } from "../../../../../scripts/previews/kit.mjs";

// Bento box: asymmetric grid of media tiles spanning different sizes.
export default frame(
  stack({ gap: 16, align: "center" }, [
    row({ gap: 16, align: "start" }, [
      image({ w: 360, h: 380 }),
      stack({ gap: 16 }, [image({ w: 260, h: 182 }), image({ w: 260, h: 182 })]),
      image({ w: 200, h: 380 }),
    ]),
    row({ gap: 16 }, [image({ w: 400, h: 150 }), image({ w: 440, h: 150 })]),
  ])
);
