/**
 * `data-modal` is behaviour only; the sheet look is `.modal-popover`, and nothing
 * here may key on that class. Also run by `editor-live-sync.js`, where inline scripts don't execute.
 */
import { getFocusableElements, trapFocus } from "@component-utils/focusTrap";

export const MODAL_SELECTOR = "[data-modal]";

function updateModalScrollLock(): void {
  const openPopovers = Array.from(document.querySelectorAll<HTMLElement>(MODAL_SELECTOR)).filter(
    (popover) => popover.matches(":popover-open")
  );
  const hasOpenModal = openPopovers.length > 0;

  document.body.toggleAttribute("data-modal-scroll-lock", hasOpenModal);
}

/** Excludes the close button inside, which also targets the popover. */
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
      // Several controls can target one modal and `findTrigger` reports only the
      // first, so capture the real invoker before focus moves inside.
      const active = document.activeElement;
      const invoker =
        active instanceof HTMLElement && popover.id && !popover.contains(active)
          ? active.closest<HTMLElement>(`[popovertarget="${CSS.escape(popover.id)}"]`)
          : null;

      opener = invoker ?? trigger;

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
  root.querySelectorAll<HTMLElement>(MODAL_SELECTOR).forEach((el) => setupModalShell(el));
  updateModalScrollLock();
}
