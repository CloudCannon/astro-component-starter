/**
 * Component Discovery
 *
 * Server-side utility that scans component directories and CloudCannon
 * structures to build the registry consumed by the ComponentBuilder.
 */

import { existsSync, readFileSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";

import { getComponentMetadataMap } from "../../../shared/metadata";
import {
  discoverPageSectionCategories,
  groupComponentsByCategory,
  populateAllowedComponentsForSlots,
  registerVirtualComponents,
} from "./discovery/postProcessing";
import { parseNestingRules } from "./discovery/nestingRules";
import { scanBuildingBlocksComponents } from "./discovery/scanBuildingBlocks";
import { scanPageBuilderComponents } from "./discovery/scanPageBuilders";
import type { ComponentInfo, InputConfig, NestingRules, SlotDefinition } from "../types";

// Re-export types so existing consumers don't break
export type { ComponentInfo, NestingRules, SlotDefinition };

/** Result returned by {@link discoverComponents}. */
export interface ComponentDiscoveryResult {
  components: ComponentInfo[];
  byCategory: Record<string, ComponentInfo[]>;
  nestingRules: NestingRules;
  pageSectionCategories: string[];
}

/** Load `_select_data` from cloudcannon.config.yml so select inputs that
 *  reference e.g. `_select_data.icons` can be resolved at discovery time. */
function loadSelectData(): Record<string, Array<string | { id: string; name: string }>> {
  const configPath = join(process.cwd(), "cloudcannon.config.yml");

  if (!existsSync(configPath)) return {};

  try {
    const raw = readFileSync(configPath, "utf8");
    const config = yaml.load(raw) as Record<string, unknown> | null;

    if (config?._select_data && typeof config._select_data === "object") {
      return config._select_data as Record<string, Array<string | { id: string; name: string }>>;
    }
  } catch (error) {
    console.warn("Error reading cloudcannon.config.yml for _select_data:", error);
  }

  return {};
}

/** Replace string references like `_select_data.icons` with actual values. */
function resolveSelectDataRefs(
  inputs: Record<string, InputConfig>,
  selectData: Record<string, Array<string | { id: string; name: string }>>
): void {
  for (const inputConfig of Object.values(inputs)) {
    const values = inputConfig.options?.values;

    if (typeof values === "string" && values.startsWith("_select_data.")) {
      const key = values.replace("_select_data.", "");

      if (selectData[key]) {
        // Keep original reference so export can emit `_select_data.*`
        // while the builder UI can still render concrete select options.
        inputConfig.options!.selectDataRef = values;
        inputConfig.options!.values = selectData[key];
      }
    }
  }
}

/** Discover components, slots, nesting rules, and category groupings. */
export async function discoverComponents(): Promise<ComponentDiscoveryResult> {
  const metadataMap = await getComponentMetadataMap();
  const nestingRules = parseNestingRules();

  const components: ComponentInfo[] = [
    ...scanBuildingBlocksComponents(metadataMap),
    ...scanPageBuilderComponents(metadataMap),
  ];

  const virtualComponents = registerVirtualComponents(components, metadataMap);

  components.push(...virtualComponents);

  populateAllowedComponentsForSlots(components, nestingRules);

  const selectData = loadSelectData();

  if (Object.keys(selectData).length > 0) {
    for (const component of components) {
      if (component.inputs) {
        resolveSelectDataRefs(component.inputs, selectData);
      }
    }
  }

  return {
    components,
    byCategory: groupComponentsByCategory(components),
    nestingRules,
    pageSectionCategories: discoverPageSectionCategories(),
  };
}
