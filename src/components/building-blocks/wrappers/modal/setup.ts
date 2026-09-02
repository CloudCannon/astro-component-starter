/**
 * Shared setup logic for modal popovers (`.modal-popover`, rendered by
 * `ModalShell.astro`).
 *
 * Used by:
 * - `Modal.astro`'s inline `<script>` on the live site
 * - `navigation/search`'s setup module (its popover is a ModalShell)
 * - `editor-live-sync.js` in the CloudCannon editor, because CC's
 *   editable-regions renderer uses `renderToStaticMarkup` and does
 *   not execute inline scripts, so we need to initialize modals
 *   from the live-sync script in that context.
 */
import { getFocusableElements, trapFocus } from "@component-utils/focusTrap";

function updateModalScrollLock(): void {
  const openPopovers = Array.from(document.querySelectorAll<HTMLElement>(".modal-popover")).filter(
    (popover) => popover.matches(":popover-open")
  );
  const hasOpenModal = openPopovers.length > 0;

  document.body.toggleAttribute("data-modal-scroll-lock", hasOpenModal);
}

/** The popover's opener: a `popovertarget` button outside the popover itself
 * (the close button inside also targets it, so filter that out). */
function findTrigger(popover: HTMLElement): HTMLElement | null {
  if (!popover.id) return null;

  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(`[popovertarget="${CSS.escape(popover.id)}"]`)
    ).find((el) => !popover.contains(el)) ?? null
  );
}

export function setupModalShell(popover: HTMLElement): void {
  if (popover.hasAttribute("data-modal-initialized")) return;
  popover.setAttribute("data-modal-initialized", "");

  let opener: HTMLElement | null = null;

  popover.addEventListener("toggle", (e) => {
    const { newState } = e as ToggleEvent;
    const trigger = findTrigger(popover);

    trigger?.setAttribute("aria-expanded", String(newState === "open"));
    updateModalScrollLock();

    if (newState === "open") {
      // Captured before focus moves inside: several controls can target one
      // modal, and focus has to return to the one that was actually used —
      // `findTrigger` only ever reports the first. Anything else that had
      // focus is not an invoker (Search opens on Ctrl+K with focus on the
      // body), so fall back to the declared trigger.
      const active = document.activeElement;
      const invoker =
        active instanceof HTMLElement && popover.id && !popover.contains(active)
          ? active.closest<HTMLElement>(`[popovertarget="${CSS.escape(popover.id)}"]`)
          : null;

      opener = invoker ?? trigger;

      // The popover API leaves focus on the invoker when a popover opens,
      // so move it to the first focusable element inside the modal.
      getFocusableElements(popover)[0]?.focus();
    }

    if (newState === "closed") {
      (opener ?? trigger)?.focus();
      opener = null;
    }
  });

  trapFocus(popover, () => popover.matches(":popover-open"));
}

export function setupAllModals(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".modal-popover").forEach((el) => setupModalShell(el));
  updateModalScrollLock();
}
