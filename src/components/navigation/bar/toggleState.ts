/**
 * Mirror every nav toggle's `checked` state onto `aria-expanded`. Called after
 * any change rather than per input: checking one radio never fires `change` on
 * the radio it unchecked.
 */
export function syncExpanded(root: ParentNode): void {
  root.querySelectorAll<HTMLInputElement>(".nav-item-toggle").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", String(toggle.checked));
  });
}

/**
 * Make Enter and Space work on every nav toggle.
 *
 * The focusable control is the hidden `<input role="button">`, but the visible
 * trigger is a `<label>`, which takes no focus — so a handler bound to the
 * label never sees a key. A checkbox also ignores Enter natively, and a checked
 * radio (a level-2 panel) has no native way back to unchecked, leaving that
 * panel mouse-only. Binding here covers Bar, Side and Mobile in one place.
 */
export function bindToggleKeys(root: ParentNode): void {
  root.querySelectorAll<HTMLInputElement>(".nav-item-toggle").forEach((toggle) => {
    if (toggle.dataset.toggleKeysBound === "true") return;
    toggle.dataset.toggleKeysBound = "true";

    toggle.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      toggle.checked = !toggle.checked;
      toggle.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}
