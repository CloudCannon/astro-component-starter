/**
 * Lint the CloudCannon CMS layer against the Astro components it configures.
 *
 *   node scripts/cms/lint.mjs
 *
 * Catches the "edit a prop, silently break the editor" class of drift that
 * nothing else validates — Astro props and their co-located `*.cloudcannon.*.yml`
 * are maintained by hand in parallel.
 *
 * Output is one `ok`/`FAIL`/`WARN` line per thing checked. FAILs exit 1;
 * WARNs are printed but never fail the
 * build (reserved for checks that can't be made reliable without false
 * positives — each is commented with why).
 *
 * Dependencies: only js-yaml (v5: `yaml.load`) + glob, already in package.json.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { glob } from "glob";
import * as yaml from "js-yaml";
import { componentKeyFromPath, pascalToKebab } from "../../src/components/utils/componentKey.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const rel = (p) => relative(root, p);

const fails = [];
const warns = [];
const oks = [];
const fail = (file, reason) => fails.push({ file, reason });
const warn = (file, reason) => warns.push({ file, reason });
const ok = (label) => oks.push(label);

// ---------------------------------------------------------------------------
// Component key derivation (`componentKeyFromPath` / `pascalToKebab`) is now
// imported from the shared src/components/utils/componentKey.mjs — the single
// source of truth also used by renderBlock.astro and live-editing.js, so the
// linter's `_component` keys can no longer drift from the render/editor registries.
// ---------------------------------------------------------------------------

/** Is this .astro a component's own main file (kebab filename === dir name)? */
function isMainComponentFile(astroAbsPath) {
  const dir = dirname(astroAbsPath);
  const base = astroAbsPath.slice(dir.length + 1).replace(/\.astro$/, "");

  return pascalToKebab(base) === dir.split("/").pop();
}

// ---------------------------------------------------------------------------
// Destructure parser: pull the prop names out of `const { ... } = Astro.props`.
// Handles renames (`class: className`), quoted keys (`'data-prop': x`), aliased
// with defaults (`useDefaultEditableBinding: _x = false`), plain-with-default
// (`size = "md"`), multi-line, nested-brace defaults (`imageElementAttributes = {}`),
// and the rest element (`...htmlAttributes`).
// ---------------------------------------------------------------------------

/**
 * @returns {{ props: Set<string>, hasRest: boolean } | null}
 *   props = the concrete property names the component reads; null if no
 *   `Astro.props` destructure was found (component takes no props).
 */
function parseDestructure(source) {
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

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function loadYaml(absPath) {
  return yaml.load(readFileSync(absPath, "utf8"));
}

/** Collect every value stored under a `_component` key, recursively. */
function collectComponentRefs(node, out = []) {
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
function frontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);

  if (!match) return null;
  try {
    return yaml.load(match[1]);
  } catch {
    return null;
  }
}

// Meta keys that appear at the top level of a `value:` block or an inputs file
// but are not component props. `_component` is special-cased where relevant.
const NON_PROP_KEY = (key) => key.startsWith("_");

// Known "dead input" drift: editor fields the component does NOT read (it
// hardcodes the value, or the prop was never implemented). Adding an entry here
// downgrades that key from FAIL to WARN (still printed every run) — use it only
// as a temporary bridge while a fix lands, then delete the input or wire the
// prop and remove the entry. Keyed by component `_component` key → dead prop
// names. Any stray key NOT listed here FAILs, so renames are caught.
const KNOWN_DEAD_INPUTS = {};

// ---------------------------------------------------------------------------
// Build the world: every component .astro, its key, its parsed destructure.
// ---------------------------------------------------------------------------

const componentsDir = join(root, "src", "components");
const astroPaths = (await glob("**/*.astro", { cwd: componentsDir })).sort();

/** key -> { astroAbs, props, hasRest } for every registered component. */
const componentKeys = new Set();
/** dir (abs) -> { astroAbs, props, hasRest } for the *main* component in that dir. */
const mainByDir = new Map();

