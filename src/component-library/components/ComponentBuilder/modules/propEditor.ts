/**
 * Property Editor Module
 *
 * Renders the right-hand sidebar where users can view and edit the
 * properties of the currently selected component node. Supports text,
 * number, boolean, select, URL, image, and JSON-object input types.
 *
 * Each prop can be toggled between "hardcoded" (value baked into the
 * exported component) and "exposed" (surfaced as a configurable prop).
 *
 * @module propEditor
 */

import { builderState } from "../state";
import type { ComponentInfo, ComponentNode, InputConfig } from "../types";
import { createSlider } from "../utils/sliderHelpers";
import { slotHasSameComponentInEveryItem } from "../utils/shared";
import { DEFAULT_EXPOSED_PROPS } from "../constants";

/** Render the property editor for a selected component */
export function renderPropEditor(
  node: ComponentNode,
  componentInfo: ComponentInfo,
  container: HTMLElement
): void {
  container.innerHTML = "";

  if (!componentInfo.inputs || Object.keys(componentInfo.inputs).length === 0) {
    container.innerHTML = '<p class="sidebar-empty">No editable properties</p>';
    return;
  }

  // Get slot property names to exclude
  const slotPropNames = new Set<string>();

  if (componentInfo.slots) {
    componentInfo.slots.forEach((slot) => slotPropNames.add(slot.propName));
  }

  // Force expose slot props when the component has a childComponent pattern (e.g. Accordion)
  // and every item has the same component. General content slots are not affected.
  const metadata = builderState.getMetadata(node._component);
  const hasChildComponentPattern = !!metadata?.childComponent;

  // Determine if this node is a child component (e.g. accordion-item) whose parent
  // has childComponent.props that force-expose certain props (e.g. title).
  const forcedChildComponentProps = new Set<string>();
  const nodeLocation = builderState.findNodeLocation(node.id);

  if (nodeLocation?.parentId) {
    const parentNode = builderState.findComponentNode(nodeLocation.parentId);

    if (parentNode) {
      const parentMetadata = builderState.getMetadata(parentNode._component);

      if (parentMetadata?.childComponent?.props) {
        for (const prop of parentMetadata.childComponent.props) {
          if (!prop.endsWith("/slot")) {
            forcedChildComponentProps.add(prop);
          }
        }
      }
    }
  }

  if (hasChildComponentPattern) {
    slotPropNames.forEach((slotPropName) => {
      if (slotHasSameComponentInEveryItem(node, slotPropName)) {
        node[`_hardcoded_${slotPropName}`] = false;
      }
    });
  }

  // Find parent objects that have dotted child properties
  const parentObjectsWithDottedChildren = new Set<string>();

  Object.keys(componentInfo.inputs).forEach((propName) => {
    if (propName.includes(".")) {
      parentObjectsWithDottedChildren.add(propName.split(".")[0]);
    }
  });

  // Determine which slot props should be forced into the editable list
  // (either in prop mode OR has childComponent pattern with uniform children)
  const forcedSlotProps = new Set<string>();

  slotPropNames.forEach((slotPropName) => {
    const isInPropMode = (node[`_${slotPropName}_mode`] as string) === "prop";
    const isUniform =
      hasChildComponentPattern && slotHasSameComponentInEveryItem(node, slotPropName);

    if (isInPropMode || isUniform) {
      forcedSlotProps.add(slotPropName);
    }
  });

  // Filter editable props from inputs
  let editableProps = Object.entries(componentInfo.inputs).filter(([propName]) => {
    // Exclude parent objects that have dotted children
    if (parentObjectsWithDottedChildren.has(propName)) {
      return false;
    }

    // Slot props: only show if forced (prop mode or uniform children)
    if (slotPropNames.has(propName)) {
      return forcedSlotProps.has(propName);
    }

    return true;
  });

  // Ensure forced slot props always appear (even if missing from inputs)
  if (componentInfo.slots) {
    for (const slot of componentInfo.slots) {
      const propName = slot.propName;

      if (!forcedSlotProps.has(propName)) continue;
      if (editableProps.some(([p]) => p === propName)) continue;
      const inputConfig: InputConfig = componentInfo.inputs?.[propName] ?? {
        type: "array",
        comment: slot.label || slot.propName,
      };

      editableProps = editableProps.concat([[propName, inputConfig]]);
    }
  }

  if (editableProps.length === 0) {
    container.innerHTML +=
      '<p class="sidebar-empty">All properties are managed through visual slots</p>';
    return;
  }

  // Render each property field
  editableProps.forEach(([propName, inputConfig]) => {
    // Force-exposed: slot props (prop mode or uniform children) or child component props (e.g. title)
    const isForcedProp = forcedSlotProps.has(propName) || forcedChildComponentProps.has(propName);
    const field = createPropField(propName, inputConfig, node, componentInfo, isForcedProp);

    container.appendChild(field);
  });
}

