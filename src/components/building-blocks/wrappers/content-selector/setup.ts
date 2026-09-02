/**
 * Shared setup logic for the Content Selector.
 *
 * Panel switching is pure CSS (hidden radio + sibling selectors), so the
 * component works with no JS at all. This adds the two things CSS can't do:
 * keep `aria-expanded`/`aria-hidden` in step with the checked radio, and make
 * Enter and Space activate a tab — the visible tab is a `<label>`, which gets
 * `tabindex="0"` but no native key handling.
 *
 * Used by:
 * - `ContentSelector.astro`'s inline `<script>` on the live site
 * - `editor-live-sync.js` in the CloudCannon editor, where CC's
 *   editable-regions renderer strips inline scripts
 */

function updatePanelAriaState(input: HTMLInputElement, isSelected: boolean): void {
  const tab = input.nextElementSibling;
  const panel = tab?.nextElementSibling;

  if (!(tab instanceof HTMLElement) || !(panel instanceof HTMLElement)) return;

  tab.setAttribute("aria-expanded", isSelected.toString());
  panel.setAttribute("aria-hidden", (!isSelected).toString());
}

function syncContentSelectorAriaState(contentSelector: HTMLElement): void {
  const inputs = Array.from(
    contentSelector.querySelectorAll<HTMLInputElement>(".content-selector-input")
  );

  if (!inputs.length) return;

  let selectedInput = inputs.find((input) => input.checked);

  if (!selectedInput) {
    [selectedInput] = inputs;
    selectedInput.checked = true;
  }

  inputs.forEach((input) => {
    updatePanelAriaState(input, input === selectedInput);
  });
}

function handleInputChange(event: Event): void {
  const input = event.currentTarget;

  if (!(input instanceof HTMLInputElement)) return;

  const contentSelector = input.closest(".content-selector-items");

  if (!(contentSelector instanceof HTMLElement)) return;

  syncContentSelectorAriaState(contentSelector);
}

function handleTabKeydown(event: Event): void {
  if (!(event instanceof KeyboardEvent)) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();

  const tab = event.currentTarget;

  if (!(tab instanceof HTMLLabelElement)) return;

  const inputId = tab.getAttribute("for");
  const input = inputId ? document.getElementById(inputId) : null;

  if (!(input instanceof HTMLInputElement)) return;

  input.checked = true;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function setupContentSelector(contentSelector: HTMLElement): void {
  // The aria sync runs every time — a re-render can replace the panels while
  // the listeners below are still bound to the surviving root.
  syncContentSelectorAriaState(contentSelector);

  if (contentSelector.dataset.contentSelectorInitialized === "true") return;

  contentSelector.querySelectorAll(".content-selector-input").forEach((input) => {
    input.addEventListener("change", handleInputChange);
  });

  contentSelector.querySelectorAll(".content-selector-tab").forEach((tab) => {
    tab.addEventListener("keydown", handleTabKeydown);
  });

  contentSelector.dataset.contentSelectorInitialized = "true";
}

export function setupAllContentSelectors(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(".content-selector-items").forEach((contentSelector) => {
    setupContentSelector(contentSelector);
  });
}
