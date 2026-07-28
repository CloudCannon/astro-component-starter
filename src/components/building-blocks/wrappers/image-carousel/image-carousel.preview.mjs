import { frame, stack, row, image } from "../../../../../scripts/previews/kit.mjs";

// Image carousel: a large hero image above a thumbnail navigation strip.
export default frame(
  stack({ gap: 18, align: "center" }, [
    image({ w: 760, h: 440 }),
    row({ gap: 14, justify: "center" }, [
      image({ w: 120, h: 80 }),
      image({ w: 120, h: 80 }),
      image({ w: 120, h: 80 }),
      image({ w: 120, h: 80 }),
    ]),
  ])
);
