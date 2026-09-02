/**
 * Lint the CloudCannon CMS layer against the Astro components it configures.
 *
 *   node scripts/cms/lint.mjs
 *
 * Catches the "edit a prop, silently break the editor" class of drift that
 * nothing else validates — Astro props and their co-located `*.cloudcannon.*.yml`
 * are maintained by hand in parallel.
 *
 * Output is one `ok`/`FAIL`/`WARN` line per thing checked. FAILs exit 1; WARNs
 * never fail the build — they're for checks that can't be made false-positive
 * free, and each is commented with why.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { glob } from "glob";
import { componentKeyFromPath, pascalToKebab } from "../../src/components/utils/componentKey.mjs";
import {
  parseDestructure,
  loadYaml,
  collectComponentRefs,
  frontmatter,
  isMainComponentFile,
  NON_PROP_KEY,
} from "../lib/componentModel.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const rel = (p) => relative(root, p);

const fails = [];
const warns = [];
const oks = [];
const fail = (file, reason) => fails.push({ file, reason });
const warn = (file, reason) => warns.push({ file, reason });
const ok = (label) => oks.push(label);

// Known "dead input" drift: editor fields the component does NOT read (it
// hardcodes the value, or the prop was never implemented). Adding an entry here
// downgrades that key from FAIL to WARN (still printed every run) — use it only
// as a temporary bridge while a fix lands, then delete the input or wire the
// prop and remove the entry. Keyed by component `_component` key → dead prop
// names. Any stray key NOT listed here FAILs, so renames are caught.
const KNOWN_DEAD_INPUTS = {};

// Load every component .astro, its key, its parsed destructure.

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

// Check 1 — Prop drift (FAIL): every top-level key in a co-located inputs.yml,
// and every `value:` key in a structure-value.yml, must be a prop the component
// actually destructures. This is the "renamed prop silently breaks the editor"
// killer check. FAIL-level: parsing is exact and false positives were tuned out.

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
      // CloudCannon addresses nested inputs with dotted keys (`background.type`)
      // and array items with `name[*]`; the actual prop is the first segment.
      .map((k) => k.split(".")[0].replace(/\[\*\]$/, ""))
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

// Check 2 — Missing structure-value (FAIL): every *main* component .astro under
// building-blocks/ and page-sections/ must have a sibling structure-value.yml.
// Rule for "main": kebab(filename) === parent dir name. Child components
// (FeatureItem, AccordionItem, SelectOption, ...) are referenced only via their
// parent's structures and legitimately have none — the rule expresses this with
// no hardcoded exception list. Navigation/ and utils/ are out of scope (they are
// wired as data panels / internal helpers, not page-builder blocks).

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

// Check 3 — Orphaned YAML (FAIL): every *.cloudcannon.*.yml under src/components
// must sit beside a matching .astro (a sibling whose kebab filename equals the
// YAML's kebab prefix). Catches YAML left behind after a rename/delete.

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

// Check 1b — Default-value drift (FAIL): where a structure-value `value:` seeds
// a knob AND the component destructures a default for it, the two must agree.
// They are two sources of truth for the same thing: the seed is what a newly
// inserted block starts as, the destructure default is what a composed or
// programmatic use gets, and a disagreement means the docs page and a fresh
// block render differently for no stated reason.
//
// Only literal-vs-literal comparisons are made, and only for props the
// co-located inputs.yml declares as a knob (a select, switch, checkbox or
// number). Prose inputs are starting content and are meant to differ from the
// component's fallback; so is any prop listed in SAMPLE_SEEDS, and any prop
// whose destructure default is an expression or absent (absent is deliberate —
// "whatever the caller passes").

const KNOB_INPUT_TYPES = new Set([
  "checkbox",
  "multiselect",
  "number",
  "range",
  "select",
  "switch",
]);

// Number knobs that seed starting *content* rather than configuring layout, so
// the seed is meant to differ from the component's fallback.
const SAMPLE_SEEDS = {
  "building-blocks/core-elements/counter": ["number"],
  "building-blocks/core-elements/rating": ["value"],
};

// Components whose real value lives in `src/data/*.json`; the destructure
// default is the fail-safe for "prop omitted entirely", so it differs from the
// seed on purpose.
const DATA_BACKED = new Set([
  "navigation/main-nav",
  "navigation/announcement-bar",
  "navigation/footer",
]);

/** Parse a destructure default into a JS literal, or report that it isn't one. */
const asLiteral = (raw) => {
  if (raw === undefined) return { literal: false };

  const text = raw.trim();

  if (text === "true") return { literal: true, value: true };
  if (text === "false") return { literal: true, value: false };
  if (text === "null") return { literal: true, value: null };
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return { literal: true, value: Number(text) };
  if (/^"[^"\\]*"$/.test(text) || /^'[^'\\]*'$/.test(text)) {
    return { literal: true, value: text.slice(1, -1) };
  }

  return { literal: false };
};

