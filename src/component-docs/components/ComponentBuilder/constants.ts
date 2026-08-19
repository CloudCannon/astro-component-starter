export const CATEGORY_ORDER = ["builders", "wrappers", "core-elements", "forms"] as const;

/** The base container for all builder compositions. */
export const ROOT_COMPONENT_PATH = "page-sections/builders/custom-section";

/**
 * Main building-block keys that exist on disk but must not appear in the
 * builder picker. Inventory tests fail if a key is added here without a
 * reason, or if the directory is removed and this entry is left behind.
 */
export const BUILDER_EXCLUDED: Record<string, string> = {
  "building-blocks/core-elements/pagination":
    "Listing chrome for blog/collection templates — not a nestable content block.",
};

export function isBuilderExcluded(componentPath: string): boolean {
  return Object.prototype.hasOwnProperty.call(BUILDER_EXCLUDED, componentPath);
}

/**
 * Props that should be exposed by default (not hardcoded) for specific components
 * Maps component name to array of prop names that should default to exposed
 */
export const DEFAULT_EXPOSED_PROPS: Record<string, string[]> = {
  button: ["text"],
  counter: ["number"],
  embed: ["html"],
  heading: ["text"],
  icon: ["name"],
  image: ["source"],
  "list-item": ["text"],
  "simple-text": ["text"],
  testimonial: ["text", "authorName", "authorDescription"],
  text: ["text"],
  video: ["type", "videoId", "title", "source", "thumbnail"],
} as const;
