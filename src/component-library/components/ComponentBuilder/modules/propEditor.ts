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

/** Count exposed props on a node */
export function getExposedPropCount(node: ComponentNode, componentInfo: ComponentInfo): number {
  if (!componentInfo.inputs) return 0;

  let count = 0;

  for (const propName of Object.keys(componentInfo.inputs)) {
    if (Array.isArray(node[propName])) {
      const modeKey = `_${propName}_mode` as keyof ComponentNode;

      if (node[modeKey] === "prop") count++;
    } else if (node[`_hardcoded_${propName}`] === false) {
      count++;
    }
  }

  return count;
}

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
  const nodeLocation = builderState.findNodeLocation(node._nodeId);

  if (nodeLocation?.parentId) {
    const parentNode = builderState.findComponentNode(nodeLocation.parentId);

    if (parentNode) {
      const parentMetadata = builderState.getMetadata(parentNode._component);

      if (parentMetadata?.childComponent?.props) {
        const allowedProps = DEFAULT_EXPOSED_PROPS[componentInfo.name];

        for (const prop of parentMetadata.childComponent.props) {
          if (!prop.endsWith("/slot")) {
            if (!allowedProps || allowedProps.includes(prop)) {
              forcedChildComponentProps.add(prop);
            }
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
  // (either in page-building mode OR has childComponent pattern with uniform children)
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

    // Slot props: only show if forced (page-building mode or uniform children)
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
    // Force-exposed: slot props (page-building mode or uniform children) or child component props (e.g. title)
    let forceReason: string | null = null;

    if (forcedSlotProps.has(propName)) {
      forceReason = "Auto-exposed: all items use the same component";
    } else if (forcedChildComponentProps.has(propName)) {
      forceReason = "Auto-exposed: required by parent component";
    }

    const field = createPropField(propName, inputConfig, node, componentInfo, forceReason);

    container.appendChild(field);
  });
}

/** Create a property field with controls */
function createPropField(
  propName: string,
  inputConfig: InputConfig,
  node: ComponentNode,
  componentInfo: ComponentInfo,
  forceReason: string | null
): HTMLElement {
  const isForcedProp = forceReason !== null;

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
        builderState.updateNodeProperty(node._nodeId, `_hardcoded_${propName}`, !exposed);
      }, 350);
    });

    field.appendChild(toggle);
  } else {
    const badge = createForceExposeBadge(forceReason!);

    field.appendChild(badge);
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

/** Create force-expose explanation badge */
function createForceExposeBadge(reason: string): HTMLElement {
  const badge = document.createElement("div");

  badge.className = "prop-field-force-badge";
  badge.textContent = reason;

  return badge;
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
      builderState.updateNodeMetaProperty(node._nodeId, `_renamed_${propName}`, newName);
    } else {
      builderState.updateNodeMetaProperty(node._nodeId, `_renamed_${propName}`, undefined);
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
        case "select":
          // Let select inputs determine a sensible initial value from options.
          currentValue = undefined;
          break;
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
    builderState.updateNodeProperty(node._nodeId, propName, (e.target as HTMLInputElement).value);
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
      node._nodeId,
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
  const optionValues = options.map((opt) => (typeof opt === "string" ? opt : opt.id));
  const hasEmptyOption = optionValues.includes("");

  let resolvedValue = value;

  if (resolvedValue === undefined || resolvedValue === null) {
    if (inputConfig.default !== undefined && inputConfig.default !== null) {
      resolvedValue = String(inputConfig.default);
    } else if (optionValues.includes("default")) {
      resolvedValue = "default";
    } else {
      resolvedValue = "";
    }

    // Persist the initial select value immediately so exports don't miss it.
    node[propName] = resolvedValue;
  }

  if (!hasEmptyOption) {
    const noneOption = document.createElement("option");

    noneOption.value = "";
    noneOption.textContent = "None";
    select.appendChild(noneOption);
  }

  options.forEach((opt) => {
    const option = document.createElement("option");

    if (typeof opt === "string") {
      option.value = opt;
      option.textContent = opt;
    } else {
      option.value = opt.id;
      option.textContent = opt.name;
    }
    if (option.value === String(resolvedValue ?? "")) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  const resolvedValueString = String(resolvedValue ?? "");

  select.value = resolvedValueString;

  select.addEventListener("change", (e) => {
    builderState.updateNodeProperty(node._nodeId, propName, (e.target as HTMLSelectElement).value);
  });

  return select;
}

/** Create boolean/switch input */
function createBooleanInput(propName: string, value: boolean, node: ComponentNode): HTMLElement {
  return createSlider(!!value, (checked) => {
    builderState.updateNodeProperty(node._nodeId, propName, checked);
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
    builderState.updateNodeProperty(node._nodeId, propName, (e.target as HTMLInputElement).value);
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
    builderState.updateNodeProperty(node._nodeId, propName, (e.target as HTMLInputElement).value);
  });

  const hint = document.createElement("small");

  hint.className = "prop-input-hint";
  hint.textContent = "Enter image path";

  container.appendChild(input);
  container.appendChild(hint);

  return container;
}

/** Create structured object editor with key-value rows */
function createObjectInput(
  propName: string,
  value: Record<string, unknown>,
  node: ComponentNode
): HTMLElement {
  const container = document.createElement("div");

  container.className = "prop-object-editor";

  const currentObj = { ...value };

  function commitObject(): void {
    builderState.updateNodeProperty(node._nodeId, propName, { ...currentObj });
  }

  function renderRows(): void {
    container.innerHTML = "";

    const entries = Object.entries(currentObj);

    for (const [key, val] of entries) {
      const row = document.createElement("div");

      row.className = "prop-object-row";

      const keyInput = document.createElement("input");

      keyInput.type = "text";
      keyInput.className = "prop-object-key";
      keyInput.value = key;
      keyInput.placeholder = "key";

      keyInput.addEventListener("change", () => {
        const newKey = keyInput.value.trim();

        if (!newKey || newKey === key) return;
        if (newKey in currentObj) return;

        const savedVal = currentObj[key];

        delete currentObj[key];
        currentObj[newKey] = savedVal;
        commitObject();
      });

      const valInput = document.createElement("input");

      valInput.type = "text";
      valInput.className = "prop-object-value";
      valInput.value = typeof val === "string" ? val : JSON.stringify(val);
      valInput.placeholder = "value";

      valInput.addEventListener("input", () => {
        const raw = valInput.value;

        try {
          currentObj[key] = JSON.parse(raw);
        } catch {
          currentObj[key] = raw;
        }

        commitObject();
      });

      const removeBtn = document.createElement("button");

      removeBtn.type = "button";
      removeBtn.className = "prop-object-remove";
      removeBtn.textContent = "\u00d7";
      removeBtn.title = "Remove field";

      removeBtn.addEventListener("click", () => {
        delete currentObj[key];
        commitObject();
        renderRows();
      });

      row.appendChild(keyInput);
      row.appendChild(valInput);
      row.appendChild(removeBtn);
      container.appendChild(row);
    }

    const addBtn = document.createElement("button");

    addBtn.type = "button";
    addBtn.className = "prop-object-add";
    addBtn.textContent = "+ Add field";

    addBtn.addEventListener("click", () => {
      let newKey = "newField";
      let i = 1;

      while (newKey in currentObj) {
        newKey = `newField${i++}`;
      }

      currentObj[newKey] = "";
      commitObject();
      renderRows();
    });

    container.appendChild(addBtn);
  }

  renderRows();

  return container;
}