for (const [dir, { astroAbs, parsed }] of mainByDir) {
  if (!parsed) continue;

  const valueAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.structure-value.yml`);

  if (!existsSync(valueAbs)) continue;

  const componentKey = componentKeyFromPath(relative(componentsDir, astroAbs));

  if (DATA_BACKED.has(componentKey)) continue;

  const sampleSeeds = new Set(SAMPLE_SEEDS[componentKey] || []);
  const inputsAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.inputs.yml`);
  const inputs = existsSync(inputsAbs) ? loadYaml(inputsAbs) || {} : {};
  const value = (loadYaml(valueAbs) || {}).value || {};
  const drift = [];

  for (const [key, seeded] of Object.entries(value)) {
    if (key === "_component" || NON_PROP_KEY(key)) continue;
    if (!parsed.props.has(key) || sampleSeeds.has(key)) continue;
    if (seeded !== null && typeof seeded === "object") continue;
    if (!KNOB_INPUT_TYPES.has(inputs[key]?.type)) continue;

    const fallback = asLiteral(parsed.defaults.get(key));

    if (!fallback.literal || fallback.value === seeded) continue;

    drift.push(
      `${key}: seed ${JSON.stringify(seeded)} vs default ${JSON.stringify(fallback.value)}`
    );
  }

  if (drift.length) fail(rel(valueAbs), `default drift vs ${rel(astroAbs)} — ${drift.join("; ")}`);
  else ok(`defaults    ${rel(valueAbs)}`);
}

// Check 3b — Input-group coverage (FAIL): page-section structure values group
// their inputs (Content first, then a collapsed "Section settings" group) so
// shell config doesn't present as a peer of the content. When a `groups` block
// is present, every `value:` key except `_component` must sit in exactly one
// group, and every listed input must exist under `value:` — otherwise a newly
// added prop silently lands wherever the editor defaults ungrouped inputs.
// A page section with no `groups` at all is a WARN, so new sections adopt the
// pattern (the scaffold template ships it).

for (const relYaml of yamlPaths.filter(
  (p) => p.startsWith("page-sections/") && p.endsWith(".structure-value.yml")
)) {
  const yamlAbs = join(componentsDir, relYaml);
  const doc = loadYaml(yamlAbs) || {};

  if (!Array.isArray(doc.groups)) {
    warn(
      rel(yamlAbs),
      "page section has no `groups` block — settings inputs present as peers of content"
    );
    continue;
  }
  const valueKeys = Object.keys(doc.value || {}).filter((k) => k !== "_component");
  const listed = doc.groups.flatMap((g) => g.inputs || []);
  const seen = new Set();
  const dupes = [...new Set(listed.filter((k) => (seen.has(k) ? true : (seen.add(k), false))))];
  const ungrouped = valueKeys.filter((k) => !seen.has(k));
  const unknown = listed.filter((k) => !valueKeys.includes(k));
  const problems = [];

  if (ungrouped.length) problems.push(`value key(s) in no group: ${ungrouped.join(", ")}`);
  if (unknown.length) problems.push(`group input(s) with no value key: ${unknown.join(", ")}`);
  if (dupes.length) problems.push(`input(s) listed in two groups: ${dupes.join(", ")}`);

  if (problems.length) fail(rel(yamlAbs), problems.join("; "));
  else ok(`group cover ${rel(yamlAbs)}`);
}

// Check 4 — `_component` resolution (FAIL): every `_component` value found in
// structure YAML (co-located + .cloudcannon/structures) and in content
// frontmatter must resolve to a real component key. All sources are parsed as
// YAML, so this is reliable → FAIL-level. Content *bodies* (MDX JSX) are checked
// separately at WARN-level below (regex, not a parser).

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

