import { frame, stack, row, heading, icon, divider } from "../../../../scripts/previews/kit.mjs";

// Mobile nav: a narrow drawer — logo + hamburger tile on top, then a stack of
// full-width menu link bars.
export default frame(
  stack({ gap: 22, align: "stretch", w: 420 }, [
    row({ justify: "between", align: "center", w: 420 }, [
      heading({ w: 140, h: 20 }),
      icon({ d: 42 }),
    ]),
    divider({ w: 420 }),
    heading({ h: 18 }),
    divider({ w: 420 }),
    heading({ h: 18 }),
    divider({ w: 420 }),
    heading({ h: 18 }),
    divider({ w: 420 }),
    heading({ h: 18 }),
  ])
);
