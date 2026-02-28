import { debugLog } from "../constants";
import type { ComponentInfo, ComponentNode, SlotDefinition } from "../types";

function autoWrapIfNeeded(
  componentInfo: ComponentInfo,
  slot: SlotDefinition | undefined,
  getComponentInfo: (path: string) => ComponentInfo | undefined,
  createComponentNode: (componentInfo: ComponentInfo) => ComponentNode
): ComponentNode | null {
  if (!slot) return null;

  const isAllowed = slot.allowedComponents.some(
    (allowed) => allowed === componentInfo.path || allowed.endsWith("/*")
  );

  if (isAllowed) return null;

  if (slot.allowedComponents.length !== 1) return null;

  const wrapperPath = slot.allowedComponents[0];

  if (wrapperPath.endsWith("/*")) return null;

  const wrapperInfo = getComponentInfo(wrapperPath);

  if (!wrapperInfo || !wrapperInfo.slots || wrapperInfo.slots.length === 0) return null;

  const compatibleSlot = wrapperInfo.slots.find((wrapperSlot) =>
    wrapperSlot.allowedComponents.some(
      (allowed) => allowed === componentInfo.path || allowed.endsWith("/*")
    )
  );

  if (!compatibleSlot) return null;

  const wrapperNode = createComponentNode(wrapperInfo);
  const nestedNode = createComponentNode(componentInfo);

  if (!wrapperNode[compatibleSlot.propName]) {
    wrapperNode[compatibleSlot.propName] = [];
  }
  (wrapperNode[compatibleSlot.propName] as ComponentNode[]).push(nestedNode);

  debugLog(
    `Auto-wrap: Wrapped ${componentInfo.displayName} in ${wrapperInfo.displayName} (slot: ${compatibleSlot.propName})`
  );

  return wrapperNode;
}

export function addComponentToSlotOperation(
  componentInfo: ComponentInfo,
  parentId: string,
  slotName: string,
  index: number,
  findComponentNode: (id: string, tree?: ComponentNode[]) => ComponentNode | null,
  getComponentInfo: (path: string) => ComponentInfo | undefined,
  createComponentNode: (componentInfo: ComponentInfo) => ComponentNode
): ComponentNode {
  const parent = findComponentNode(parentId);

  if (!parent) {
    throw new Error(`Parent component ${parentId} not found`);
  }

  const parentInfo = getComponentInfo(parent._component);
  const slot = parentInfo?.slots?.find((s) => s.propName === slotName);
  const wrappedNode = autoWrapIfNeeded(componentInfo, slot, getComponentInfo, createComponentNode);
  const nodeToAdd = wrappedNode || createComponentNode(componentInfo);

  if (!parent[slotName]) {
    parent[slotName] = [];
  }

  const existingChildren = parent[slotName] as ComponentNode[];

  if (slot?.isRepeatable && existingChildren.length >= 1) {
    existingChildren[0] = nodeToAdd;
  } else {
    existingChildren.splice(index, 0, nodeToAdd);
  }

  return nodeToAdd;
}

export function moveComponentOperation(
  nodeId: string,
  targetParentId: string | null,
  targetSlot: string | null,
  targetIndex: number,
  componentTree: ComponentNode[],
  findNodeLocation: (
    nodeId: string,
    tree?: ComponentNode[],
    parentId?: string | null,
    slotName?: string | null
  ) => {
    index: number;
    parentId: string | null;
    slotName: string | null;
  } | null,
  removeNodeFromTreeFn: (nodeId: string, tree?: ComponentNode[]) => ComponentNode | null,
  findComponentNode: (id: string, tree?: ComponentNode[]) => ComponentNode | null
): boolean {
  const sourceInfo = findNodeLocation(nodeId);

  if (!sourceInfo) return false;

  const sameArray = sourceInfo.parentId === targetParentId && sourceInfo.slotName === targetSlot;
  const node = removeNodeFromTreeFn(nodeId);

  if (!node) return false;

  let adjustedIndex = targetIndex;

  if (sameArray && sourceInfo.index < targetIndex) {
    adjustedIndex = targetIndex - 1;
  }

  if (targetParentId && targetSlot) {
    const parentNode = findComponentNode(targetParentId);

    if (parentNode) {
      if (!parentNode[targetSlot]) {
        parentNode[targetSlot] = [];
      }
      (parentNode[targetSlot] as ComponentNode[]).splice(adjustedIndex, 0, node);
    }
  } else {
    componentTree.splice(adjustedIndex, 0, node);
  }

  return true;
}

export function deleteComponentOperation(
  id: string,
  selectedComponentId: string | null,
  removeNodeFromTreeFn: (nodeId: string, tree?: ComponentNode[]) => ComponentNode | null
): { removed: boolean; shouldClearSelection: boolean } {
  const node = removeNodeFromTreeFn(id);

  return {
    removed: !!node,
    shouldClearSelection: !!node && selectedComponentId === id,
  };
}
