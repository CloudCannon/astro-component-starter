/**
 * Button Helpers
 *
 * Creates button elements at runtime by cloning from `<template>` elements
 * that were server-rendered by the Astro Button component. This keeps the
 * client-side builder lightweight while still using the design-system buttons.
 *
 * If a template is missing (e.g. during testing), each helper gracefully
 * falls back to a plain `<button>` element.
 *
 * @module buttonHelpers
 */

let buttonGhostTemplate: HTMLTemplateElement | null = null;
let buttonDeleteTemplate: HTMLTemplateElement | null = null;
let buttonCloseTemplate: HTMLTemplateElement | null = null;

function initializeButtonTemplates(): void {
  if (!buttonGhostTemplate) {
    buttonGhostTemplate = document.getElementById("button-ghost-template") as HTMLTemplateElement;

    if (!buttonGhostTemplate) {
      console.error("[ButtonHelper] Ghost button template not found");
    }
  }

  if (!buttonDeleteTemplate) {
    buttonDeleteTemplate = document.getElementById("button-delete-template") as HTMLTemplateElement;

    if (!buttonDeleteTemplate) {
      console.error("[ButtonHelper] Delete button template not found");
    }
  }

  if (!buttonCloseTemplate) {
    buttonCloseTemplate = document.getElementById("button-close-template") as HTMLTemplateElement;

    if (!buttonCloseTemplate) {
      console.error("[ButtonHelper] Close button template not found");
    }
  }
}

export function createDeleteButton(onClick: () => void): HTMLElement {
  if (!buttonDeleteTemplate) {
    initializeButtonTemplates();
  }

  if (!buttonDeleteTemplate) {
    console.warn("[ButtonHelper] Using fallback delete button - template not available");
    const fallback = document.createElement("button");

    fallback.type = "button";
    fallback.textContent = "Delete";
    fallback.className = "sandbox-item-btn sandbox-item-btn-delete";
    fallback.addEventListener("click", onClick);
    return fallback;
  }

  const clone = buttonDeleteTemplate.content.cloneNode(true) as DocumentFragment;
  const button = clone.querySelector("button") as HTMLButtonElement;

  if (!button) {
    console.error("[ButtonHelper] Failed to clone delete button template");
    const fallback = document.createElement("button");

    fallback.type = "button";
    fallback.textContent = "Delete";
    return fallback;
  }

  button.addEventListener("click", onClick);

  return button;
}

export function createCloseButton(onClick: () => void): HTMLElement {
  if (!buttonCloseTemplate) {
    initializeButtonTemplates();
  }

  if (!buttonCloseTemplate) {
    console.warn("[ButtonHelper] Using fallback close button - template not available");
    const fallback = document.createElement("button");

    fallback.type = "button";
    fallback.textContent = "×";
    fallback.className = "component-picker-close";
    fallback.setAttribute("aria-label", "Close");
    fallback.addEventListener("click", onClick);
    return fallback;
  }

  const clone = buttonCloseTemplate.content.cloneNode(true) as DocumentFragment;
  const button = clone.querySelector("button") as HTMLButtonElement;

  if (!button) {
    console.error("[ButtonHelper] Failed to clone close button template");
    const fallback = document.createElement("button");

    fallback.type = "button";
    fallback.textContent = "×";
    fallback.setAttribute("aria-label", "Close");
    return fallback;
  }

  button.setAttribute("aria-label", "Close");
  button.addEventListener("click", onClick);

  return button;
}
