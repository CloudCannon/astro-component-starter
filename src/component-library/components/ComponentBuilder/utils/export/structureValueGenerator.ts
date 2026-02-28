import yaml from "js-yaml";

import { toPascalCase } from "../../../../shared/caseUtils";
import type { ComponentInfo, ComponentMetadata, ComponentNode } from "../../types";
import { shouldUseMapPattern, type BuilderNode } from "../shared";
import { collectDeepExposedPropNames, findPropValueInTree, stripRuntimeIds } from "./treeHelpers";

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

  const requiredStructures = new Map<string, unknown>();

  function collectExposedValues(node: BuilderNode | null, cleanNode: ComponentNode): void {
    if (!node || !cleanNode) return;

    const componentInfo = components.find((c) => c.path === cleanNode._component);

    Object.keys(node).forEach((key) => {
      if (key.startsWith("_") || key === "id" || key === "class" || key === "className") {
        return;
      }

      const modeKey = `_${key}_mode` as const;
      const isInFreeformMode = node[modeKey] === "prop";
      const isExposed = node[`_hardcoded_${key}`] === false;
      const arrayUsesMapPattern =
        Array.isArray(cleanNode[key]) &&
        Array.isArray(node[key]) &&
        shouldUseMapPattern(node[key] as BuilderNode[], metadataMap, cleanNode._component);

      if (isExposed || isInFreeformMode || arrayUsesMapPattern) {
        const renamedKey = node[`_renamed_${key}`] || key;

        if (Array.isArray(cleanNode[key])) {
          if (!value[renamedKey]) {
            if (arrayUsesMapPattern && (node[key] as BuilderNode[]).length > 0) {
              const childNode = (node[key] as BuilderNode[])[0];
              const cleanChildNode = (cleanNode[key] as ComponentNode[])[0];

              const deepProps = collectDeepExposedPropNames(childNode, cleanChildNode, components);
              const exampleItem: Record<string, unknown> = {};

              for (const { renamedKey: fieldKey, propName } of deepProps) {
                const rawValue = findPropValueInTree(cleanChildNode, propName);

                exampleItem[fieldKey] = rawValue !== undefined ? stripRuntimeIds(rawValue) : "";
              }

              value[renamedKey] = [exampleItem];
            } else {
              value[renamedKey] = [];
            }
          }

          if (isInFreeformMode && componentInfo) {
            const inputConfig = componentInfo.inputs?.[key];
            const structuresRef = inputConfig?.options?.structures;

            if (structuresRef && typeof structuresRef === "string") {
              const match = structuresRef.match(/_structures\.(\w+)/);

              if (match) {
                const structureName = match[1];
                const structureDef = componentInfo.structureValue?._structures?.[structureName];

                if (structureDef && !requiredStructures.has(structureName)) {
                  requiredStructures.set(structureName, structureDef);
                }
              }
            }
          }
        } else if (value[renamedKey] === undefined) {
          value[renamedKey] = stripRuntimeIds(cleanNode[key]);
        }
      }

      if (!arrayUsesMapPattern && Array.isArray(node[key]) && Array.isArray(cleanNode[key])) {
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

  const structureValue: Record<string, unknown> = {
    label: displayName,
    description: `${displayName} description`,
    value,
    preview: {
      text: [displayName],
    },
  };

  if (requiredStructures.size > 0) {
    const structures: Record<string, unknown> = {};

    for (const [name, def] of requiredStructures.entries()) {
      structures[name] = def;
    }
    structureValue._structures = structures;
  }

  return yaml.dump(structureValue, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}
