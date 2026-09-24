// Lint the CloudCannon YAML against the Astro components it configures.
// FAILs exit 1; WARNs are for checks that can't be made false-positive free.
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

// `_component` key → input names the component doesn't read, downgraded FAIL → WARN.
// A temporary bridge only: remove the entry once the input is deleted or wired.
const KNOWN_DEAD_INPUTS = {};

const componentsDir = join(root, "src", "components");
const astroPaths = (await glob("**/*.astro", { cwd: componentsDir })).sort();

const componentKeys = new Set();
const mainByDir = new Map();
const byKey = new Map();

for (const relToComponents of astroPaths) {
  const astroAbs = join(componentsDir, relToComponents);
  const parsed = parseDestructure(readFileSync(astroAbs, "utf8"));

  componentKeys.add(componentKeyFromPath(relToComponents));
  byKey.set(componentKeyFromPath(relToComponents), { astroAbs, parsed });

  if (isMainComponentFile(astroAbs)) {
    mainByDir.set(dirname(astroAbs), { astroAbs, parsed });
  }
}

// Check 1: every inputs.yml key and structure-value `value:` key is a destructured prop.

for (const [dir, { astroAbs, parsed }] of mainByDir) {
  if (!parsed) continue;
  const destructured = parsed.props;
  const componentKey = componentKeyFromPath(relative(componentsDir, astroAbs));
  const knownDead = new Set(KNOWN_DEAD_INPUTS[componentKey] || []);

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
      // `background.type` and `name[*]` both address the prop named by the first segment.
      .map((k) => k.split(".")[0].replace(/\[\*\]$/, ""))
      .filter((k) => !destructured.has(k));

    report(inputsAbs, "input key(s)", stray);
  }

  const valueAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.structure-value.yml`);

  if (existsSync(valueAbs)) {
    const value = (loadYaml(valueAbs) || {}).value || {};
    const stray = Object.keys(value)
      .filter((k) => k !== "_component" && !NON_PROP_KEY(k))
      .filter((k) => !destructured.has(k));

    report(valueAbs, "default value key(s)", stray);
  }
}

// Check 2: every main building-block/page-section component has a structure-value.yml.
// Child components are reached only through their parent's structures and have none.

for (const relToComponents of astroPaths) {
  const scoped =
    relToComponents.startsWith("building-blocks/") || relToComponents.startsWith("page-sections/");

  if (!scoped) continue;
  const astroAbs = join(componentsDir, relToComponents);

  if (!isMainComponentFile(astroAbs)) continue;

  const dir = dirname(astroAbs);
  const valueAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.structure-value.yml`);

  if (existsSync(valueAbs)) ok(`has structure ${rel(astroAbs)}`);
  else fail(rel(astroAbs), "main component has no sibling *.cloudcannon.structure-value.yml");
}

// Check 3: every *.cloudcannon.*.yml sits beside the .astro its kebab prefix names.

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

// Check 1b: a knob's `value:` seed equals its literal destructure default. Prose inputs,
// SAMPLE_SEEDS, and expression or absent defaults are meant to differ and are skipped.

const KNOB_INPUT_TYPES = new Set([
  "checkbox",
  "multiselect",
  "number",
  "range",
  "select",
  "switch",
]);

// Number knobs that seed starting content, so the seed differs from the fallback.
const SAMPLE_SEEDS = {
  "building-blocks/core-elements/counter": ["number"],
  "building-blocks/core-elements/rating": ["value"],
};

// Values live in `src/data/*.json`; the destructure default is only a fail-safe.
const DATA_BACKED = new Set([
  "navigation/main-nav",
  "navigation/announcement-bar",
  "navigation/footer",
]);

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

// Check 3b: in a page section's `groups`, every `value:` key sits in exactly one group,
// or a new prop silently lands among the ungrouped inputs. No `groups` at all is a WARN.

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

// Check 4: every `_component` in structure YAML and content frontmatter resolves.

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

