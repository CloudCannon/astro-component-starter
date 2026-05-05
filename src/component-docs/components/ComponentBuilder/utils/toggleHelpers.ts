/**
 * Toggle Helper Utilities
 *
 * Creates toggle-switch elements at runtime by cloning from a
 * `<template>` that was server-rendered in the Astro component. Falls back
 * to a plain checkbox when the template is unavailable.
 *
 * @module toggleHelpers
 */

let toggleTemplate: HTMLTemplateElement | null = null;

/**
 * Initialize the toggle template (call this once on page load)
 */
function initializeToggleTemplate(): void {
  if (!toggleTemplate) {
    toggleTemplate = document.getElementById("toggle-template") as HTMLTemplateElement;

    if (!toggleTemplate) {
      console.error("[ToggleHelper] Toggle template not found");
    }
  }
}

/**
 * Creates a toggle element by cloning from the template
 * @param checked - Whether the toggle is initially checked
 * @param onChange - Callback when the toggle value changes
 * @returns HTMLElement containing the toggle
 */
export function createToggle(checked: boolean, onChange: (checked: boolean) => void): HTMLElement {
  // Ensure template is initialized
  if (!toggleTemplate) {
    initializeToggleTemplate();
  }

  if (!toggleTemplate) {
    // Fallback: create a basic checkbox if template is missing
    console.warn("[ToggleHelper] Using fallback checkbox - template not available");

    const fallback = document.createElement("input");

    fallback.type = "checkbox";
    fallback.checked = checked;
    fallback.addEventListener("change", () => onChange(fallback.checked));

    return fallback;
  }

  // Clone the template content
  const clone = toggleTemplate.content.cloneNode(true) as DocumentFragment;
  const container = clone.firstElementChild as HTMLElement;

  if (!container) {
    console.error("[ToggleHelper] Failed to clone toggle template");

    const fallback = document.createElement("div");

    return fallback;
  }

  // Override styles for inline usage in ComponentBuilder
  container.style.width = "auto";
  container.style.margin = "0";

  const labelElement = container.querySelector(".toggle-container") as HTMLElement;

  if (labelElement) {
    labelElement.style.width = "auto";
  }

  // Find and configure the input
  const input = container.querySelector(".toggle-input") as HTMLInputElement;

  if (input) {
    // Generate a unique ID for the cloned toggle
    const uniqueId = `toggle-${Math.random().toString(36).substr(2, 9)}`;

    input.id = uniqueId;
    input.name = uniqueId;

    // Update the label's for attribute to match
    if (labelElement) {
      labelElement.setAttribute("for", uniqueId);
    }

    input.checked = checked;
    input.addEventListener("change", () => onChange(input.checked));
  }

  // Remove label span for compact inline usage.
  const labelText = container.querySelector(".toggle-label");

  if (labelText) {
    labelText.remove();
  }

  return container;
}
