/**
 * Reusable component-model primitives shared by scripts that need to reason
 * about the Astro component library and its co-located CloudCannon YAML —
 * currently `scripts/cms/lint.mjs`, `scripts/docs/check.mjs`, and
 * `scripts/docs/catalog.mjs`.
 *
 * Component-key derivation itself is NOT reimplemented here — it is imported
 * from `src/components/utils/componentKey.mjs`, the single source of truth
 * shared with the render registry and the Visual Editor.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { glob } from "glob";
import * as yaml from "js-yaml";
import { componentKeyFromPath, pascalToKebab } from "../../src/components/utils/componentKey.mjs";

// Destructure parser: pull the prop names out of `const { ... } = Astro.props`.
// Handles renames (`class: className`), quoted keys (`'data-prop': x`), aliased
// with defaults (`useDefaultEditableBinding: _x = false`), plain-with-default
// (`size = "md"`), multi-line, nested-brace defaults (`imageElementAttributes = {}`),
// and the rest element (`...htmlAttributes`).

/**
 * @returns {{ props: Set<string>, hasRest: boolean } | null}
 *   props = the concrete property names the component reads; null if no
 *   `Astro.props` destructure was found (component takes no props).
 */
export function parseDestructure(source) {
  const marker = "= Astro.props";
  const markerIdx = source.indexOf(marker);

  if (markerIdx === -1) return null;

  // Walk back from the `}` before the marker to its matching `{`.
  const closeIdx = source.lastIndexOf("}", markerIdx);

  if (closeIdx === -1) return null;

  let depth = 0;
  let openIdx = -1;

  for (let i = closeIdx; i >= 0; i--) {
    const ch = source[i];

    if (ch === "}") depth += 1;
    else if (ch === "{") {
      depth -= 1;
      if (depth === 0) {
        openIdx = i;
        break;
      }
    }
  }
  if (openIdx === -1) return null;

  // Strip JS comments — destructures carry doc comments (`/** ... */`) whose
  // punctuation (backticks, `=`, `:`) would otherwise corrupt key extraction.
  const inner = source
    .slice(openIdx + 1, closeIdx)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
  const parts = splitTopLevel(inner);

  const props = new Set();
  let hasRest = false;

  for (const raw of parts) {
    const part = raw.trim();

    if (!part) continue;
    if (part.startsWith("...")) {
      hasRest = true;
      continue;
    }
    // Key is the text before the first top-level `:` (rename) or `=` (default).
    let key = part;
    const cut = firstTopLevelDelimiter(part);

    if (cut !== -1) key = part.slice(0, cut);
    key = key.trim().replace(/^['"]|['"]$/g, "");
    if (key) props.add(key);
  }

  return { props, hasRest };
}

/** Split a destructure body on top-level commas (ignoring nested brackets/strings). */
function splitTopLevel(text) {
  const out = [];
  let depth = 0;
  let quote = null;
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{" || ch === "[" || ch === "(") depth += 1;
    else if (ch === "}" || ch === "]" || ch === ")") depth -= 1;
    else if (ch === "," && depth === 0) {
      out.push(text.slice(start, i));
      start = i + 1;
    }
  }
  out.push(text.slice(start));
  return out;
}

/** Index of the first top-level `:` or `=` in a single destructure entry, or -1. */
function firstTopLevelDelimiter(part) {
  let depth = 0;
  let quote = null;

  for (let i = 0; i < part.length; i++) {
    const ch = part[i];

    if (quote) {
      if (ch === quote && part[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{" || ch === "[" || ch === "(") depth += 1;
    else if (ch === "}" || ch === "]" || ch === ")") depth -= 1;
    else if (depth === 0 && (ch === ":" || ch === "=")) return i;
  }
  return -1;
}

// Shared helpers

export function loadYaml(absPath) {
  return yaml.load(readFileSync(absPath, "utf8"));
}

/** Collect every value stored under a `_component` key, recursively. */
export function collectComponentRefs(node, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectComponentRefs(item, out);
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "_component" && typeof value === "string" && value) out.push(value);
      else collectComponentRefs(value, out);
    }
  }
  return out;
}

/** Extract the YAML frontmatter block from a .md/.mdx file, or null. */
export function frontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);

  if (!match) return null;
  try {
    return yaml.load(match[1]);
  } catch {
    return null;
  }
}

/** Is this .astro a component's own main file (kebab filename === dir name)? */
export function isMainComponentFile(astroAbsPath) {
  const dir = dirname(astroAbsPath);
  const base = astroAbsPath.slice(dir.length + 1).replace(/\.astro$/, "");

  return pascalToKebab(base) === dir.split("/").pop();
}

// Meta keys that appear at the top level of a `value:` block or an inputs file
// but are not component props. `_component` is special-cased where relevant.
export const NON_PROP_KEY = (key) => key.startsWith("_");

/**
 * Build an index of every component under `src/components/`: its registry
 * key, whether it's a directory's *main* component, its parsed destructure,
 * and the paths of its co-located CloudCannon YAML (if present).
 *
 * @param {string} root repo root (the directory containing `src/`).
 * @returns {Promise<{
 *   componentKeys: Set<string>,
 *   byKey: Map<string, {
 *     key: string,
 *     dirAbs: string,
 *     astroAbs: string,
 *     parsed: { props: Set<string>, hasRest: boolean } | null,
 *     isMain: boolean,
 *     structureValuePath: string | null,
 *     inputsPath: string | null,
 *   }>,
 * }>}
 */
export async function buildComponentIndex(root) {
  const componentsDir = join(root, "src", "components");
  const astroPaths = (await glob("**/*.astro", { cwd: componentsDir })).sort();

  const componentKeys = new Set();
  const byKey = new Map();

  for (const relToComponents of astroPaths) {
    const astroAbs = join(componentsDir, relToComponents);
    const key = componentKeyFromPath(relToComponents);
    const dirAbs = dirname(astroAbs);
    const slug = dirAbs.split("/").pop();
    const inputsAbs = join(dirAbs, `${slug}.cloudcannon.inputs.yml`);
    const structureValueAbs = join(dirAbs, `${slug}.cloudcannon.structure-value.yml`);

    componentKeys.add(key);
    byKey.set(key, {
      key,
      dirAbs,
      astroAbs,
      parsed: parseDestructure(readFileSync(astroAbs, "utf8")),
      isMain: isMainComponentFile(astroAbs),
      structureValuePath: existsSync(structureValueAbs) ? structureValueAbs : null,
      inputsPath: existsSync(inputsAbs) ? inputsAbs : null,
    });
  }

  return { componentKeys, byKey };
}

/**
 * The full set of prop-shaped keys a component's editor config is allowed to
 * use: its destructured `Astro.props` names, its `inputs.yml` top-level keys
 * (dotted keys collapsed to their first segment, mirroring CloudCannon's own
 * nested-input addressing), and its `structure-value.yml` `value:` keys.
 *
 * @param {{
 *   parsed: { props: Set<string>, hasRest: boolean } | null,
 *   inputsPath: string | null,
 *   structureValuePath: string | null,
 * }} entry a `byKey` entry from {@link buildComponentIndex}.
 * @returns {{ keys: Set<string>, hasRest: boolean }}
 */
export function allowedPropKeys(entry) {
  const keys = new Set();
  let hasRest = false;

  if (entry.parsed) {
    for (const prop of entry.parsed.props) keys.add(prop);
    hasRest = entry.parsed.hasRest;
  }

  if (entry.inputsPath) {
    const inputs = loadYaml(entry.inputsPath) || {};

    for (const key of Object.keys(inputs)) {
      if (NON_PROP_KEY(key)) continue;
      keys.add(key.split(".")[0]);
    }
  }

  if (entry.structureValuePath) {
    const value = (loadYaml(entry.structureValuePath) || {}).value || {};

    for (const key of Object.keys(value)) {
      if (key === "_component" || NON_PROP_KEY(key)) continue;
      keys.add(key);
    }
  }

  return { keys, hasRest };
}
