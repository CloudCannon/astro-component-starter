/**
 * ComponentBuilder Constants
 *
 * Shared constants, lookup tables, and configuration values used throughout
 * the ComponentBuilder modules. Centralising these here makes it easy to
 * tweak behaviour and avoids magic strings scattered across the codebase.
 *
 * @module constants
 */

// ---------------------------------------------------------------------------
// Debug
// ---------------------------------------------------------------------------

/** Enable debug logging (set to `true` during development). */
const DEBUG = false;

/** Log helper that respects the {@link DEBUG} flag. */
export function debugLog(...args: unknown[]): void {
  if (DEBUG) {
    console.log("[ComponentBuilder]", ...args);
  }
}

/** Category display order */
export const CATEGORY_ORDER = ["builders", "wrappers", "core-elements", "forms"] as const;

/** Root component path - the base container for all builder compositions */
export const ROOT_COMPONENT_PATH = "page-sections/builders/custom-section";

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
  video: ["type", "id", "title", "source", "thumbnail"],
} as const;
