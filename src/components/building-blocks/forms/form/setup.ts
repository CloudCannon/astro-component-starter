/**
 * Shared setup logic for Form: inline validation messages, and the success
 * state a redirecting endpoint sends the visitor back to.
 *
 * Validation is a progressive enhancement. Without JS the browser's own
 * constraint validation still blocks an invalid submit and shows its bubble;
 * `noValidate` is set here, once, so the bubble is only replaced when there is
 * something to replace it with.
 *
 * Used by:
 * - `Form.astro`'s inline `<script>` on the live site
 * - `editor-live-sync.js` in the CloudCannon editor, where CC's
 *   editable-regions renderer strips inline scripts
 */

/** Roots that own a field's error slot, in the order they should be searched. */
const FIELD_ROOT = ".form-field, .choice-group, .segments, .toggle";

type Validatable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isValidatable(node: EventTarget | null): node is Validatable {
  return (
    (node instanceof HTMLInputElement ||
      node instanceof HTMLSelectElement ||
      node instanceof HTMLTextAreaElement) &&
    node.willValidate
  );
}

function describedBy(control: Validatable): string[] {
  return (control.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
}

function findError(control: Validatable): HTMLElement | null {
  const root = control.closest<HTMLElement>(FIELD_ROOT) ?? control.parentElement;

  return root?.querySelector<HTMLElement>(".form-field-error") ?? null;
}

function showError(control: Validatable, message: string): void {
  const root = control.closest<HTMLElement>(FIELD_ROOT) ?? control.parentElement;

  if (!root) return;

  let error = root.querySelector<HTMLElement>(".form-field-error");

  if (!error) {
    error = document.createElement("p");
    error.className = "form-field-error";
    error.id = `${control.id || control.name || "field"}-error`;
    root.append(error);
  }

  error.textContent = message;
  error.hidden = false;
  control.setAttribute("aria-invalid", "true");

  if (error.id && !describedBy(control).includes(error.id)) {
    control.setAttribute("aria-describedby", [...describedBy(control), error.id].join(" "));
  }
}

function clearError(control: Validatable): void {
  const error = findError(control);

  control.removeAttribute("aria-invalid");

  if (!error) return;

  error.textContent = "";
  error.hidden = true;

  if (error.id) {
    const remaining = describedBy(control).filter((id) => id !== error.id);

    if (remaining.length) control.setAttribute("aria-describedby", remaining.join(" "));
    else control.removeAttribute("aria-describedby");
  }
}

function validatableElements(form: HTMLFormElement): Validatable[] {
  return Array.from(form.elements).filter(isValidatable);
}

function revealSuccess(form: HTMLFormElement): void {
  const message = form.querySelector<HTMLElement>(".form-success");

  if (!message || !new URLSearchParams(window.location.search).has("success")) return;

  message.hidden = false;
  message.focus();
}

export function setupForm(form: HTMLFormElement): void {
  if (form.dataset.formInitialized === "true") return;
  form.dataset.formInitialized = "true";

  form.noValidate = true;

  form.addEventListener("submit", (event) => {
    const fields = validatableElements(form);

    fields.forEach(clearError);

    const invalid = fields.filter((field) => !field.checkValidity());

    if (!invalid.length) return;

    event.preventDefault();
    invalid.forEach((field) => showError(field, field.validationMessage));
    invalid[0].focus();
  });

  const recheck = (event: Event) => {
    if (isValidatable(event.target) && event.target.checkValidity()) clearError(event.target);
  };

  form.addEventListener("input", recheck);
  form.addEventListener("change", recheck);

  revealSuccess(form);
}

export function setupAllForms(root: ParentNode = document): void {
  root.querySelectorAll<HTMLFormElement>("form.form").forEach(setupForm);
}
