/**
 * Component Discovery
 *
 * Server-side utility that scans component directories and CloudCannon
 * structures to build the registry consumed by the ComponentBuilder.
 */

import { existsSync, readFileSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";

import {
  getComponentMetadataMap,
  type ComponentMetadata as SharedComponentMetadata,
} from "../../../shared/metadata";
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

type SelectDataValues = Array<string | { id: string; name: string }>;

/** Load the datasets named in `data_config` so select inputs that reference
 *  e.g. `data.icons` can be resolved at discovery time. */
function loadSelectData(): Record<string, SelectDataValues> {
  const configPath = join(process.cwd(), "cloudcannon.config.yml");

  if (!existsSync(configPath)) return {};

  try {
    const config = yaml.load(readFileSync(configPath, "utf8")) as Record<string, unknown> | null;
    const dataConfig = config?.data_config as Record<string, { path?: string }> | undefined;

    if (!dataConfig) return {};

    const datasets: Record<string, SelectDataValues> = {};

    for (const [key, entry] of Object.entries(dataConfig)) {
      const dataPath = entry?.path ? join(process.cwd(), entry.path) : "";

      if (!dataPath || !existsSync(dataPath)) continue;

      const values = yaml.load(readFileSync(dataPath, "utf8"));

      if (Array.isArray(values)) datasets[key] = values as SelectDataValues;
    }

    return datasets;
  } catch (error) {
    console.warn("Error reading CloudCannon datasets for select inputs:", error);
  }

  return {};
}

/** Replace string references like `data.icons` with actual values. */
function resolveSelectDataRefs(
  inputs: Record<string, InputConfig>,
  selectData: Record<string, SelectDataValues>
): void {
  for (const inputConfig of Object.values(inputs)) {
    const values = inputConfig.options?.values;

    if (typeof values === "string" && values.startsWith("data.")) {
      const key = values.slice("data.".length);

      if (selectData[key]) {
        // Keep original reference so export can emit `data.*`
        // while the builder UI can still render concrete select options.
        inputConfig.options!.selectDataRef = values;
        inputConfig.options!.values = selectData[key];
      }
    }
  }
}

/** Discover components from an already-loaded metadata map. Safe for Vitest. */
export function discoverComponentsFrom(
  metadataMap: Map<string, SharedComponentMetadata>
): ComponentDiscoveryResult {
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

/** Discover components, slots, nesting rules, and category groupings. */
export async function discoverComponents(): Promise<ComponentDiscoveryResult> {
  return discoverComponentsFrom(await getComponentMetadataMap());
}
