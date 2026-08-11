import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { findStructureValueFiles } from "./structureFiles";
import { deriveSlotsForComponent, type DerivedSlot } from "./slotDerivation";

// `componentIndex.ts` imports `astro:content`, which only resolves inside
// Astro's own Vite pipeline. `mergeSlotMetadata` below is pure and unit
// tested directly (see tests/unit/metadataParity.test.ts), so the
// astro-coupled `getComponentIndex` is loaded lazily here — a static
// top-level import would drag `astro:content` into vitest even when a test
// never calls the two async functions that actually need it.
async function loadComponentIndex() {
  const { getComponentIndex } = await import("./componentIndex");

  return getComponentIndex();
}

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

/** Declared `slots:` frontmatter entry (docs-components collection schema). */
export type SlotFrontmatter = {
  title: string;
  description?: string;
  fallback_for?: string | null;
  child_component?: { name?: string; props?: string[] } | null;
};

/** A single merged slot — everything the docs page's Slots section needs,
 *  including entries with no resolvable fallback prop. */
export type SlotDoc = {
  title: string;
  description?: string;
  fallback_for?: string;
  child_component?: ChildComponentInfo;
};

export type SlotMergeResult = {
  supportsSlots: boolean;
  fallbackFor?: string;
  childComponent?: ChildComponentInfo;
  slots?: SlotInfo[];
  allSlots: SlotDoc[];
  /** Declared slot titles with no matching derived `<slot>` in the source. */
  staleDeclared: string[];
  /** Derived slots whose fallback content is ambiguous and have no declared override. */
  needsOverride: string[];
};

/** `child_component.name` is derivable; `.props` never is (it documents which
 *  of the *child* component's own props are themselves slot-like) — so a
 *  declared override always wins for props, while name falls back to derivation. */
function mergeChildComponent(
  declared: SlotFrontmatter["child_component"],
  derived: DerivedSlot["childComponent"]
): ChildComponentInfo | undefined {
  const name = declared?.name || derived?.name;

  if (!name) return undefined;

  return declared?.props ? { name, props: declared.props } : { name };
}

/**
 * Pure merge of derived (source-of-truth) slots against declared frontmatter
 * overrides. No filesystem/Astro access — safe to unit test directly against
 * real on-disk fixtures.
 *
 * Iteration follows the DECLARED array's order (frontmatter authoring order)
 * for slots that have a declared entry, since the top-level fallbackFor/
 * childComponent selection below is order-dependent and must keep picking the
 * same "first" slot it always did (e.g. Card's before/default/after are
 * authored in a different order than they appear in the template). Any
 * derived-only slot with no declared counterpart is appended afterwards in
 * template-scan order.
 */
export function mergeSlotMetadata(
  derived: DerivedSlot[],
  declared: SlotFrontmatter[]
): SlotMergeResult {
  const derivedByName = new Map(derived.map((slot) => [slot.name, slot]));
  const declaredByName = new Map(declared.map((slot) => [slot.title, slot]));

  const orderedNames: string[] = [];

  for (const slot of declared) {
    if (!orderedNames.includes(slot.title)) orderedNames.push(slot.title);
  }
  for (const slot of derived) {
    if (!orderedNames.includes(slot.name)) orderedNames.push(slot.name);
  }

  const allSlots: SlotDoc[] = [];
  const slotInfos: SlotInfo[] = [];
  const staleDeclared: string[] = [];
  const needsOverride: string[] = [];

  let fallbackFor: string | undefined;
  let childComponent: ChildComponentInfo | undefined;

  for (const name of orderedNames) {
    const declaredSlot = declaredByName.get(name);
    const derivedSlot = derivedByName.get(name);

    if (declaredSlot && !derivedSlot) {
      staleDeclared.push(name);
    }
    if (derivedSlot?.ambiguous && !declaredSlot?.fallback_for) {
      needsOverride.push(name);
    }

    const resolvedFallback = declaredSlot?.fallback_for || derivedSlot?.fallbackFor || undefined;
    const resolvedChild = mergeChildComponent(
      declaredSlot?.child_component,
      derivedSlot?.childComponent
    );

    allSlots.push({
      title: name,
      description: declaredSlot?.description,
      fallback_for: resolvedFallback,
      child_component: resolvedChild,
    });

    if (resolvedFallback) {
      slotInfos.push({ name, fallbackFor: resolvedFallback, childComponent: resolvedChild });
    }

    // The first slot with both a child component and a fallback prop wins;
    // failing that, the first slot with any fallback prop.
    if (resolvedChild && resolvedFallback && !childComponent) {
      childComponent = resolvedChild;
      fallbackFor = resolvedFallback;
    } else if (resolvedFallback && !fallbackFor) {
      fallbackFor = resolvedFallback;
    }
  }

  return {
    supportsSlots: orderedNames.length > 0,
    fallbackFor,
    childComponent,
    slots: slotInfos.length > 0 ? slotInfos : undefined,
    allSlots,
    staleDeclared,
    needsOverride,
  };
}

function toDeclaredSlots(docsData: { slots?: SlotFrontmatter[] } | undefined): SlotFrontmatter[] {
  return docsData?.slots ?? [];
}

let metadataCache: Map<string, ComponentMetadata> | null = null;
let nestedBlockPropertiesCache: Set<string> | null = null;

/**
 * Loads and caches component metadata, derived from each component's `.astro`
 * source and patched by any declared `slots:` frontmatter overrides.
 */
export async function getComponentMetadataMap(): Promise<Map<string, ComponentMetadata>> {
  if (metadataCache) {
    return metadataCache;
  }

  metadataCache = new Map();

  try {
    const index = await loadComponentIndex();

    for (const entry of index) {
      const derivedSlots = deriveSlotsForComponent(entry.key);
      const declaredSlots = toDeclaredSlots(entry.docsEntry?.data);
      const merged = mergeSlotMetadata(derivedSlots, declaredSlots);

      for (const staleName of merged.staleDeclared) {
        console.warn(
          `[component-docs] "${entry.key}" declares a "${staleName}" slot in its docs frontmatter, but no matching <slot> was found in the component source. Remove or update the stale declaration.`
        );
      }
      for (const needsOverrideName of merged.needsOverride) {
        console.warn(
          `[component-docs] "${entry.key}" has an ambiguous "${needsOverrideName}" slot — its fallback content references zero or multiple props, so a fallback_for override is needed in its docs frontmatter.`
        );
      }

      metadataCache.set(entry.key, {
        childComponent: merged.childComponent,
        fallbackFor: merged.fallbackFor,
        supportsSlots: merged.supportsSlots,
        slots: merged.slots,
      });
    }
  } catch (error) {
    console.error("Error loading component metadata:", error);
  }

  return metadataCache;
}

/** All merged slots (declared overrides patched onto derived slots) for a
 *  single component's docs page, including entries with no resolvable
 *  fallback prop — used by the Slots section, which documents every `<slot>`
 *  regardless of whether it has one. */
export async function getMergedSlotDocs(componentKey: string): Promise<SlotDoc[]> {
  const index = await loadComponentIndex();
  const entry = index.find((candidate) => candidate.key === componentKey);
  const derivedSlots = deriveSlotsForComponent(componentKey);
  const declaredSlots = toDeclaredSlots(entry?.docsEntry?.data);

  return mergeSlotMetadata(derivedSlots, declaredSlots).allSlots;
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
