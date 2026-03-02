/**
 * Slider Helper Utilities
 *
 * Creates toggle-switch (slider) elements at runtime by cloning from a
 * `<template>` that was server-rendered in the Astro component. Falls back
 * to a plain checkbox when the template is unavailable.
 *
 * @module sliderHelpers
 */

let sliderTemplate: HTMLTemplateElement | null = null;

/**
 * Initialize the slider template (call this once on page load)
 */
function initializeSliderTemplate(): void {
  if (!sliderTemplate) {
    sliderTemplate = document.getElementById("slider-template") as HTMLTemplateElement;

    if (!sliderTemplate) {
      console.error("[SliderHelper] Slider template not found");
    }
  }
}

/**
 * Creates a slider toggle element by cloning from the template
 * @param checked - Whether the slider is initially checked
 * @param onChange - Callback when the slider value changes
 * @returns HTMLElement containing the slider
 */
export function createSlider(checked: boolean, onChange: (checked: boolean) => void): HTMLElement {
  // Ensure template is initialized
  if (!sliderTemplate) {
    initializeSliderTemplate();
  }

  if (!sliderTemplate) {
    // Fallback: create a basic checkbox if template is missing
    console.warn("[SliderHelper] Using fallback checkbox - template not available");

    const fallback = document.createElement("input");

    fallback.type = "checkbox";
    fallback.checked = checked;
    fallback.addEventListener("change", () => onChange(fallback.checked));

    return fallback;
  }

  // Clone the template content
  const clone = sliderTemplate.content.cloneNode(true) as DocumentFragment;
  const container = clone.firstElementChild as HTMLElement;

  if (!container) {
    console.error("[SliderHelper] Failed to clone slider template");

    const fallback = document.createElement("div");

    return fallback;
  }

  // Override styles for inline usage in ComponentBuilder
  container.style.width = "auto";
  container.style.margin = "0";

  const labelElement = container.querySelector(".slider-container") as HTMLElement;

  if (labelElement) {
    labelElement.style.width = "auto";
  }

  // Find and configure the input
  const input = container.querySelector(".slider-input") as HTMLInputElement;

  if (input) {
    // Generate a unique ID for the cloned slider
    const uniqueId = `slider-${Math.random().toString(36).substr(2, 9)}`;

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
  const labelText = container.querySelector(".slider-label");

  if (labelText) {
    labelText.remove();
  }

  return container;
}
