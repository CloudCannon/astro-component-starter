/**
 * Preview-render helper: many structure-value defaults ship with empty arrays
 * (`features: []`, `faqItems: []`, …) because editors add their own items.
 * A skeleton preview of an empty grid is useless, so before rendering we fill
 * each empty array with a few copies of its structure's first default value.
 *
 * Also builds the flat structure registry so nested container arrays (a grid
 * item's content, a card inside it, …) resolve during recursion. These loaders
 * live here (an imported module) rather than in the page's frontmatter because
 * Astro runs `getStaticPaths` in isolation — only imported bindings are in
 * scope, not sibling frontmatter functions.
 *
 * The loaders use Node built-ins and are only ever called from
 * `getStaticPaths` (build time, `COMPONENT_PREVIEWS=true`).
 */
import { globSync } from "glob";
import * as yaml from "js-yaml";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface InputDef {
  options?: {
    structures?: string;
  };
  [key: string]: unknown;
}

interface StructureTemplate {
  value?: Record<string, unknown>;
  _inputs?: Record<string, InputDef>;
  [key: string]: unknown;
}

export interface StructureDefs {
  [name: string]: { values?: StructureTemplate[] } | undefined;
}

// Items at the top level get a fuller count; nested containers get fewer so a
// deeply nested tree (card-in-grid-in-split) doesn't explode combinatorially.
export const SEED_COUNT = 3;
const SEED_COUNT_NESTED = 2;

// Structure defaults often leave label-like fields blank (`name: ""` / `null`)
// for the editor to fill in. The skeleton derives text-bar widths from rendered
// text, so blank labels would render nothing — give them placeholder copy.
const TEXT_FIELD_KEYS =
  /^(name|title|text|label|heading|question|answer|subtext|description|eyebrow|caption|placeholder|triggerText)$/;

// Longer, varied copy so seeded items don't all collapse to the same bar width.
const PLACEHOLDER_BY_KEY: Record<string, string> = {
  heading: "Section heading placeholder",
  title: "Item title placeholder",
  question: "A frequently asked question goes here?",
  answer: "A helpful answer to the question goes here for the preview.",
  subtext: "Supporting subtext placeholder for the preview render.",
  description: "A short description placeholder used only for the preview.",
  placeholder: "Placeholder…",
};

function placeholderFor(key: string): string {
  return PLACEHOLDER_BY_KEY[key] ?? "Placeholder text";
}

function fillEmptyTextFields(item: Record<string, unknown>): void {
  for (const [key, entry] of Object.entries(item)) {
    if ((entry === "" || entry === null) && TEXT_FIELD_KEYS.test(key)) {
      item[key] = placeholderFor(key);
    }
  }
}

export function seedEmptyArrays(
  value: Record<string, unknown>,
  inputs: Record<string, InputDef>,
  structures: StructureDefs,
  prefix = "",
  depth = 0
): void {
  if (depth > 4) return;

  // Fill this level's own blank label-like fields (form placeholders, headings,
  // etc.) so leaf components render visible content, not just empty boxes.
  fillEmptyTextFields(value);

  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(entry)) {
      if (entry.length) continue;

      const ref = inputs[path]?.options?.structures;
      const structureName = typeof ref === "string" ? ref.replace(/^_structures\./, "") : "";
      const template = structures[structureName]?.values?.[0];
      const templateValue = template?.value;

      if (!templateValue || typeof templateValue !== "object") continue;

      const count = depth === 0 ? SEED_COUNT : SEED_COUNT_NESTED;
      const items = Array.from({ length: count }, () => {
        const item = structuredClone(templateValue);

        fillEmptyTextFields(item);
        return item;
      });

      value[key] = items;

      // Seeded items can themselves be containers with empty arrays (a card in a
      // grid in a split) — resolve those recursively against the item
      // structure's own inputs, plus every structure known globally.
      for (const item of items) {
        seedEmptyArrays(item, { ...inputs, ...template._inputs }, structures, "", depth + 1);
      }
    } else if (entry && typeof entry === "object") {
      seedEmptyArrays(entry as Record<string, unknown>, inputs, structures, path, depth + 1);
    }
  }
}

// Structure registry loading (build-time, Node only)

