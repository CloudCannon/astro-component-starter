/**
 * ComponentBuilder Type Definitions
 *
 * Centralised types shared across all ComponentBuilder modules.
 * Import from `'../types'` in sibling modules.
 *
 * @module types
 */

// ---------------------------------------------------------------------------
// Component discovery & structure types
// ---------------------------------------------------------------------------

/**
 * A slot definition describes a property on a component that can contain
 * nested child components (e.g. `contentSections`, `slides`).
 */
export interface SlotDefinition {
  /** Property name on the parent component (e.g. `"contentSections"`). */
  propName: string;
  /** Human-readable label shown in the builder UI. */
  label: string;
  /** Component paths that are allowed to be inserted into this slot. */
  allowedComponents: string[];
  /** CloudCannon structure name that governs allowed children. */
  structureName?: string;
  /** Whether this slot can be toggled to "open for page building" mode. */
  allowAsProp?: boolean;
  /** Input type when in page-building mode (e.g. `"text"`, `"textarea"`). */
  propType?: string;
  /** Label shown when the slot is in page-building mode. */
  propLabel?: string;
  /** Additional input configuration for page-building mode. */
  propConfig?: Record<string, unknown>;
  /** Astro named slot (e.g. `"first"`, `"second"`). `"default"` = the unnamed slot. */
  astroSlotName?: string;
  /** True for slots backed by a childComponent (e.g. Accordion→AccordionItem). Only one template child is allowed; editors add/remove items when building pages. */
  isRepeatable?: boolean;
}

/**
 * Metadata about a discovered component — produced by the server-side
 * component discovery scan and serialised to the client.
 */
export interface ComponentInfo {
  /** Unique path identifier, e.g. `"building-blocks/core-elements/button"`. */
  path: string;
  /** Actual Astro component file name (e.g. `"Button.astro"` or `"count.astro"`). */
  fileName?: string;
  /** Category key (e.g. `"wrappers"`, `"core-elements"`). */
  category: string;
  /** Kebab-case name derived from the directory (e.g. `"button"`). */
  name: string;
  /** Human-readable display name (e.g. `"Button"`). */
  displayName: string;
  /** Map of editable input configurations from CloudCannon YAML. */
  inputs: Record<string, InputConfig>;
  /** Parsed structure-value YAML (or `null` if absent). */
  structureValue: StructureValue | null;
  /** Whether the component supports nested children (slots). */
  supportsSlots: boolean;
  /** If set, the fallback slot property name (legacy). */
  fallbackFor?: string;
  /** Short description shown in the component picker. */
  description?: string;
  /** Material icon name for the component. */
  icon?: string;
  /** Slot definitions for components that accept children. */
  slots?: SlotDefinition[];
  /**
   * `true` for sub-components (e.g. `CarouselSlide`) that should not
   * appear directly in the component picker.
   */
  isVirtual?: boolean;
}

/** Input configuration parsed from a CloudCannon `.inputs.yml` file. */
export interface InputConfig {
  type?: string;
  label?: string;
  comment?: string;
  default?: unknown;
  options?: {
    values?: string | Array<string | { id: string; name: string }>;
    /** Original `_select_data.*` reference used for export output. */
    selectDataRef?: string;
    structures?: string;
    allow_as_prop?: boolean;
    prop_type?: string;
    prop_label?: string;
    prop_config?: Record<string, unknown>;
  };
}

/** Structure value parsed from a `.structure-value.yml` file. */
export interface StructureValue {
  label?: string;
  description?: string;
  icon?: string;
  value?: Record<string, unknown>;
  _structures?: Record<string, StructureDefinition>;
}

/** Definition of a CloudCannon structure (nesting rules). */
export interface StructureDefinition {
  values_from_glob?: string[];
  values?: Array<{
    _inputs?: Record<string, InputConfig>;
    [key: string]: unknown;
  }>;
}

// ---------------------------------------------------------------------------
// Component tree types (runtime)
// ---------------------------------------------------------------------------

/**
 * A node in the component tree — represents a single component instance
 * in the builder sandbox. Additional properties are stored as dynamic keys.
 */
export interface ComponentNode {
  /** Unique ID assigned by the builder (e.g. `"component-3"`). */
  _nodeId: string;
  /** Component path that identifies which component this is. */
  _component: string;
  /** `true` only for the outermost root container. */
  _isRootComponent?: boolean;
  /** Dynamic props, slots, and internal flags. */
  [key: string]: unknown;
}

/** Information about an in-progress drag operation. */
export interface DragSource {
  type: "palette" | "reorder";
  componentPath?: string;
  componentName?: string;
  nodeId?: string;
  fromParentId?: string | null;
  fromSlot?: string | null;
}

/** Describes where a node lives within the component tree. */
export interface NodeLocation {
  /** Index within the parent's slot array. */
  index: number;
  /** Parent node ID (or `null` if at root level). */
  parentId: string | null;
  /** Slot property name on the parent (or `null` if at root level). */
  slotName: string | null;
}

// ---------------------------------------------------------------------------
// Metadata & configuration types
// ---------------------------------------------------------------------------

/** Additional component metadata not stored in YAML. */
export interface ComponentMetadata {
  supportsSlots?: boolean;
  fallbackFor?: string;
  childComponent?: {
    name: string;
    props?: string[];
  };
}

/** Nesting rules: maps a structure name to an array of allowed component paths. */
export interface NestingRules {
  [structureName: string]: string[];
}

/** All data passed from server to the client-side builder at initialisation. */
export interface BuilderData {
  components: ComponentInfo[];
  componentsByCategory: Record<string, ComponentInfo[]>;
  metadataMap: Record<string, ComponentMetadata>;
  nestedBlockProperties: string[];
  nestingRules: NestingRules;
  pageSectionCategories: string[];
}

/** Configuration chosen by the user in the export modal. */
export interface ExportConfig {
  componentType: "page-section" | "building-block";
  category: string;
  componentName: string;
  componentPath: string;
}
