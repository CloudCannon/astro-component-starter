import { getCollection } from "astro:content";
import { readFileSync } from "fs";
import yaml from "js-yaml";
import { findStructureValueFiles } from "./structureFiles";

type ChildComponentInfo = {
  name: string;
  props?: string[];
};

export type SlotInfo = {
  name: string;
  fallbackFor: string;
  childComponent?: ChildComponentInfo;
};

export type ComponentMetadata = {
  childComponent?: ChildComponentInfo;
  fallbackFor?: string;
  supportsSlots?: boolean;
  slots?: SlotInfo[];
};

let metadataCache: Map<string, ComponentMetadata> | null = null;
let nestedBlockPropertiesCache: Set<string> | null = null;

/** Loads and caches component metadata from the docs-components collection. */
export async function getComponentMetadataMap(): Promise<Map<string, ComponentMetadata>> {
  if (metadataCache) {
    return metadataCache;
  }

  metadataCache = new Map();

  try {
    const components = await getCollection("docs-components");

    for (const component of components) {
      if (!component || !component.id || component.id.includes("/examples/")) {
        continue;
      }

      const slug = component.id.replace(/^components\//, "").replace(/\/index$/, "");
      const slots = component.data?.slots || [];
      const supportsSlots = slots.length > 0;

      let childComponent: ChildComponentInfo | undefined;
      let fallbackFor: string | undefined;
      const slotInfos: SlotInfo[] = [];

      for (const slot of slots) {
        if (slot?.fallback_for) {
          slotInfos.push({
            name: slot.title || "default",
            fallbackFor: slot.fallback_for,
            childComponent: slot.child_component || undefined,
          });
        }

        if (slot?.child_component && slot?.fallback_for && !childComponent) {
          childComponent = slot.child_component;
          fallbackFor = slot.fallback_for;
        } else if (slot?.fallback_for && !fallbackFor) {
          fallbackFor = slot.fallback_for;
        }
      }

      metadataCache.set(slug, {
        childComponent,
        fallbackFor,
        supportsSlots,
        slots: slotInfos.length > 0 ? slotInfos : undefined,
      });
    }
  } catch (error) {
    console.error("Error loading component metadata:", error);
  }

  return metadataCache;
}

/** Scans structure-value files to find properties that can contain nested blocks. */
export async function getNestedBlockProperties(): Promise<Set<string>> {
  if (nestedBlockPropertiesCache) {
    return nestedBlockPropertiesCache;
  }

  nestedBlockPropertiesCache = new Set<string>();

  try {
    const componentsDir = "src/components";
    const structureValueFiles = findStructureValueFiles(componentsDir);

    for (const filePath of structureValueFiles) {
      try {
        const content = readFileSync(filePath, "utf8");
        const configData = yaml.load(content) as any;

        if (configData._inputs && typeof configData._inputs === "object") {
          for (const [, inputConfig] of Object.entries(configData._inputs)) {
            const input = inputConfig as any;

            if (input?.type === "array" && input?.options?.structures) {
              const structures = input.options.structures;

              if (typeof structures === "string" && structures.startsWith("_structures.")) {
                const structureName = structures.replace("_structures.", "");

                nestedBlockPropertiesCache.add(structureName);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error parsing structure-value file ${filePath}:`, error);
      }
    }

    const metadataMap = await getComponentMetadataMap();

    for (const metadata of metadataMap.values()) {
      if (metadata.fallbackFor) {
        nestedBlockPropertiesCache.add(metadata.fallbackFor);
      }

      if (metadata.slots) {
        for (const slot of metadata.slots) {
          nestedBlockPropertiesCache.add(slot.fallbackFor);
        }
      }
    }

    nestedBlockPropertiesCache.add("formBlocks");
  } catch (error) {
    console.error("Error loading structure-value files for block properties:", error);
  }

  return nestedBlockPropertiesCache;
}