/** Create a property field with controls */
function createPropField(
  propName: string,
  inputConfig: InputConfig,
  node: ComponentNode,
  componentInfo: ComponentInfo,
  isForcedProp: boolean
): HTMLElement {
  // Forced props (slot or child-wrapper) must always be exposed.
  if (isForcedProp) {
    node[`_hardcoded_${propName}`] = false;
  }

  // Set default: check if this prop should be exposed by default
  if (node[`_hardcoded_${propName}`] === undefined) {
    // Extract component name from path (e.g., "building-blocks/core-elements/button" -> "button")
    const componentName = componentInfo.name;
    const exposedProps = DEFAULT_EXPOSED_PROPS[componentName] || [];

    // Default to exposed (false) if in the auto-expose list, otherwise hardcoded (true)
    node[`_hardcoded_${propName}`] = !exposedProps.includes(propName);
  }

  const isHardcoded = node[`_hardcoded_${propName}`] as boolean;
  const displayName = (node[`_renamed_${propName}`] as string) || propName;

  const field = document.createElement("div");

  field.className = "prop-field";
  field.dataset.originalProp = propName;

  // Header
  const header = createFieldHeader(propName);

  field.appendChild(header);

  // Comment
  if (inputConfig.comment) {
    const comment = document.createElement("p");

    comment.className = "prop-comment";
    comment.textContent = inputConfig.comment;
    field.appendChild(comment);
  }

  // Toggle (Expose) — not shown for forced props; they are always exposed.
  if (!isForcedProp) {
    const toggle = createFieldToggle(isHardcoded, (exposed) => {
      // Delay state update to allow slider animation to complete (350ms)
      setTimeout(() => {
        builderState.updateNodeProperty(node.id, `_hardcoded_${propName}`, !exposed);
      }, 350);
    });

    field.appendChild(toggle);
  }

  // Content
  const content = document.createElement("div");

  content.className = "prop-field-content";

  // Forced props are always treated as exposed for display.
  const showAsExposed = isForcedProp || !isHardcoded;

  if (!showAsExposed) {
    const section = createHardcodedSection(propName, inputConfig, node);

    content.appendChild(section);
  } else {
    const nameSection = createExposedNameSection(propName, displayName, node);

    content.appendChild(nameSection);

    // Skip preview value for object/array values (e.g. slot arrays)
    const currentValue = node[propName];
    const isObjectValue =
      currentValue !== null && currentValue !== undefined && typeof currentValue === "object";

    if (!isObjectValue) {
      const valueSection = createPreviewValueSection(propName, inputConfig, node);

      content.appendChild(valueSection);
    }
  }

  field.appendChild(content);

  return field;
}

/** Create field header */
function createFieldHeader(propName: string): HTMLElement {
  const header = document.createElement("div");

  header.className = "prop-field-header";

  const name = document.createElement("span");

  name.className = "prop-field-name";
  name.textContent = propName;
  name.title = propName;

  header.appendChild(name);

  return header;
}