// MDX bodies are matched by regex, not parsed, so this is only a WARN.
for (const abs of contentFiles) {
  const source = readFileSync(abs, "utf8");
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  const bodyRefs = [...body.matchAll(/_component:\s*["']([\w/-]+)["']/g)].map((m) => m[1]);
  const broken = [...new Set(bodyRefs)].filter((r) => !componentKeys.has(r));

  if (broken.length)
    warn(rel(abs), `unresolved _component in body (MDX/JSX): ${broken.join(", ")}`);
}

// Check 5: literal `*_from_glob` paths exist. A missing `!` exclusion or an empty glob
// is only a WARN: harmless in CloudCannon, but usually stale config.

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

// Check 6: every visible input is seeded in `value:`, since CloudCannon renders no field
// for an unseeded key on a new block. `hidden: true`, `[*]` and structure-seeded keys are exempt.

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
  const inputs = loadYaml(inputsAbs) || {};
  const seededByStructure = (key) => {
    const dot = key.lastIndexOf(".");
    const options = inputs[key.slice(0, dot)]?.options?.structures?.values;

    return (
      dot > 0 &&
      Array.isArray(options) &&
      options.some((o) => hasPath(o?.value, key.slice(dot + 1)))
    );
  };
  const unseeded = Object.entries(inputs)
    .filter(
      ([key, cfg]) =>
        !NON_PROP_KEY(key) &&
        !key.endsWith("[*]") &&
        cfg?.hidden !== true &&
        !hasPath(value, key) &&
        !seededByStructure(key)
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

// Check 7: every visible array input has a `<name>[*]` sibling or `options.structures`,
// or it renders as "not configured". A `hidden: "<expression>"` input is still checked.

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

for (const relYaml of yamlPaths) {
  const abs = join(componentsDir, relYaml);
  const doc = loadYaml(abs) || {};
  const maps = collectInputMaps(doc);

  if (relYaml.endsWith(".inputs.yml") && doc && typeof doc === "object") maps.unshift(doc);
  arraySources.push([abs, maps]);
}

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

// Check 8: every key beside a content `_component` is a destructured prop; items without
// a `_component` are checked against the `_structures` that declares them.

const PASS_THROUGH_ATTR = (key) =>
  key === "id" || key.startsWith("data-") || key.startsWith("aria-");

const structuresByName = {};

for (const abs of [...yamlPaths.map((p) => join(componentsDir, p)), ...structureFiles]) {
  const doc = loadYaml(abs);
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node)) {
        if (key === "_structures" && value && typeof value === "object")
          Object.assign(structuresByName, value);
        else walk(value);
      }
    }
  };

  walk(doc);

  // `.cloudcannon/structures/*.yml` declare their structures at the document root.
  if (structureFiles.includes(abs) && doc && typeof doc === "object")
    Object.assign(structuresByName, doc);
}

const inputRootKey = (name) => name.split(".")[0].replace(/\[\*\]$/, "");

function structureShape(ref) {
  const structure = structuresByName[String(ref).replace(/^_structures\./, "")];

  if (!structure?.values) return null;

  const keys = new Set();
  const nested = new Map();

  for (const option of structure.values) {
    for (const key of Object.keys(option?.value ?? {})) keys.add(key);

    for (const [name, cfg] of Object.entries(option?._inputs ?? {})) {
      keys.add(inputRootKey(name));

      if (typeof cfg?.options?.structures === "string")
        nested.set(inputRootKey(name), cfg.options.structures);
    }
  }

  return { keys, nested };
}

function structureRefsFor(componentKey) {
  const astroAbs = byKey.get(componentKey)?.astroAbs;

  if (!astroAbs) return new Map();

  const dir = dirname(astroAbs);
  const inputsAbs = join(dir, `${dir.split("/").pop()}.cloudcannon.inputs.yml`);
  const refs = new Map();

  for (const [name, cfg] of Object.entries(loadYaml(inputsAbs) || {})) {
    if (typeof cfg?.options?.structures === "string")
      refs.set(inputRootKey(name), cfg.options.structures);
  }

  return refs;
}

function checkStructuredItems(items, ref, path, strays) {
  const shape = structureShape(ref);

  if (!shape || !Array.isArray(items)) return;

  items.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return;
    if (typeof item._component === "string") return;

    const itemPath = `${path}[${index}]`;

    for (const [key, value] of Object.entries(item)) {
      if (NON_PROP_KEY(key)) continue;

      if (!shape.keys.has(key)) {
        strays.push(`${itemPath}: ${ref} declares no "${key}"`);
        continue;
      }

      const nestedRef = shape.nested.get(key);

      if (nestedRef) checkStructuredItems(value, nestedRef, `${itemPath}.${key}`, strays);
    }
  });
}

