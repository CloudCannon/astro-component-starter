import type { ComponentInfo, ComponentMetadata, ComponentNode, InputConfig } from "../../types";
import type { BuilderNode } from "../shared";

/** Get child component props split into slot and non-slot categories. */
export function getChildComponentPropInfo(
  metadata: ComponentMetadata | undefined
): { slotProps: string[]; regularProps: string[] } | null {
  if (!metadata?.childComponent?.props) return null;

  const slotProps: string[] = [];
  const regularProps: string[] = [];

  for (const prop of metadata.childComponent.props) {
    if (prop.endsWith("/slot")) {
      slotProps.push(prop.replace("/slot", ""));
    } else {
      regularProps.push(prop);
    }
  }

  return { slotProps, regularProps };
}

/** Resolve child-wrapper prop config from parent inline `_inputs` structure definition. */
export function getChildWrapperPropConfig(
  componentInfo: ComponentInfo | undefined,
  fallbackProp: string,
  propName: string
): InputConfig | null {
  if (!componentInfo?.inputs || !componentInfo.structureValue?._structures) return null;

  const structuresRef = componentInfo.inputs[fallbackProp]?.options?.structures;

  if (typeof structuresRef !== "string") return null;

  const structureName = structuresRef.replace("_structures.", "");
  const structureDef = componentInfo.structureValue._structures[structureName] as
    | { values?: Array<{ _inputs?: Record<string, InputConfig> }> }
    | undefined;
  const inputsDef = structureDef?.values?.[0]?._inputs;
  const config = inputsDef?.[propName];

  return config ? { ...(config as InputConfig) } : null;
}

/** Recursively search a cleaned component tree for a prop value. */
export function findPropValueInTree(node: ComponentNode, propName: string): unknown {
  if (!node || typeof node !== "object") return undefined;

  if (node[propName] !== undefined) return node[propName];

  for (const key of Object.keys(node)) {
    if (Array.isArray(node[key])) {
      for (const child of node[key] as ComponentNode[]) {
        if (child && typeof child === "object") {
          const found = findPropValueInTree(child, propName);

          if (found !== undefined) return found;
        }
      }
    }
  }

  return undefined;
}

/** Remove internal builder properties from exported structure values. */
export function stripRuntimeIds(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripRuntimeIds(item));
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith("_") || key === "editable" || key === "useDefaultEditableBinding")
        continue;
      result[key] = stripRuntimeIds(val);
    }

    return result;
  }

  return value;
}

/** Recursively collect all exposed prop names from a node and its descendants. */
export function collectDeepExposedPropNames(
  node: BuilderNode,
  cleanNode: ComponentNode,
  components: ComponentInfo[]
): { propName: string; renamedKey: string; inputConfig: InputConfig | null }[] {
  const results: { propName: string; renamedKey: string; inputConfig: InputConfig | null }[] = [];

  if (!node || !cleanNode) return results;

  const componentInfo = components.find((c) => c.path === cleanNode._component);

  Object.keys(node).forEach((key) => {
    if (key.startsWith("_hardcoded_") && node[key] === false) {
      const propName = key.replace("_hardcoded_", "");
      const renamedKey = node[`_renamed_${propName}`] || propName;
      const inputConfig = componentInfo?.inputs?.[propName]
        ? { ...(componentInfo.inputs[propName] as InputConfig) }
        : null;

      results.push({ propName, renamedKey, inputConfig });
    }
  });

  Object.keys(node).forEach((key) => {
    if (Array.isArray(node[key]) && !key.startsWith("_")) {
      const modeKey = `_${key}_mode` as const;

      if (node[modeKey] === "prop") {
        const renamedKey = node[`_renamed_${key}`] || key;
        const inputConfig = componentInfo?.inputs?.[key]
          ? { ...(componentInfo.inputs[key] as InputConfig) }
          : null;

        results.push({ propName: key, renamedKey, inputConfig });
        return;
      }

      const children = node[key] as BuilderNode[];
      const cleanChildren = (cleanNode[key] as ComponentNode[]) || [];

      children.forEach((child, idx) => {
        if (child && typeof child === "object") {
          results.push(...collectDeepExposedPropNames(child, cleanChildren[idx], components));
        }
      });
    }
  });

  return results;
}

/** Clean component tree by removing internal builder properties. */
export function cleanComponentTree(tree: ComponentNode[]): ComponentNode[] {
  return tree.map((node) => {
    const cleaned: ComponentNode = {
      _nodeId: node._nodeId,
      _component: node._component,
    };

    Object.keys(node).forEach((key) => {
      if (
        key.startsWith("_hardcoded_") ||
        key.startsWith("_renamed_") ||
        key.endsWith("_mode") ||
        key.endsWith("_previewCount") ||
        key === "_nodeId" ||
        key === "_component" ||
        key === "_isRootComponent" ||
        key === "editable" ||
        key === "useDefaultEditableBinding"
      ) {
        return;
      }

      if (Array.isArray(node[key])) {
        cleaned[key] = cleanComponentTree(node[key] as ComponentNode[]);
      } else {
        cleaned[key] = node[key];
      }
    });

    return cleaned;
  });
}
