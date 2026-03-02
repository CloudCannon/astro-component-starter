/**
 * Drag and Drop Module
 *
 * Handles all drag-and-drop interactions in the component builder including
 * palette → sandbox drops and intra-sandbox reordering. Provides helpers for
 * validating drop targets against slot restrictions.
 *
 * @module dragDrop
 */

import { debugLog } from "../constants";
import { builderState } from "../state";
import type { ComponentInfo, DragSource, SlotDefinition } from "../types";

/** Handle drag start from palette or sandbox item */
export function handleDragStart(e: DragEvent): void {
  const target = e.target as HTMLElement;

  // Check if dragging from palette
  const paletteComponent = target.closest(".palette-component");

  if (paletteComponent) {
    const componentPath = paletteComponent.getAttribute("data-component-path");
    const componentName = paletteComponent.getAttribute("data-component-name");

    const dragSource: DragSource = {
      type: "palette",
      componentPath: componentPath || undefined,
      componentName: componentName || undefined,
    };

    builderState.dragSource = dragSource;
    e.dataTransfer?.setData("application/json", JSON.stringify(dragSource));
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "copy";
    }
    paletteComponent.classList.add("dragging");
    debugLog("Palette drag started:", dragSource);
    return;
  }

  // Check if dragging from sandbox (reorder)
  const sandboxItem = target.closest(".sandbox-item");
  const isButton = target.closest(".sandbox-item-btn");
  const isInput = target.closest("input, select, textarea, [contenteditable]");

  if (sandboxItem && !isButton && !isInput) {
    // Prevent dragging root components
    if (sandboxItem.classList.contains("root-component")) {
      e.preventDefault();
      return;
    }

    const nodeId = (sandboxItem as HTMLElement).dataset.componentId;
    const parentSlot = sandboxItem.closest(".slot-content");
    const parentItem = sandboxItem.parentElement?.closest(".sandbox-item");

    const dragSource: DragSource = {
      type: "reorder",
      nodeId: nodeId || undefined,
      fromParentId: (parentItem as HTMLElement)?.dataset.componentId || null,
      fromSlot: (parentSlot as HTMLElement)?.dataset.slotName || null,
    };

    builderState.dragSource = dragSource;
    e.dataTransfer?.setData("application/json", JSON.stringify(dragSource));
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setDragImage(sandboxItem, 20, 20);
    }
    sandboxItem.classList.add("dragging");
    debugLog("Reorder drag started:", dragSource);
  }
}

/** Handle drag end — clean up all visual drag states (classes, indicators). */
export function handleDragEnd(e: DragEvent): void {
  const target = e.target as HTMLElement;

  const paletteComponent = target.closest(".palette-component");

  if (paletteComponent) {
    paletteComponent.classList.remove("dragging");
  }

  const sandboxItem = target.closest(".sandbox-item");

  if (sandboxItem) {
    sandboxItem.classList.remove("dragging");
  }

  // Clear all drag states
  document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
  document.querySelectorAll(".drop-zone.active").forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".drop-not-allowed")
    .forEach((el) => el.classList.remove("drop-not-allowed"));

  builderState.dragSource = null;
}

/** Validate if a component can be dropped in a slot */
export function canDropInSlot(componentInfo: ComponentInfo, slot: SlotDefinition | null): boolean {
  if (!slot?.allowedComponents || slot.allowedComponents.length === 0) {
    return true; // No restrictions
  }

  return slot.allowedComponents.some(
    (allowed) => componentInfo.path === allowed || componentInfo.path.includes(allowed)
  );
}

/** Handle reorder drop */
export function handleReorderDrop(
  nodeId: string,
  targetParentId: string | null,
  targetSlot: string | null,
  targetIndex: number
): void {
  debugLog("Reorder drop:", { nodeId, targetParentId, targetSlot, targetIndex });
  builderState.moveComponent(nodeId, targetParentId, targetSlot, targetIndex);
}

/** Parse drag data from event */
export function parseDragData(e: DragEvent): DragSource | null {
  try {
    const data = e.dataTransfer?.getData("application/json");

    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