export interface StructureValueDoc {
  value?: Record<string, unknown> & { _component?: string };
  _inputs?: Record<string, InputDef>;
  _inputs_from_glob?: string[];
  _structures?: StructureDefs;
}

interface StructureDefRaw {
  values?: StructureTemplate[];
  values_from_glob?: string[];
}

/**
 * Resolve a structure-value doc's full input map (inline `_inputs` merged with
 * everything pulled in via `_inputs_from_glob`), plus any `_structures` those
 * inputs files declare.
 */
export function resolveDocInputs(
  file: string,
  doc: StructureValueDoc
): { inputs: Record<string, InputDef>; structures: StructureDefs } {
  const inputs: Record<string, InputDef> = { ...doc._inputs };
  const structures: StructureDefs = { ...doc._structures };

  for (const inputGlob of doc._inputs_from_glob ?? []) {
    const inputPath = inputGlob.startsWith("/")
      ? inputGlob.slice(1)
      : join(dirname(file), inputGlob);

    if (!existsSync(inputPath)) continue;

    const inputDoc = yaml.load(readFileSync(inputPath, "utf8")) as Record<string, unknown> | null;

    for (const [key, def] of Object.entries(inputDoc ?? {})) {
      if (key === "_structures") {
        Object.assign(structures, def as StructureDefs);
      } else if (!(key in inputs)) {
        inputs[key] = def as InputDef;
      }
    }
  }

  return { inputs, structures };
}

let cachedGlobalStructures: StructureDefs | null = null;

/**
 * Build one flat registry of every structure the page builder knows about, so
 * nested container arrays (a grid item's `contentSections`, a card inside that,
 * …) can resolve their default item during recursive seeding. Two sources:
 *   1. Every component's own inline `_structures` (select options, grid items,
 *      accordion items, …), keyed by their globally-unique names.
 *   2. `.cloudcannon/structures/*.cloudcannon.structures.yml` — some inline
 *      (`values:`), most assembled from component files (`values_from_glob:`).
 * Each glob-resolved value carries its source component's `_inputs` so seeding
 * can descend into it. Cached — runs once per preview build.
 */
export function loadGlobalStructures(): StructureDefs {
  if (cachedGlobalStructures) return cachedGlobalStructures;

  const registry: StructureDefs = {};

  // 1. Component inline structures first (grid items, select options, …).
  for (const file of globSync("src/components/**/*.cloudcannon.structure-value.yml").sort()) {
    const doc = yaml.load(readFileSync(file, "utf8")) as StructureValueDoc | null;

    if (!doc) continue;

    const { structures } = resolveDocInputs(file, doc);

    for (const [name, def] of Object.entries(structures)) {
      if (def && !(name in registry)) registry[name] = def;
    }
  }

  // 2. Global structure files (may add named structures assembled from globs).
  for (const file of globSync(".cloudcannon/structures/*.cloudcannon.structures.yml").sort()) {
    const doc = yaml.load(readFileSync(file, "utf8")) as Record<string, StructureDefRaw> | null;

    for (const [name, def] of Object.entries(doc ?? {})) {
      if (Array.isArray(def?.values)) {
        registry[name] = { values: def.values };
        continue;
      }

      if (!Array.isArray(def?.values_from_glob)) continue;

      const includes: string[] = [];
      const ignores: string[] = [];

      for (const pattern of def.values_from_glob) {
        if (pattern.startsWith("!")) ignores.push(pattern.slice(1).replace(/^\//, ""));
        else includes.push(pattern.replace(/^\//, ""));
      }

      // Expand each include in declared order (explicit files before wildcards)
      // so the first resolved value is the intended default item.
      const matched: string[] = [];

      for (const include of includes) {
        for (const match of globSync(include, { ignore: ignores }).sort()) {
          if (!matched.includes(match)) matched.push(match);
        }
      }

      const values: StructureTemplate[] = [];

      for (const match of matched) {
        const valueDoc = yaml.load(readFileSync(match, "utf8")) as StructureValueDoc | null;

        if (!valueDoc?.value) continue;

        const { inputs } = resolveDocInputs(match, valueDoc);

        values.push({ value: valueDoc.value, _inputs: inputs });
      }

      registry[name] = { values };
    }
  }

  cachedGlobalStructures = registry;
  return registry;
}
