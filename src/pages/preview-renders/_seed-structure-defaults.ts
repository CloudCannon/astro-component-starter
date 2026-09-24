// These loaders must live in an imported module: Astro runs `getStaticPaths` in
// isolation, so sibling frontmatter functions are out of scope.
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

// Nested containers get fewer items so deep trees don't explode combinatorially.
export const SEED_COUNT = 3;
const SEED_COUNT_NESTED = 2;

// Skeleton bar widths come from rendered text, so blank labels would render nothing.
const TEXT_FIELD_KEYS =
  /^(name|title|text|label|heading|question|answer|subtext|description|eyebrow|caption|placeholder|triggerText)$/;

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

      for (const item of items) {
        seedEmptyArrays(item, { ...inputs, ...template._inputs }, structures, "", depth + 1);
      }
    } else if (entry && typeof entry === "object") {
      seedEmptyArrays(entry as Record<string, unknown>, inputs, structures, path, depth + 1);
    }
  }
}

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

/** Flat registry of every structure, so nested container arrays resolve their default item. */
export function loadGlobalStructures(): StructureDefs {
  if (cachedGlobalStructures) return cachedGlobalStructures;

  const registry: StructureDefs = {};

  for (const file of globSync("src/components/**/*.cloudcannon.structure-value.yml").sort()) {
    const doc = yaml.load(readFileSync(file, "utf8")) as StructureValueDoc | null;

    if (!doc) continue;

    const { structures } = resolveDocInputs(file, doc);

    for (const [name, def] of Object.entries(structures)) {
      if (def && !(name in registry)) registry[name] = def;
    }
  }

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

      // Declared order matters: the first resolved value becomes the default item.
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
