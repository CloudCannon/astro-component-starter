import yaml from "js-yaml";

import { toPascalCase } from "../../../../shared/caseUtils";
import type { ComponentInfo, ComponentMetadata, ComponentNode } from "../../types";
import { shouldUseMapPattern, type BuilderNode } from "../shared";
import { stripRuntimeIds } from "./treeHelpers";

/** Generate structure value YAML. */
export function generateStructureValue(
  blocks: ComponentNode[],
  componentName: string,
  components: ComponentInfo[],
  originalTree: BuilderNode[],
  componentPath: string | null,
  metadataMap: Record<string, ComponentMetadata>
): string {
  const mainBlock = blocks[0];
  const originalBlock = originalTree[0] || null;

  if (!mainBlock) {
    return yaml.dump({
      label: componentName,
      value: {},
    });
  }

  const displayName = componentName
    .split("-")
    .map((word) => toPascalCase(word))
    .join(" ");

  const value: Record<string, unknown> = {
    _component: componentPath || `page-sections/${componentName}`,
    label: "",
  };

  const requiredStructureGlobs = new Set<string>();

  function addRequiredStructureGlob(
    componentInfo: ComponentInfo | undefined,
    propName: string
  ): void {
    const structuresRef = componentInfo?.inputs?.[propName]?.options?.structures;

    if (typeof structuresRef !== "string") return;
    const match = structuresRef.match(/_structures\.(\w+)/);

    if (match) {
      requiredStructureGlobs.add(`/.cloudcannon/structures/${match[1]}.cloudcannon.structures.yml`);
    }
  }

  function buildMapItemExample(
    node: BuilderNode | null,
    cleanNode: ComponentNode | null
  ): Record<string, unknown> {
    const example: Record<string, unknown> = {};

    if (!node || !cleanNode) return example;
    const componentInfo = components.find((c) => c.path === cleanNode._component);
    const defaultValues =
      componentInfo?.structureValue?.value && typeof componentInfo.structureValue.value === "object"
        ? (componentInfo.structureValue.value as Record<string, unknown>)
        : {};

    const candidateKeys = new Set<string>();

    // Real value keys currently present on the node.
    Object.keys(node).forEach((key) => {
      if (
        !key.startsWith("_") &&
        key !== "class" &&
        key !== "className" &&
        key !== "editable" &&
        key !== "useDefaultEditableBinding"
      ) {
        candidateKeys.add(key);
      }
    });

    const hasKnownInput = (propName: string): boolean =>
      !!componentInfo?.inputs &&
      Object.prototype.hasOwnProperty.call(componentInfo.inputs, propName);

    // Exposed keys may not have a concrete value key yet.
    Object.keys(node).forEach((key) => {
      if (key.startsWith("_hardcoded_") && node[key] === false) {
        const propName = key.replace("_hardcoded_", "");

        if (hasKnownInput(propName) || cleanNode[propName] !== undefined) {
          candidateKeys.add(propName);
        }
      }
    });

    // Freeform slot keys can also exist without a concrete value key.
    Object.keys(node).forEach((key) => {
      if (key.endsWith("_mode") && node[key as `_${string}_mode`] === "prop") {
        const propName = key.replace("_mode", "").substring(1);

        if (hasKnownInput(propName) || cleanNode[propName] !== undefined) {
          candidateKeys.add(propName);
        }
      }
    });

    for (const key of candidateKeys) {
      const modeKey = `_${key}_mode` as const;
      const isInFreeformMode = node[modeKey] === "prop";
      const isExposed = node[`_hardcoded_${key}`] === false;
      const renamedKey = (node[`_renamed_${key}`] as string) || key;
      const cleanValue = cleanNode[key];
      const isArrayValue = Array.isArray(cleanValue) && Array.isArray(node[key]);

      if (isArrayValue) {
        const children = node[key] as BuilderNode[];
        const cleanChildren = cleanValue as ComponentNode[];
        const arrayUsesMapPattern = shouldUseMapPattern(
          children,
          metadataMap,
          cleanNode._component
        );

        // Keep map-pattern arrays scoped under their own prop key.
        if (arrayUsesMapPattern) {
          if (isExposed || isInFreeformMode || children.length > 0) {
            const firstChild = children[0];
            const firstCleanChild = cleanChildren[0];

            example[renamedKey] = [buildMapItemExample(firstChild, firstCleanChild)];
          }
          continue;
        }

        // For non-map arrays in component mode, bubble up descendant exposed fields.
        if (!isInFreeformMode) {
          children.forEach((child, idx) => {
            const nested = buildMapItemExample(child, cleanChildren[idx] || null);

            Object.assign(example, nested);
          });
          continue;
        }

        // Freeform array prop on a map item stays as an exposed array value.
        addRequiredStructureGlob(componentInfo, key);
        example[renamedKey] = stripRuntimeIds(cleanValue);
        continue;
      }

      if (isExposed || isInFreeformMode) {
        if (cleanValue === undefined) {
          // Preserve exposed keys even when the current node has no concrete value yet.
          // Fall back to structure defaults when available.
          const defaultValue = defaultValues[key];

          example[renamedKey] = defaultValue !== undefined ? stripRuntimeIds(defaultValue) : null;
        } else {
          example[renamedKey] = stripRuntimeIds(cleanValue);
        }
      }
    }

    return example;
  }

  function collectExposedValues(node: BuilderNode | null, cleanNode: ComponentNode): void {
    if (!node || !cleanNode) return;

    const componentInfo = components.find((c) => c.path === cleanNode._component);

    Object.keys(node).forEach((key) => {
      if (
        key.startsWith("_") ||
        key === "class" ||
        key === "className" ||
        key === "editable" ||
        key === "useDefaultEditableBinding"
      ) {
        return;
      }

      const modeKey = `_${key}_mode` as const;
      const isInFreeformMode = node[modeKey] === "prop";
      const isExposed = node[`_hardcoded_${key}`] === false;
      const arrayUsesMapPattern =
        Array.isArray(cleanNode[key]) &&
        Array.isArray(node[key]) &&
        shouldUseMapPattern(node[key] as BuilderNode[], metadataMap, cleanNode._component);

      const hasMode = node[modeKey] !== undefined;
      const isSlotInComponentMode = hasMode && !isInFreeformMode;

      if (!isSlotInComponentMode && (isExposed || isInFreeformMode || arrayUsesMapPattern)) {
        const renamedKey = node[`_renamed_${key}`] || key;

        if (Array.isArray(cleanNode[key])) {
          if (!arrayUsesMapPattern) {
            addRequiredStructureGlob(componentInfo, key);
          }

          if (!value[renamedKey]) {
            if (arrayUsesMapPattern && (node[key] as BuilderNode[]).length > 0) {
              const childNode = (node[key] as BuilderNode[])[0];
              const cleanChildNode = (cleanNode[key] as ComponentNode[])[0];

              value[renamedKey] = [buildMapItemExample(childNode, cleanChildNode)];
            } else {
              value[renamedKey] = [];
            }
          }
        } else if (value[renamedKey] === undefined) {
          value[renamedKey] = stripRuntimeIds(cleanNode[key]);
        }
      }

      if (
        !arrayUsesMapPattern &&
        !isInFreeformMode &&
        Array.isArray(node[key]) &&
        Array.isArray(cleanNode[key])
      ) {
        (node[key] as BuilderNode[]).forEach((child, idx) => {
          if (child && typeof child === "object" && (cleanNode[key] as ComponentNode[])[idx]) {
            collectExposedValues(child, (cleanNode[key] as ComponentNode[])[idx]);
          }
        });
      }
    });
  }

  if (originalBlock && mainBlock) {
    collectExposedValues(originalBlock, mainBlock);
  }

  const firstTextKey = Object.keys(value).find(
    (k) => k !== "_component" && k !== "label" && typeof value[k] === "string" && value[k]
  );

  const structureValue: Record<string, unknown> = {
    label: displayName,
    icon: "star",
    description: `${displayName} description`,
    value,
    preview: {
      text: [displayName],
      subtext: firstTextKey ? [{ key: firstTextKey }] : undefined,
      icon: "star",
    },
    picker_preview: {
      text: displayName,
      subtext: `${displayName} description`,
    },
  };

  if (componentPath) {
    structureValue._inputs_from_glob = [
      `/src/components/${componentPath}/${componentName}.cloudcannon.inputs.yml`,
    ];
  }

  if (requiredStructureGlobs.size > 0) {
    structureValue._structures_from_glob = Array.from(requiredStructureGlobs);
  }

  return yaml.dump(structureValue, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}
