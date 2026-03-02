import type { ComponentInfo, ComponentMetadata, ComponentNode, NodeLocation } from "../types";

type GetComponentInfo = (path: string) => ComponentInfo | undefined;

export function findComponentNodeInTree(
  id: string,
  tree: ComponentNode[],
  getComponentInfo: GetComponentInfo,
  metadataMap: Record<string, ComponentMetadata>
): ComponentNode | null {
  for (const node of tree) {
    if (node._nodeId === id) return node;

    const componentInfo = getComponentInfo(node._component);

    if (componentInfo?.slots) {
      for (const slot of componentInfo.slots) {
        const children = node[slot.propName];

        if (Array.isArray(children)) {
          const found = findComponentNodeInTree(
            id,
            children as ComponentNode[],
            getComponentInfo,
            metadataMap
          );

          if (found) return found;
        }
      }
    }

    const fallbackProp = metadataMap[node._component]?.fallbackFor;

    if (fallbackProp) {
      const children = node[fallbackProp];

      if (Array.isArray(children)) {
        const found = findComponentNodeInTree(
          id,
          children as ComponentNode[],
          getComponentInfo,
          metadataMap
        );

        if (found) return found;
      }
    }
  }

  return null;
}

export function isNodeAncestorOfInTree(
  ancestorId: string,
  descendantId: string,
  componentTree: ComponentNode[],
  getComponentInfo: GetComponentInfo,
  metadataMap: Record<string, ComponentMetadata>
): boolean {
  if (ancestorId === descendantId) return true;

  const ancestor = findComponentNodeInTree(
    ancestorId,
    componentTree,
    getComponentInfo,
    metadataMap
  );

  if (!ancestor) return false;

  const componentInfo = getComponentInfo(ancestor._component);

  if (componentInfo?.slots) {
    for (const slot of componentInfo.slots) {
      const children = ancestor[slot.propName];

      if (Array.isArray(children)) {
        for (const child of children as ComponentNode[]) {
          if (
            isNodeAncestorOfInTree(
              child._nodeId,
              descendantId,
              componentTree,
              getComponentInfo,
              metadataMap
            )
          ) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export function findNodeLocationInTree(
  nodeId: string,
  tree: ComponentNode[],
  getComponentInfo: GetComponentInfo,
  metadataMap: Record<string, ComponentMetadata>,
  parentId: string | null = null,
  slotName: string | null = null
): NodeLocation | null {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i]._nodeId === nodeId) {
      return { index: i, parentId, slotName };
    }

    const componentInfo = getComponentInfo(tree[i]._component);

    if (componentInfo?.slots) {
      for (const slot of componentInfo.slots) {
        const children = tree[i][slot.propName];

        if (Array.isArray(children)) {
          const found = findNodeLocationInTree(
            nodeId,
            children as ComponentNode[],
            getComponentInfo,
            metadataMap,
            tree[i]._nodeId,
            slot.propName
          );

          if (found) return found;
        }
      }
    }

    const fallbackProp = metadataMap[tree[i]._component]?.fallbackFor;

    if (fallbackProp) {
      const children = tree[i][fallbackProp];

      if (Array.isArray(children)) {
        const found = findNodeLocationInTree(
          nodeId,
          children as ComponentNode[],
          getComponentInfo,
          metadataMap,
          tree[i]._nodeId,
          fallbackProp
        );

        if (found) return found;
      }
    }
  }

  return null;
}

export function removeNodeFromTree(
  nodeId: string,
  tree: ComponentNode[],
  getComponentInfo: GetComponentInfo,
  metadataMap: Record<string, ComponentMetadata>
): ComponentNode | null {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i]._nodeId === nodeId) {
      return tree.splice(i, 1)[0];
    }

    const componentInfo = getComponentInfo(tree[i]._component);

    if (componentInfo?.slots) {
      for (const slot of componentInfo.slots) {
        const children = tree[i][slot.propName];

        if (Array.isArray(children)) {
          const found = removeNodeFromTree(
            nodeId,
            children as ComponentNode[],
            getComponentInfo,
            metadataMap
          );

          if (found) return found;
        }
      }
    }

    const fallbackProp = metadataMap[tree[i]._component]?.fallbackFor;

    if (fallbackProp) {
      const children = tree[i][fallbackProp];

      if (Array.isArray(children)) {
        const found = removeNodeFromTree(
          nodeId,
          children as ComponentNode[],
          getComponentInfo,
          metadataMap
        );

        if (found) return found;
      }
    }
  }

  return null;
}