/** Create field toggle (Expose) */
function createFieldToggle(
  isHardcoded: boolean,
  onToggle: (exposed: boolean) => void
): HTMLElement {
  const toggleWrapper = document.createElement("div");

  toggleWrapper.className = "prop-field-toggle-wrapper";

  const toggleLabel = document.createElement("span");

  toggleLabel.className = "prop-field-toggle-label";
  toggleLabel.textContent = "Expose";

  const toggle = createSlider(!isHardcoded, (checked) => onToggle(checked));

  toggleWrapper.appendChild(toggleLabel);
  toggleWrapper.appendChild(toggle);

  return toggleWrapper;
}

/** Create hardcoded value section */
function createHardcodedSection(
  propName: string,
  inputConfig: InputConfig,
  node: ComponentNode
): HTMLElement {
  const section = document.createElement("div");

  section.className = "prop-field-section";

  const label = document.createElement("label");

  label.className = "prop-field-section-label";
  label.textContent = "Hardcoded Value";

  const input = createInputForType(propName, inputConfig, node);

  section.appendChild(label);
  section.appendChild(input);

  return section;
}

/** Create exposed name input section */
function createExposedNameSection(
  propName: string,
  displayName: string,
  node: ComponentNode
): HTMLElement {
  const section = document.createElement("div");

  section.className = "prop-field-section";

  const label = document.createElement("label");

  label.className = "prop-field-section-label";
  label.textContent = "Exposed Name";

  const input = document.createElement("input");

  input.type = "text";
  input.className = "prop-field-input";
  input.value = displayName;
  input.placeholder = propName;

  // Use updateNodeMetaProperty so typing doesn't trigger a full re-render
  // (which would destroy this input and lose focus). Only validation is re-run.
  input.addEventListener("input", (e) => {
    const newName = (e.target as HTMLInputElement).value.trim();

    if (newName && newName !== propName) {
      builderState.updateNodeMetaProperty(node.id, `_renamed_${propName}`, newName);
    } else {
      builderState.updateNodeMetaProperty(node.id, `_renamed_${propName}`, undefined);
    }
  });

  section.appendChild(label);
  section.appendChild(input);

  return section;
}

/** Create preview value section */
function createPreviewValueSection(
  propName: string,
  inputConfig: InputConfig,
  node: ComponentNode
): HTMLElement {
  const section = document.createElement("div");

  section.className = "prop-field-section";

  const label = document.createElement("label");

  label.className = "prop-field-section-label";
  label.textContent = "Preview Value";

  const input = createInputForType(propName, inputConfig, node);

  section.appendChild(label);
  section.appendChild(input);

  return section;
}

/** Create appropriate input based on type */
function createInputForType(
  propName: string,
  inputConfig: InputConfig,
  node: ComponentNode
): HTMLElement {
  const type = inputConfig.type || "text";
  let currentValue = node[propName];

  // Set defaults
  if (currentValue === undefined || currentValue === null) {
    if (inputConfig.default !== undefined) {
      currentValue = inputConfig.default;
    } else {
      switch (type) {
        case "number":
          currentValue = 0;
          break;
        case "switch":
        case "boolean":
          currentValue = false;
          break;
        case "object":
          currentValue = {};
          break;
        default:
          currentValue = "";
      }
    }
  }

  // Handle object type
  if (typeof currentValue === "object" && currentValue !== null && !Array.isArray(currentValue)) {
    return createObjectInput(propName, currentValue as Record<string, unknown>, node);
  }

  switch (type) {
    case "switch":
    case "boolean":
      return createBooleanInput(propName, currentValue as boolean, node);
    case "select":
      return createSelectInput(propName, inputConfig, currentValue, node);
    case "number":
      return createNumberInput(propName, currentValue as number, node);
    case "url":
      return createUrlInput(propName, currentValue as string, node);
    case "image":
      return createImageInput(propName, currentValue as string, node);
    case "object":
      return createObjectInput(propName, currentValue as Record<string, unknown>, node);
    default:
      return createTextInput(propName, currentValue as string, node);
  }
}

