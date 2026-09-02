/**
 * Focus containment for overlay UI — the modal popover and the mobile nav
 * panel. Both cover the page, so Tab must not walk out into content the user
 * cannot see.
 *
 * `FOCUSABLE_SELECTOR` is mirrored in `scripts/tests/smoke.mjs`; the two must
 * stay in sync or the trap test asserts against a different element set.
 */
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

/** Focusable descendants that actually render — a hidden one can't take focus. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getClientRects().length > 0
  );
}

/**
 * Wrap Tab and Shift+Tab inside `container` for as long as `isOpen()` is true.
 * Binds one listener for the container's lifetime, so it is safe to call during
 * setup before the overlay opens.
 */
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
