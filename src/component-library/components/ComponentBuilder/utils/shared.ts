/**
 * Shared Utilities
 * Common types and helper functions used across multiple ComponentBuilder modules.
 * Centralised here to avoid duplication between exportGenerator and validation.
 */

import type { ComponentMetadata, ComponentNode } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Extended component node that includes internal builder metadata flags. */
export interface BuilderNode extends ComponentNode {
  [key: `_hardcoded_${string}`]: boolean;
  [key: `_renamed_${string}`]: string;
  [key: `_${string}_mode`]: "components" | "prop";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * True when the slot array has at least one item and every item has the same _component.
 * Used to force-expose the slot prop when e.g. every accordion item contains a Button Group.
 */
export function slotHasSameComponentInEveryItem(
  node: ComponentNode,
  slotPropName: string
): boolean {
  const arr = node[slotPropName];

  if (!Array.isArray(arr) || arr.length === 0) return false;
  const first = arr[0] as ComponentNode | undefined;
  const componentPath = first?._component;

  if (typeof componentPath !== "string") return false;
  return (arr as ComponentNode[]).every((item) => item && item._component === componentPath);
}

/**
 * Check whether a node has at least one exposed (non-hardcoded) prop.
 *
 * A prop is "exposed" when its `_hardcoded_<name>` flag is `false`, meaning
 * it will be surfaced as a configurable prop in the exported component.
 */
export function hasOwnExposedProps(node: BuilderNode): boolean {
  if (!node || typeof node !== "object") return false;

  return Object.keys(node).some((key) => key.startsWith("_hardcoded_") && node[key] === false);
}

/**
 * Determine whether a slot's children should trigger the `.map()` export pattern.
 *
 * The `.map()` pattern is used when:
 * 1. The parent component defines a `childComponent` wrapper in its metadata
 *    (e.g. Carousel → CarouselSlide).
 * 2. At least one child (or its immediate slot grandchildren) has exposed props.
 *
 * @param children          - The child nodes inside the slot.
 * @param metadataMap       - Metadata map for component lookup.
 * @param parentComponentPath - The `_component` path of the parent node.
 * @returns `true` if the `.map()` pattern should be used for this slot.
 */
export function shouldUseMapPattern(
  children: BuilderNode[],
  metadataMap: Record<string, ComponentMetadata>,
  parentComponentPath: string
): boolean {
  const parentMetadata = metadataMap[parentComponentPath];

  if (!parentMetadata?.childComponent) return false;

  return children.some((child) => {
    if (!child || typeof child !== "object") return false;

    // Level 0: direct child has exposed props
    if (hasOwnExposedProps(child)) return true;

    // Level 1: direct child's default-slot children have exposed props
    const childMetadata = metadataMap[child._component];
    const childFallbackProp = childMetadata?.fallbackFor || "contentSections";
    const grandchildren = child[childFallbackProp] as BuilderNode[] | undefined;

    if (!grandchildren || !Array.isArray(grandchildren)) return false;

    return grandchildren.some((gc) => gc && typeof gc === "object" && hasOwnExposedProps(gc));
  });
}