/** Create text input */
function createTextInput(propName: string, value: string, node: ComponentNode): HTMLElement {
  const input = document.createElement("input");

  input.type = "text";
  input.className = "prop-field-input";
  input.value = value || "";

  input.addEventListener("input", (e) => {
    builderState.updateNodeProperty(node.id, propName, (e.target as HTMLInputElement).value);
  });

  return input;
}

/** Create number input */
function createNumberInput(propName: string, value: number, node: ComponentNode): HTMLElement {
  const input = document.createElement("input");

  input.type = "number";
  input.className = "prop-field-input";
  input.value = String(value || 0);

  input.addEventListener("input", (e) => {
    builderState.updateNodeProperty(
      node.id,
      propName,
      parseFloat((e.target as HTMLInputElement).value) || 0
    );
  });

  return input;
}

/** Create select input */
function createSelectInput(
  propName: string,
  inputConfig: InputConfig,
  value: unknown,
  node: ComponentNode
): HTMLElement {
  const select = document.createElement("select");

  select.className = "prop-field-select";

  const rawOptions = inputConfig.options?.values;
  const options = Array.isArray(rawOptions) ? rawOptions : [];

  options.forEach((opt) => {
    const option = document.createElement("option");

    if (typeof opt === "string") {
      option.value = opt;
      option.textContent = opt;
    } else {
      option.value = opt.id;
      option.textContent = opt.name;
    }
    if (option.value === value) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    builderState.updateNodeProperty(node.id, propName, (e.target as HTMLSelectElement).value);
  });

  return select;
}

/** Create boolean/switch input */
function createBooleanInput(propName: string, value: boolean, node: ComponentNode): HTMLElement {
  return createSlider(!!value, (checked) => {
    builderState.updateNodeProperty(node.id, propName, checked);
  });
}

/** Create URL input */
function createUrlInput(propName: string, value: string, node: ComponentNode): HTMLElement {
  const input = document.createElement("input");

  input.type = "url";
  input.className = "prop-field-input";
  input.value = value || "";
  input.placeholder = "https://example.com";

  input.addEventListener("input", (e) => {
    builderState.updateNodeProperty(node.id, propName, (e.target as HTMLInputElement).value);
  });

  return input;
}

/** Create image input */
function createImageInput(propName: string, value: string, node: ComponentNode): HTMLElement {
  const container = document.createElement("div");

  container.className = "prop-image-input-container";

  const input = document.createElement("input");

  input.type = "text";
  input.className = "prop-field-input";
  input.value = value || "";
  input.placeholder = "/images/example.jpg";

  input.addEventListener("input", (e) => {
    builderState.updateNodeProperty(node.id, propName, (e.target as HTMLInputElement).value);
  });

  const hint = document.createElement("small");

  hint.className = "prop-input-hint";
  hint.textContent = "Enter image path";

  container.appendChild(input);
  container.appendChild(hint);

  return container;
}

/** Create object input (JSON textarea) */
function createObjectInput(
  propName: string,
  value: Record<string, unknown>,
  node: ComponentNode
): HTMLElement {
  const textarea = document.createElement("textarea");

  textarea.className = "prop-field-textarea";
  textarea.rows = 6;
  textarea.value = JSON.stringify(value, null, 2);
  textarea.placeholder = "{}";

  let parseTimeout: number;

  textarea.addEventListener("input", (e) => {
    clearTimeout(parseTimeout);
    textarea.classList.remove("error");

    parseTimeout = window.setTimeout(() => {
      try {
        const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);

        builderState.updateNodeProperty(node.id, propName, parsed);
        textarea.classList.remove("error");
      } catch {
        textarea.classList.add("error");
      }
    }, 500);
  });

  return textarea;
}
