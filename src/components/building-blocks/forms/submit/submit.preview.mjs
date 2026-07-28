import { frame, stack, card, spacer, button, T } from "../../../../../scripts/previews/kit.mjs";

// The submit control itself: trailing fields for context, then a prominent
// primary button — the emphasis is on the button, unlike the `form` wrapper.
export default frame(
  stack({ gap: 28, align: "center", w: 760 }, [
    card({ pad: 0, w: 760, h: 62, border: T.controlBorder }),
    card({ pad: 0, w: 760, h: 62, border: T.controlBorder }),
    spacer({ size: 10 }),
    button({ w: 300, h: 76 }),
  ])
);
