import type { ComponentNode } from "../types";

export function toggleSlotModeOperation(
  nodeId: string,
  slotPropName: string,
  findComponentNode: (id: string, tree?: ComponentNode[]) => ComponentNode | null
): boolean {
  const node = findComponentNode(nodeId);

  if (!node) return false;

  const modeKey = `_${slotPropName}_mode`;
  const currentMode = (node[modeKey] as string) || "components";
  const newMode = currentMode === "components" ? "prop" : "components";

  if (!node[slotPropName]) {
    node[slotPropName] = [];
  }

  node[modeKey] = newMode;

  if (newMode === "prop") {
    node[`_hardcoded_${slotPropName}`] = false;
  }

  return true;
}

export function updateNodePropertyOperation(
  nodeId: string,
  propName: string,
  value: unknown,
  findComponentNode: (id: string, tree?: ComponentNode[]) => ComponentNode | null
): boolean {
  const node = findComponentNode(nodeId);

  if (!node) return false;

  if (value === undefined) {
    delete node[propName];
  } else {
    node[propName] = value;
  }

  return true;
}
