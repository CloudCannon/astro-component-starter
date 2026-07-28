import { frame, stack, row, icon, text } from "../../../../../scripts/previews/kit.mjs";

// A vertical list: each item is an icon marker followed by its text.
const item = () => row({ gap: 18, align: "center" }, [icon({ d: 30 }), text({ lines: 1, w: 460 })]);

export default frame(stack({ gap: 24, align: "start" }, [item(), item(), item()]));