// Check 5 — Structures registration: literal (non-glob) paths listed in a
// `*_from_glob` block must exist on disk. Positive entries missing → FAIL (a
// structure points at a file that isn't there). Negation (`!`) entries missing,
// and wildcard globs matching zero files → WARN: a dangling `!exclude` is a
// harmless no-op in CloudCannon but signals stale config, and an empty positive
// glob is usually — but not always — intentional.

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

// Check 6 — Unseeded input (FAIL): every *visible* key in a co-located
// inputs.yml must also appear in the sibling structure-value.yml's `value:`.
// CloudCannon builds a newly inserted block from `value:` alone, so an input
// with no seeded key simply never renders a field for that block — the input
// looks configured but is unreachable in the editor.
//
// Three exemptions, all deliberate:
//   - `hidden: true` inputs are dev-set props (Image's `sizes`/`widths`), where
//     the component's own default is the intended value and seeding it into
//     every block would just duplicate that default into content.
//   - `hidden: "<expression>"` inputs are conditionally shown; their parent key
//     is what needs seeding, and dotted keys resolve through it.
//   - `<name>[*]` keys configure an array's items, not a field of their own —
//     the parent array is what needs seeding (and check 7 requires the `[*]`
//     entry to exist for plain arrays).

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
    .filter(
      ([key, cfg]) =>
        !NON_PROP_KEY(key) && !key.endsWith("[*]") && cfg?.hidden !== true && !hasPath(value, key)
    )
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

// Check 7 — Unconfigured array input (FAIL): every visible `type: array` input
// must declare what its items are, via either a sibling `<name>[*]` sub-input
// (arrays of scalars) or `options.structures` (arrays of blocks). CloudCannon
// needs one of the two to know what to insert when an editor clicks "+"; without
// it the field renders as "<Name> not configured" and the array is uneditable.
// The failure is invisible from the Astro side — the prop still has a default and
// the site builds — so nothing else catches it.
//
// `hidden: true` inputs are exempt for the same reason as Check 6: they never
// render a field, so they can never show the error (Image's `widths`). A
// `hidden: "<expression>"` input IS conditionally shown, so it is still checked.

/** Every `_inputs:` map in a document, recursively. */
function collectInputMaps(node, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectInputMaps(item, out);
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "_inputs" && value && typeof value === "object" && !Array.isArray(value))
        out.push(value);
      collectInputMaps(value, out);
    }
  }
  return out;
}

const arraySources = [];

// Co-located component YAML: an `.inputs.yml` root is itself an input map;
// `.snippets.yml` carries nested `_inputs` blocks.
for (const relYaml of yamlPaths) {
  const abs = join(componentsDir, relYaml);
  const doc = loadYaml(abs) || {};
  const maps = collectInputMaps(doc);

  if (relYaml.endsWith(".inputs.yml") && doc && typeof doc === "object") maps.unshift(doc);
  arraySources.push([abs, maps]);
}

// Collection-level and shared-structure inputs.
for (const abs of [join(root, "cloudcannon.config.yml"), ...structureFiles]) {
  arraySources.push([abs, collectInputMaps(loadYaml(abs) || {})]);
}

for (const [abs, maps] of arraySources) {
  const unconfigured = [];
  let arrayInputs = 0;

  for (const map of maps) {
    const siblings = new Set(Object.keys(map));

    for (const [name, cfg] of Object.entries(map)) {
      if (!cfg || typeof cfg !== "object" || cfg.type !== "array") continue;
      arrayInputs += 1;
      if (cfg.hidden === true) continue;
      if (siblings.has(`${name}[*]`)) continue;
      if (cfg.options?.structures) continue;
      unconfigured.push(name);
    }
  }

  if (unconfigured.length) {
    fail(
      rel(abs),
      `array input(s) with no item configuration — CloudCannon renders these as "not configured" and the editor cannot add items. Add a \`<name>[*]\` sub-input or \`options.structures\`: ${[...new Set(unconfigured)].join(", ")}`
    );
  } else if (arrayInputs) {
    ok(`array items ${rel(abs)}`);
  }
}

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