for (const relToComponents of astroPaths) {
  const astroAbs = join(componentsDir, relToComponents);

  componentKeys.add(componentKeyFromPath(relToComponents));

  if (isMainComponentFile(astroAbs)) {
    const parsed = parseDestructure(readFileSync(astroAbs, "utf8"));

    mainByDir.set(dirname(astroAbs), { astroAbs, parsed });
  }
}

// ---------------------------------------------------------------------------
// Check 1 — Prop drift (FAIL): every top-level key in a co-located inputs.yml,
// and every `value:` key in a structure-value.yml, must be a prop the component
// actually destructures. This is the "renamed prop silently breaks the editor"
// killer check. FAIL-level: parsing is exact and false positives were tuned out.
// ---------------------------------------------------------------------------

for (const [dir, { astroAbs, parsed }] of mainByDir) {
  if (!parsed) continue; // component reads no props — nothing to drift against.
  const destructured = parsed.props;
  const componentKey = componentKeyFromPath(relative(componentsDir, astroAbs));
  const knownDead = new Set(KNOWN_DEAD_INPUTS[componentKey] || []);

  // Split stray keys: documented dead inputs → WARN, everything else → FAIL.
  const report = (yamlAbs, label, strayKeys) => {
    const stray = [...new Set(strayKeys)];
    const dead = stray.filter((k) => knownDead.has(k));
    const broken = stray.filter((k) => !knownDead.has(k));

    if (broken.length)
      fail(rel(yamlAbs), `${label} not destructured in ${rel(astroAbs)}: ${broken.join(", ")}`);
    if (dead.length)
      warn(rel(yamlAbs), `known dead input(s), not read by ${rel(astroAbs)}: ${dead.join(", ")}`);
    if (!broken.length && !dead.length) ok(`prop drift  ${rel(yamlAbs)}`);
  };

  const inputsAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.inputs.yml`);

  if (existsSync(inputsAbs)) {
    const inputs = loadYaml(inputsAbs) || {};
    const stray = Object.keys(inputs)
      .filter((k) => !NON_PROP_KEY(k))
      // CloudCannon addresses nested inputs with dotted keys (`background.type`);
      // the actual prop is the first segment (`background`).
      .map((k) => k.split(".")[0])
      .filter((k) => !destructured.has(k));

    report(inputsAbs, "input key(s)", stray);
  }

  const valueAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.structure-value.yml`);

  if (existsSync(valueAbs)) {
    const value = (loadYaml(valueAbs) || {}).value || {};
    const stray = Object.keys(value)
      // `_component` is not a prop in the drift sense (skip), and skip other meta.
      .filter((k) => k !== "_component" && !NON_PROP_KEY(k))
      .filter((k) => !destructured.has(k));

    report(valueAbs, "default value key(s)", stray);
  }
}

// ---------------------------------------------------------------------------
// Check 2 — Missing structure-value (FAIL): every *main* component .astro under
// building-blocks/ and page-sections/ must have a sibling structure-value.yml.
// Rule for "main": kebab(filename) === parent dir name. Child components
// (FeatureItem, AccordionItem, SelectOption, ...) are referenced only via their
// parent's structures and legitimately have none — the rule expresses this with
// no hardcoded exception list. Navigation/ and utils/ are out of scope (they are
// wired as data panels / internal helpers, not page-builder blocks).
// ---------------------------------------------------------------------------

