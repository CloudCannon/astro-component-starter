/**
 * Component Picker Module
 *
 * Renders a modal overlay that lets the user browse available components
 * (grouped by category) and select one to insert into a slot.
 *
 * @module componentPicker
 */

import { CATEGORY_ORDER, ROOT_COMPONENT_PATH } from "../constants";
import { builderState } from "../state";
import type { ComponentInfo, SlotDefinition } from "../types";
import { createCloseButton } from "../utils/buttonHelpers";

function matchesAllowedComponent(componentPath: string, allowed: string): boolean {
  if (allowed.endsWith("/*")) {
    return componentPath.startsWith(allowed.slice(0, -1));
  }

  return componentPath === allowed;
}

function getExplicitlyAllowedVirtualPaths(slot: SlotDefinition | null): Set<string> {
  if (!slot?.allowedComponents?.length) return new Set();

  return new Set(
    slot.allowedComponents.filter((allowedPath) =>
      builderState.components.some((c) => c.path === allowedPath && c.isVirtual)
    )
  );
}

/**
 * Open the component picker modal.
 *
 * @param insertIndex - Insertion position within the target slot array.
 * @param parentId    - ID of the parent node (or `null` for root).
 * @param slotName    - Slot prop name on the parent (or `null` for root).
 * @param slot        - The slot definition (used to filter allowed components).
 * @param onSelect    - Callback fired after the user selects a component.
 */
export function openComponentPicker(
  insertIndex: number,
  parentId: string | null,
  slotName: string | null,
  slot: SlotDefinition | null,
  onSelect: () => void
): void {
  // Clear selection
  builderState.selectedComponentId = null;

  // Create modal overlay
  const overlay = document.createElement("div");

  overlay.className = "component-picker-overlay";

  const picker = document.createElement("div");

  picker.className = "component-picker";

  // Header with search
  const header = createPickerHeader(() => overlay.remove());

  picker.appendChild(header);

  // Content area
  const content = document.createElement("div");

  content.className = "component-picker-content";

  // Virtual sub-components should only be selectable when explicitly allowed
  // by the current slot (e.g. Accordion items slot allows AccordionItem).
  const explicitlyAllowedVirtualPaths = getExplicitlyAllowedVirtualPaths(slot);

  // Filter components:
  // - always exclude root component
  // - exclude virtual sub-components by default
  // - include virtual sub-components only when explicitly allowed in this slot
  let availableComponents = builderState.components.filter(
    (c) =>
      c.path !== ROOT_COMPONENT_PATH && (!c.isVirtual || explicitlyAllowedVirtualPaths.has(c.path))
  );

  if (slot?.allowedComponents && slot.allowedComponents.length > 0) {
    availableComponents = availableComponents.filter((c) =>
      slot.allowedComponents.some((allowed) => matchesAllowedComponent(c.path, allowed))
    );
  }

  // Search input
  const searchInput = header.querySelector(".component-picker-search") as HTMLInputElement;

  function renderList(searchTerm = ""): void {
    content.innerHTML = "";

    const filtered = searchTerm
      ? availableComponents.filter(
          (c) =>
            c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableComponents;

    // Group by category
    const byCategory: Record<string, ComponentInfo[]> = {};

    filtered.forEach((c) => {
      if (!byCategory[c.category]) byCategory[c.category] = [];
      byCategory[c.category].push(c);
    });

    // Render categories
    const categoryOrder = ["page-builders", ...CATEGORY_ORDER];
    const sortedCategories = categoryOrder
      .filter((cat) => byCategory[cat])
      .map((cat) => [cat, byCategory[cat]] as const);

    sortedCategories.forEach(([category, comps]) => {
      const filteredComps = comps.filter((c) => c.path !== ROOT_COMPONENT_PATH);

      if (filteredComps.length === 0) return;

      const section = createCategorySection(category, filteredComps, (comp) => {
        // Use state manager to add component (this will emit treeChange)
        if (parentId && slotName) {
          const componentNode = builderState.addComponentToSlot(
            comp,
            parentId,
            slotName,
            insertIndex
          );

          // Select the newly added component
          builderState.selectedComponentId = componentNode._nodeId;
        }

        onSelect();
        overlay.remove();
      });

      content.appendChild(section);
    });
  }

  renderList();

  searchInput.addEventListener("input", (e) => {
    renderList((e.target as HTMLInputElement).value);
  });

  picker.appendChild(content);
  overlay.appendChild(picker);

  // Close handlers
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", handleEscape);
    }
  };

  document.addEventListener("keydown", handleEscape);

  document.body.appendChild(overlay);
  searchInput.focus();
}

/** Create the picker header with search */
function createPickerHeader(onClose: () => void): HTMLElement {
  const header = document.createElement("div");

  header.className = "component-picker-header";

  const headerTop = document.createElement("div");

  headerTop.className = "component-picker-header-top";

  const title = document.createElement("h3");

  title.className = "component-picker-title";
  title.textContent = "Add Component";

  const closeBtn = createCloseButton(onClose);

  headerTop.appendChild(title);
  headerTop.appendChild(closeBtn);

  const searchInput = document.createElement("input");

  searchInput.type = "text";
  searchInput.className = "component-picker-search";
  searchInput.placeholder = "Search components...";

  header.appendChild(headerTop);
  header.appendChild(searchInput);

  return header;
}

/** Create a category section in the picker */
function createCategorySection(
  category: string,
  components: ComponentInfo[],
  onSelect: (comp: ComponentInfo) => void
): HTMLElement {
  const section = document.createElement("div");

  section.className = "component-picker-category";
  section.dataset.category = category;

  const header = document.createElement("div");

  header.className = "component-picker-category-header";

  const title = document.createElement("h3");
  const categoryLabels: Record<string, string> = {
    "page-builders": "PAGE BUILDERS",
    builders: "BUILDERS",
    wrappers: "WRAPPERS",
    "core-elements": "CORE ELEMENTS",
    forms: "FORMS",
  };

  title.textContent = categoryLabels[category] || category.toUpperCase();

  header.appendChild(title);
  section.appendChild(header);

  // Component items
  components.forEach((comp) => {
    const item = createComponentItem(comp, () => onSelect(comp));

    section.appendChild(item);
  });

  return section;
}

/** Create a component item in the picker */
function createComponentItem(comp: ComponentInfo, onClick: () => void): HTMLElement {
  const item = document.createElement("button");

  item.type = "button";
  item.className = "component-picker-item";
  item.dataset.category = comp.category;

  const info = document.createElement("div");

  info.className = "component-picker-item-info";

  const name = document.createElement("div");

  name.className = "component-picker-item-name";
  name.textContent = comp.displayName;

  const desc = document.createElement("div");

  desc.className = "component-picker-item-desc";
  desc.textContent = comp.description || "";

  info.appendChild(name);
  if (comp.description) info.appendChild(desc);
  item.appendChild(info);
  item.addEventListener("click", onClick);

  return item;
}
