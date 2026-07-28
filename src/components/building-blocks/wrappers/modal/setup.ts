/**
 * Shared setup logic for the Modal component.
 *
 * Used by:
 * - `Modal.astro`'s inline `<script>` on the live site
 * - `editor-live-sync.js` in the CloudCannon editor, because CC's
 *   editable-regions renderer uses `renderToStaticMarkup` and does
 *   not execute inline scripts, so we need to initialize modals
 *   from the live-sync script in that context.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0
  );
}

function updateModalScrollLock(): void {
  const openPopovers = Array.from(document.querySelectorAll<HTMLElement>(".modal-popover")).filter(
    (popover) => popover.matches(":popover-open")
  );
  const hasOpenModal = openPopovers.length > 0;

  document.body.toggleAttribute("data-modal-scroll-lock", hasOpenModal);
}

export function setupModal(modal: HTMLElement): void {
  if (modal.hasAttribute("data-modal-initialized")) return;
  modal.setAttribute("data-modal-initialized", "");

  const trigger = modal.querySelector<HTMLButtonElement>(".modal-trigger .button-inner");
  const popover = modal.querySelector<HTMLElement>(".modal-popover");

  if (!popover) return;

  popover.addEventListener("toggle", (e) => {
    const { newState } = e as ToggleEvent;

    trigger?.setAttribute("aria-expanded", String(newState === "open"));
    updateModalScrollLock();

    if (newState === "open") {
      // The popover API leaves focus on the invoker when a popover opens,
      // so move it to the first focusable element inside the modal.
      getFocusableElements(popover)[0]?.focus();
    }

    if (newState === "closed" && trigger) {
      trigger.focus();
    }
  });

  // Trap focus while the modal is open: Tab from the last focusable element
  // wraps to the first, and Shift+Tab from the first wraps to the last.
  popover.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !popover.matches(":popover-open")) return;

    const focusable = getFocusableElements(popover);

    if (!focusable.length) {
      e.preventDefault();

      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    const activeInPopover = active instanceof Node && popover.contains(active);

    if (e.shiftKey) {
      if (active === first || !activeInPopover) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !activeInPopover) {
      e.preventDefault();
      first.focus();
    }
  });
}

export function setupAllModals(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".modal").forEach((el) => setupModal(el));
  updateModalScrollLock();
}
