/**
 * Checkboxes only: ARIA doesn't allow `aria-expanded` on `radio`. Call after any change,
 * since checking one radio fires no `change` on the radio it unchecked.
 */
export function syncExpanded(root: ParentNode): void {
  root.querySelectorAll<HTMLInputElement>(".nav-item-toggle[type='checkbox']").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", String(toggle.checked));
  });
}

/**
 * Binds to the hidden input, not the `<label>`, which takes no focus. A checked radio
 * has no native way back to unchecked, so without this its panel is mouse-only.
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
