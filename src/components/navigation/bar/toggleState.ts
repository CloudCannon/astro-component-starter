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