for (const relToComponents of astroPaths) {
  const scoped =
    relToComponents.startsWith("building-blocks/") || relToComponents.startsWith("page-sections/");

  if (!scoped) continue;
  const astroAbs = join(componentsDir, relToComponents);

  if (!isMainComponentFile(astroAbs)) continue; // child component — no own structure.

  const dir = dirname(astroAbs);
  const valueAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.structure-value.yml`);

  if (existsSync(valueAbs)) ok(`has structure ${rel(astroAbs)}`);
  else fail(rel(astroAbs), "main component has no sibling *.cloudcannon.structure-value.yml");
}

// ---------------------------------------------------------------------------
// Check 3 — Orphaned YAML (FAIL): every *.cloudcannon.*.yml under src/components
// must sit beside a matching .astro (a sibling whose kebab filename equals the
// YAML's kebab prefix). Catches YAML left behind after a rename/delete.
// ---------------------------------------------------------------------------

const yamlPaths = (await glob("**/*.cloudcannon.*.yml", { cwd: componentsDir })).sort();

for (const relYaml of yamlPaths) {
  const yamlAbs = join(componentsDir, relYaml);
  const prefix = relYaml.split("/").pop().split(".cloudcannon.")[0];
  const dir = dirname(yamlAbs);
  const siblingMatch = readdirSync(dir)
    .filter((f) => f.endsWith(".astro"))
    .some((f) => pascalToKebab(f.replace(/\.astro$/, "")) === prefix);

  if (siblingMatch) ok(`co-located  ${rel(yamlAbs)}`);
  else fail(rel(yamlAbs), `no sibling .astro whose kebab name is "${prefix}"`);
}

// ---------------------------------------------------------------------------
// Check 4 — `_component` resolution (FAIL): every `_component` value found in
// structure YAML (co-located + .cloudcannon/structures) and in content
// frontmatter must resolve to a real component key. All sources are parsed as
// YAML, so this is reliable → FAIL-level. Content *bodies* (MDX JSX) are checked
// separately at WARN-level below (regex, not a parser).
// ---------------------------------------------------------------------------

const refSources = [];

for (const relYaml of yamlPaths.filter((p) => p.endsWith(".structure-value.yml"))) {
  const abs = join(componentsDir, relYaml);

  refSources.push([abs, collectComponentRefs(loadYaml(abs))]);
}
for (const abs of (await glob(".cloudcannon/structures/*.yml", { cwd: root })).map((p) =>
  join(root, p)
)) {
  refSources.push([abs, collectComponentRefs(loadYaml(abs))]);
}
const contentFiles = (await glob("src/content/**/*.{md,mdx}", { cwd: root })).map((p) =>
  join(root, p)
);

for (const abs of contentFiles) {
  const fm = frontmatter(readFileSync(abs, "utf8"));

  if (fm) refSources.push([abs, collectComponentRefs(fm)]);
}

for (const [abs, refs] of refSources) {
  const broken = [...new Set(refs)].filter((r) => !componentKeys.has(r));

  if (!refs.length) continue;
  if (broken.length) fail(rel(abs), `unresolved _component: ${broken.join(", ")}`);
  else ok(`refs ok     ${rel(abs)}`);
}

// WARN: MDX bodies reference components inside JSX (`_component: "..."`) which no
// YAML parser sees. Regex is approximate (hence WARN, not FAIL), but flags
// genuinely dead refs in prose examples.
for (const abs of contentFiles) {
  const source = readFileSync(abs, "utf8");
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  const bodyRefs = [...body.matchAll(/_component:\s*["']([\w/-]+)["']/g)].map((m) => m[1]);
  const broken = [...new Set(bodyRefs)].filter((r) => !componentKeys.has(r));

  if (broken.length)
    warn(rel(abs), `unresolved _component in body (MDX/JSX): ${broken.join(", ")}`);
}

// ---------------------------------------------------------------------------
// Check 5 — Structures registration: literal (non-glob) paths listed in a
// `*_from_glob` block must exist on disk. Positive entries missing → FAIL (a
// structure points at a file that isn't there). Negation (`!`) entries missing,
// and wildcard globs matching zero files → WARN: a dangling `!exclude` is a
// harmless no-op in CloudCannon but signals stale config, and an empty positive
// glob is usually — but not always — intentional.
// ---------------------------------------------------------------------------

const structureFiles = (await glob(".cloudcannon/structures/*.yml", { cwd: root })).map((p) =>
  join(root, p)
);

for (const abs of structureFiles) {
  const doc = loadYaml(abs) || {};
  const entries = [];
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        if (/_from_glob$/.test(key) && Array.isArray(value)) entries.push(...value);
        else walk(value);
      }
    }
  };

  walk(doc);

  let problems = 0;

  for (const entryRaw of entries) {
    if (typeof entryRaw !== "string") continue;
    const negation = entryRaw.startsWith("!");
    const pattern = (negation ? entryRaw.slice(1) : entryRaw).replace(/^\//, "");
    const isGlob = /[*?[\]{}]/.test(pattern);

    if (isGlob) {
      const matches = await glob(pattern, { cwd: root });

      if (!matches.length)
        warn(rel(abs), `${negation ? "exclusion " : ""}glob matches nothing: ${entryRaw}`);
    } else if (!existsSync(join(root, pattern))) {
      if (negation) warn(rel(abs), `excludes a non-existent file: ${entryRaw}`);
      else {
        fail(rel(abs), `lists a non-existent file: ${entryRaw}`);
        problems += 1;
      }
    }
  }
  if (!problems) ok(`structures  ${rel(abs)}`);
}

// ---------------------------------------------------------------------------
// Check 6 — Unseeded input (FAIL): every *visible* key in a co-located
// inputs.yml must also appear in the sibling structure-value.yml's `value:`.
// CloudCannon builds a newly inserted block from `value:` alone, so an input
// with no seeded key simply never renders a field for that block — the input
// looks configured but is unreachable in the editor.
//
// Two exemptions, both deliberate:
//   - `hidden: true` inputs are dev-set props (Image's `sizes`/`widths`), where
//     the component's own default is the intended value and seeding it into
//     every block would just duplicate that default into content.
//   - `hidden: "<expression>"` inputs are conditionally shown; their parent key
//     is what needs seeding, and dotted keys resolve through it.
// ---------------------------------------------------------------------------

const hasPath = (obj, path) => {
  let cursor = obj;

  for (const part of path.split(".")) {
    if (cursor == null || typeof cursor !== "object" || !(part in cursor)) return false;
    cursor = cursor[part];
  }
  return true;
};

for (const [dir] of mainByDir) {
  const slug = dir.split("/").pop();
  const inputsAbs = join(dir, `${slug}.cloudcannon.inputs.yml`);
  const valueAbs = join(dir, `${slug}.cloudcannon.structure-value.yml`);

  if (!existsSync(inputsAbs) || !existsSync(valueAbs)) continue;

  const value = (loadYaml(valueAbs) || {}).value || {};
  const unseeded = Object.entries(loadYaml(inputsAbs) || {})
    .filter(([key, cfg]) => !NON_PROP_KEY(key) && cfg?.hidden !== true && !hasPath(value, key))
    .map(([key]) => key);

  if (unseeded.length) {
    fail(
      rel(inputsAbs),
      `input(s) with no seeded default in ${rel(valueAbs)} — the field will not appear on a newly inserted block: ${unseeded.join(", ")}`
    );
  } else {
    ok(`seeded     ${rel(inputsAbs)}`);
  }
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------

for (const label of oks) console.log(`ok     ${label}`);
for (const { file, reason } of warns) console.warn(`WARN   ${file}\n   ${reason}`);
for (const { file, reason } of fails) console.error(`FAIL   ${file}\n   ${reason}`);

console.log(
  `\n${oks.length} ok, ${warns.length} warning(s), ${fails.length} failure(s) across the CMS layer.`
);

if (fails.length) {
  console.error(`\nCMS drift detected. Fix the component or its co-located *.cloudcannon.*.yml.`);
  process.exit(1);
}

// Guard against a silently-empty run (e.g. glob path regression).
if (!oks.length && !warns.length) {
  console.error("lint:cms found nothing to check — likely a path/glob bug.");
  process.exit(1);
}
