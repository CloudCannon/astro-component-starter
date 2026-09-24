/** Mirrored in `scripts/tests/smoke.mjs`; keep the two in sync. */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "summary",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/** Rendered ones only: a hidden element can't take focus. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getClientRects().length > 0
  );
}

/** Binds once for the container's lifetime, so it's safe to call before the overlay opens. */
export function trapFocus(container: HTMLElement, isOpen: () => boolean): void {
  container.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !isOpen()) return;

    const focusable = getFocusableElements(container);

    if (!focusable.length) {
      event.preventDefault();

      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const activeInside = active instanceof Node && container.contains(active);

    if (event.shiftKey) {
      if (active === first || !activeInside) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !activeInside) {
      event.preventDefault();
      first.focus();
    }
  });
}
