/**
 * Component Discovery
 *
 * Server-side utility that scans component directories and CloudCannon
 * structures to build the registry consumed by the ComponentBuilder.
 *
 * @module componentDiscovery
 */

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
import type { ComponentInfo, NestingRules, SlotDefinition } from "../types";

// Re-export types so existing consumers don't break
export type { ComponentInfo, NestingRules, SlotDefinition };

/** Enable debug logging for component discovery (set to false in production). */
const DEBUG = false;

/** Debug log helper. */
function debugLog(...args: unknown[]): void {
  if (DEBUG) {
    console.log("[ComponentDiscovery]", ...args);
  }
}

/** Result returned by {@link discoverComponents}. */
export interface ComponentDiscoveryResult {
  components: ComponentInfo[];
  byCategory: Record<string, ComponentInfo[]>;
  nestingRules: NestingRules;
  pageSectionCategories: string[];
}

/** Discover components, slots, nesting rules, and category groupings. */
export async function discoverComponents(): Promise<ComponentDiscoveryResult> {
  const metadataMap = await getComponentMetadataMap();
  const nestingRules = parseNestingRules(debugLog);

  const components: ComponentInfo[] = [
    ...scanBuildingBlocksComponents(metadataMap, debugLog),
    ...scanPageBuilderComponents(debugLog),
  ];

  debugLog("Registering virtual components from inline structures...");
  const virtualComponents = registerVirtualComponents(components, metadataMap, debugLog);

  components.push(...virtualComponents);
  debugLog(`Added ${virtualComponents.length} virtual components`);

  debugLog("Populating allowed components for slots...");
  debugLog("Nesting rules:", nestingRules);
  populateAllowedComponentsForSlots(components, nestingRules, debugLog);

  return {
    components,
    byCategory: groupComponentsByCategory(components),
    nestingRules,
    pageSectionCategories: discoverPageSectionCategories(),
  };
}