function checkContentProps(node, path, abs, strays) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => checkContentProps(item, `${path}[${i}]`, abs, strays));
    return;
  }
  if (!node || typeof node !== "object") return;

  if (typeof node._component === "string") {
    const entry = byKey.get(node._component);

    if (entry?.parsed) {
      const refs = structureRefsFor(node._component);

      for (const key of Object.keys(node)) {
        if (key === "_component" || NON_PROP_KEY(key)) continue;

        if (refs.has(key))
          checkStructuredItems(node[key], refs.get(key), `${path || "."}.${key}`, strays);

        if (entry.parsed.props.has(key)) continue;
        if (entry.parsed.hasRest && PASS_THROUGH_ATTR(key)) continue;
        strays.push(`${path || "."}: ${node._component} has no prop "${key}"`);
      }
    }
  }

  for (const [key, value] of Object.entries(node))
    checkContentProps(value, path ? `${path}.${key}` : key, abs, strays);
}

for (const abs of contentFiles) {
  const fm = frontmatter(readFileSync(abs, "utf8"));

  if (!fm) continue;

  const strays = [];

  checkContentProps(fm, "", abs, strays);

  if (strays.length) fail(rel(abs), `unknown prop(s) in content:\n   ${strays.join("\n   ")}`);
  else ok(`content     ${rel(abs)}`);
}

// Check 9: the editor strips inline `<script>`s, so every scripted component registers a
// setup module in `editor-live-sync.js` or is listed in EDITOR_INERT.

const liveSyncSource = readFileSync(join(root, "editor-live-sync.js"), "utf8");

// Verify the component degrades rather than breaks on the canvas before adding one.
const EDITOR_INERT = {
  "navigation/consent/Consent.astro":
    "site chrome stays hidden and never loads optional services in the CloudCannon editor",
  "navigation/bar/Bar.astro": "dropdowns keep their CSS-only `:checked` disclosure",
  "navigation/side/Side.astro": "panels keep their CSS-only `:checked` disclosure",
  "navigation/mobile/Mobile.astro": "the drawer keeps its CSS-only `:checked` disclosure",
  "navigation/announcement-bar/AnnouncementBar.astro":
    "intentional — the editor must always see the bar it is editing, so dismissal stays off",
  "navigation/theme-toggle/ThemeToggle.astro":
    "the toggle is inert but the canvas renders in the site's default theme",
  "navigation/theme-toggle/ThemeToggleScript.astro":
    "sets the pre-paint theme on a real page load; the editor supplies its own frame",
  "building-blocks/core-elements/counter/Counter.astro":
    "the count-up does not animate; the SSR value is the final number",
  "building-blocks/forms/range/Range.astro":
    "the slider still drags, only the live number readout stops tracking",
  "utils/VideoElements.astro": "calls core-elements/video/setup, which is registered",
};

function hasExecutableScript(source) {
  const body = source.replace(/^---[\s\S]*?\n---/, "");

  return [...body.matchAll(/<script\b([^>]*)>/g)].some(([, attrs]) => {
    const type = attrs.match(/type\s*=\s*["']([^"']+)["']/)?.[1];

    return !type || /javascript|module/i.test(type);
  });
}

for (const relToComponents of astroPaths) {
  const astroAbs = join(componentsDir, relToComponents);
  const dir = dirname(astroAbs);
  const hasSetup = ["setup.ts", "setup.js"].some((name) => existsSync(join(dir, name)));

  if (!hasSetup && !hasExecutableScript(readFileSync(astroAbs, "utf8"))) continue;

  const setupRef = `src/components/${relative(componentsDir, dir)}/setup`;

  if (liveSyncSource.includes(setupRef)) {
    ok(`editor-sync ${rel(astroAbs)}`);
  } else if (EDITOR_INERT[relToComponents]) {
    ok(`editor-inert ${rel(astroAbs)} (${EDITOR_INERT[relToComponents]})`);
  } else {
    fail(
      rel(astroAbs),
      "client `<script>` that never runs in the CloudCannon editor — extract it to a " +
        "co-located setup.ts and register it in editor-live-sync.js (see " +
        "building-blocks/wrappers/carousel/setup.ts), or add an EDITOR_INERT entry in " +
        "scripts/cms/lint.mjs saying why inert is acceptable."
    );
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
