import yaml from "js-yaml";

import type { ComponentInfo, ComponentMetadata, ComponentNode, InputConfig } from "../../types";
import { shouldUseMapPattern, type BuilderNode } from "../shared";
import {
  collectDeepExposedPropNames,
  getChildComponentPropInfo,
  getChildWrapperPropConfig,
} from "./treeHelpers";

function normalizeInputConfigForExport(inputConfig: InputConfig): InputConfig {
  const normalized: InputConfig = { ...(inputConfig as InputConfig) };

  if (inputConfig.options && typeof inputConfig.options === "object") {
    const options = { ...inputConfig.options };

    if (typeof options.selectDataRef === "string") {
      options.values = options.selectDataRef;
      delete options.selectDataRef;
    }

    normalized.options = options;
  }

  return normalized;
}

/** Generate CloudCannon inputs YAML. */
export function generateCloudCannonInputs(
  blocks: ComponentNode[],
  components: ComponentInfo[],
  metadataMap: Record<string, ComponentMetadata>,
  originalTree: BuilderNode[]
): string {
  const inputs: Record<string, InputConfig> = {
    label: {
      type: "text",
      comment: "Label for the component",
    },
  };

  function collectExposedInputs(node: ComponentNode, originalNode: BuilderNode | null): void {
    const componentInfo = components.find((c) => c.path === node._component);

    if (!componentInfo?.inputs) return;

    const fallbackProp = metadataMap[node._component]?.fallbackFor || "contentSections";
    const originalNested = originalNode?.[fallbackProp] as BuilderNode[] | undefined;
    const useMapPattern = originalNested
      ? shouldUseMapPattern(originalNested, metadataMap, node._component)
      : false;
    const mapPatternSlot = useMapPattern ? fallbackProp : null;

    Object.entries(componentInfo.inputs).forEach(([propName, inputConfig]) => {
      if (propName === mapPatternSlot) return;

      const isHardcoded = originalNode ? originalNode[`_hardcoded_${propName}`] !== false : true;
      const modeKey = `_${propName}_mode` as const;
      const isInFreeformMode = originalNode && originalNode[modeKey] === "prop";
      const hasMode = originalNode && originalNode[modeKey] !== undefined;

      if (hasMode && !isInFreeformMode) return;

      if (!isHardcoded || isInFreeformMode) {
        const renamedKey = originalNode?.[`_renamed_${propName}`] || propName;

        if (!inputs[renamedKey]) {
          inputs[renamedKey] = normalizeInputConfigForExport(inputConfig as InputConfig);
        }
      }
    });

    const modeKey = `_${fallbackProp}_mode` as const;
    const isSlotInFreeformMode = originalNode && originalNode[modeKey] === "prop";

    if (!isSlotInFreeformMode && node[fallbackProp] && Array.isArray(node[fallbackProp])) {
      if (useMapPattern && originalNested && originalNested.length > 0) {
        const renamedKey = originalNode?.[`_renamed_${fallbackProp}`] || fallbackProp;
        const firstChild = originalNested[0];
        const firstChildClean = (node[fallbackProp] as ComponentNode[])[0];

        const deepProps = collectDeepExposedPropNames(firstChild, firstChildClean, components);
        const objectFields: Record<string, InputConfig> = {};

        for (const { renamedKey: fieldKey, inputConfig: fieldConfig } of deepProps) {
          if (!objectFields[fieldKey] && fieldConfig) {
            objectFields[fieldKey] = normalizeInputConfigForExport(fieldConfig);
          }
        }

        const childPropInfo = getChildComponentPropInfo(metadataMap[node._component]);

        if (childPropInfo) {
          for (const prop of childPropInfo.regularProps) {
            if (firstChild?.[`_hardcoded_${prop}`] !== false) continue;

            const renamedPropKey = firstChild?.[`_renamed_${prop}`] || prop;

            if (!objectFields[renamedPropKey]) {
              const config = getChildWrapperPropConfig(componentInfo, fallbackProp, prop);

              objectFields[renamedPropKey] = config
                ? normalizeInputConfigForExport(config)
                : {
                    type: "text",
                    comment: `${prop} value`,
                  };
            }
          }
        }

        if (Object.keys(objectFields).length > 0 && !inputs[renamedKey]) {
          inputs[renamedKey] = {
            type: "array",
            label: renamedKey.charAt(0).toUpperCase() + renamedKey.slice(1),
            options: {
              structures: {
                values: [
                  {
                    label: "Item",
                    value: objectFields,
                  },
                ],
              },
            },
          } as unknown as InputConfig;
        }
      } else {
        (node[fallbackProp] as ComponentNode[]).forEach((child, idx) => {
          collectExposedInputs(child, originalNested?.[idx] || null);
        });
      }
    }
  }

  blocks.forEach((block, idx) => {
    collectExposedInputs(block, originalTree[idx] || null);
  });

  return yaml.dump(inputs, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}
