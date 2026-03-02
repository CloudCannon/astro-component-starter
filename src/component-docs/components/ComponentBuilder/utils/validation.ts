/**
 * Validation Utilities
 * Validates the component tree for export readiness.
 *
 * Currently checks for duplicate exposed prop names — two or more components
 * that expose the same prop name would create a naming collision in the
 * exported Astro component.
 */

import { debugLog } from "../constants";
import type { ComponentMetadata, ComponentNode } from "../types";
import { type BuilderNode, shouldUseMapPattern } from "./shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Location of a prop in the component tree (used in validation errors). */
export interface PropLocation {
  nodeId: string;
  /** Human-readable path, e.g. "Carousel #1 > CarouselSlide #1" */
  nodePath: string;
  originalPropName: string;
  exposedPropName: string;
}

/** Validation error describing a set of duplicate exposed prop names. */
export interface DuplicatePropError {
  exposedName: string;
  locations: PropLocation[];
}

/** Overall validation result for the component tree. */
export interface ValidationResult {
  isValid: boolean;
  duplicateProps: DuplicatePropError[];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validate the component tree for duplicate exposed prop names.
 *
 * Walks the entire tree, collecting every exposed prop and the node it
 * belongs to. If the same exposed name appears on two *different* nodes
 * the result will be marked invalid with details about the collision.
 *
 * @param componentTree   - The root-level array of component nodes.
 * @param getComponentPath - Resolver that turns a `_component` path into a
 *                           human-readable display name.
 * @param metadataMap      - Metadata map for `.map()` pattern detection.
 */
export function validateComponentTree(
  componentTree: ComponentNode[],
  getComponentPath: (componentPath: string) => string,
  metadataMap: Record<string, ComponentMetadata> = {}
): ValidationResult {
  const exposedPropsMap = new Map<string, PropLocation[]>();
  const scopedDuplicateProps: DuplicatePropError[] = [];

  function addExposedPropLocation(exposedName: string, location: PropLocation): void {
    if (!exposedPropsMap.has(exposedName)) {
      exposedPropsMap.set(exposedName, []);
    }

    exposedPropsMap.get(exposedName)?.push(location);
  }

  function collectScopedExposedProps(node: BuilderNode, nodePath: string): PropLocation[] {
    const results: PropLocation[] = [];

    // Regular exposed props.
    // Arrays are included when exposed because they can still collide
    // (e.g. two repeatable slots both exposed as "items").
    for (const key of Object.keys(node)) {
      if (!key.startsWith("_hardcoded_")) continue;
      if (node[key]) continue;

      const originalPropName = key.replace("_hardcoded_", "");

      const exposedPropName = node[`_renamed_${originalPropName}`] || originalPropName;

      results.push({
        nodeId: node._nodeId,
        nodePath,
        originalPropName,
        exposedPropName,
      });
    }

    // Slot props in page-building mode
    for (const key of Object.keys(node)) {
      if (!key.endsWith("_mode") || node[key as `_${string}_mode`] !== "prop") continue;

      const originalPropName = key.replace("_mode", "").substring(1);
      const exposedPropName = node[`_renamed_${originalPropName}`] || originalPropName;

      results.push({
        nodeId: node._nodeId,
        nodePath,
        originalPropName,
        exposedPropName,
      });
    }

    // Recurse into active nested arrays, but stop at nested map pattern boundaries
    const activeSlotKeys = Object.keys(node).filter(
      (k) => Array.isArray(node[k]) && !k.startsWith("_") && node[`_${k}_mode` as const] !== "prop"
    );

    for (const key of activeSlotKeys) {
      const children = node[key] as BuilderNode[];

      if (shouldUseMapPattern(children, metadataMap, node._component)) continue;

      const slotLabel = activeSlotKeys.length > 1 ? ` [${key}]` : "";

      children.forEach((child, idx) => {
        if (!child || typeof child !== "object" || !child._component) return;

        const childPath = `${nodePath}${slotLabel} > ${getComponentPath(child._component)} #${idx + 1}`;

        results.push(...collectScopedExposedProps(child, childPath));
      });
    }

    return results;
  }

  /**
   * Recursively collect all exposed props from a node and its descendants.
   */
  function collectExposedProps(node: BuilderNode, nodePath: string, parentPath = ""): void {
    if (!node) return;

    const currentPath = parentPath ? `${parentPath} > ${nodePath}` : nodePath;

    // Collect slot prop names that will be handled by the .map() pattern below
    // so we don't double-count them as regular exposed props.
    const mapPatternSlots = new Set<string>();

    for (const key of Object.keys(node)) {
      if (!Array.isArray(node[key]) || key.startsWith("_")) continue;

      const children = node[key] as BuilderNode[];

      if (shouldUseMapPattern(children, metadataMap, node._component)) {
        mapPatternSlots.add(key);
      }
    }

    // --- Regular exposed props (marked as not hardcoded) ---
    // Include arrays too: exposed array props can collide across components.
    // (Map-pattern slots are still handled separately below.)
    for (const key of Object.keys(node)) {
      if (!key.startsWith("_hardcoded_")) continue;

      const originalPropName = key.replace("_hardcoded_", "");

      if (node[key]) continue; // hardcoded → skip

      // Skip slot props that are handled by the .map() pattern (collected below)
      if (mapPatternSlots.has(originalPropName)) continue;

      const renamedKey = node[`_renamed_${originalPropName}`] || originalPropName;

      const location: PropLocation = {
        nodeId: node._nodeId,
        nodePath: currentPath,
        originalPropName,
        exposedPropName: renamedKey,
      };

      addExposedPropLocation(renamedKey, location);
    }

    // --- Slots in page-building mode ---
    for (const key of Object.keys(node)) {
      if (!key.endsWith("_mode") || node[key as `_${string}_mode`] !== "prop") continue;

      const originalPropName = key.replace("_mode", "").substring(1);
      const renamedKey = node[`_renamed_${originalPropName}`] || originalPropName;

      const location: PropLocation = {
        nodeId: node._nodeId,
        nodePath: currentPath,
        originalPropName,
        exposedPropName: renamedKey,
      };

      addExposedPropLocation(renamedKey, location);
    }

    // --- Recurse into nested component arrays ---
    const activeSlots = Object.keys(node).filter(
      (k) => Array.isArray(node[k]) && !k.startsWith("_") && node[`_${k}_mode` as const] !== "prop"
    );

    for (const key of activeSlots) {
      const children = node[key] as BuilderNode[];
      const slotLabel = activeSlots.length > 1 ? ` [${key}]` : "";

      // If this slot uses the .map() pattern the array itself becomes an
      // exposed prop and individual props are scoped to each array item.
      if (shouldUseMapPattern(children, metadataMap, node._component)) {
        const renamedKey = node[`_renamed_${key}`] || key;

        const location: PropLocation = {
          nodeId: node._nodeId,
          nodePath: currentPath,
          originalPropName: key,
          exposedPropName: renamedKey,
        };

        addExposedPropLocation(renamedKey, location);

        // Validate collisions inside the map item schema (scoped to this slot).
        // Example: AccordionItem.title and an inner component title both renamed to "title".
        const templateChild = children[0];

        if (templateChild && typeof templateChild === "object" && templateChild._component) {
          const templatePath = `${currentPath}${slotLabel} > ${getComponentPath(templateChild._component)} #1`;
          const scopedLocations = collectScopedExposedProps(templateChild, templatePath);
          const scopedByName = new Map<string, PropLocation[]>();

          for (const scopedLoc of scopedLocations) {
            const scopedName = scopedLoc.exposedPropName;

            if (!scopedByName.has(scopedName)) {
              scopedByName.set(scopedName, []);
            }
            scopedByName.get(scopedName)?.push(scopedLoc);
          }

          scopedByName.forEach((locations, exposedName) => {
            // De-duplicate entries that refer to the same underlying prop on the same node.
            // This can happen when a slot prop is both exposed (`_hardcoded_... = false`)
            // and in page-building mode (`_..._mode = 'prop'`).
            const uniquePropInstances = new Set(
              locations.map((loc) => `${loc.nodeId}:${loc.originalPropName}`)
            );

            if (uniquePropInstances.size > 1) {
              scopedDuplicateProps.push({
                exposedName: `${exposedName} (within ${renamedKey} item schema)`,
                locations,
              });
            }
          });
        }
        // Don't recurse — props inside are scoped to array items
      } else {
        children.forEach((child, index) => {
          if (child && typeof child === "object" && child._component) {
            const childComponentName = getComponentPath(child._component);

            collectExposedProps(
              child,
              `${childComponentName} #${index + 1}`,
              `${currentPath}${slotLabel}`
            );
          }
        });
      }
    }
  }

  // Start collection from root components
  componentTree.forEach((node, index) => {
    if (node && typeof node === "object" && node._component) {
      const componentName = getComponentPath(node._component);

      collectExposedProps(node as BuilderNode, `${componentName} #${index + 1}`);
    }
  });

  // --- Find duplicates (same exposed name on different nodes) ---
  const duplicateProps: DuplicatePropError[] = [];

  exposedPropsMap.forEach((locations, exposedName) => {
    const uniqueProps = new Set(locations.map((loc) => `${loc.nodeId}:${loc.originalPropName}`));

    if (uniqueProps.size > 1) {
      duplicateProps.push({ exposedName, locations });
    }
  });

  duplicateProps.push(...scopedDuplicateProps);

  if (duplicateProps.length > 0) {
    debugLog("Found duplicate exposed props:", duplicateProps);
  }

  return {
    isValid: duplicateProps.length === 0,
    duplicateProps,
  };
}
