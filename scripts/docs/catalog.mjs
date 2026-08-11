/**
 * Generate the component catalog tables in
 * `.agents/skills/page-content-authoring/component-catalog.md` from the
 * co-located CloudCannon YAML (and, for child-item footnotes, the sibling
 * `.astro` destructures) of every component under `src/components/`.
 *
 * The catalog file has two marker-delimited regions — one under the "Page
 * sections" H2, one under "Building blocks" — rewritten in full on every run.
 * Everything else (intro prose, H2 preambles) is hand-written and untouched.
 *
 *   node scripts/docs/catalog.mjs           regenerate both regions
 *   node scripts/docs/catalog.mjs --check   verify the file matches (CI)
 *
 * "Use for" comes from the co-located `*.cloudcannon.structure-value.yml`
 * `description:` — one source of truth instead of hand-duplicated prose.
 * Content-prop columns come from the co-located `*.cloudcannon.inputs.yml`
 * keys (dotted keys collapsed to their first segment, `_`-prefixed skipped).
 * For page sections only the keys ABOVE the
 * `# --- section wrapper inputs (CustomSection) ---` marker count — the
 * shell props below it are common to every page section and documented once
 * in SKILL.md, not repeated per row.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { glob } from "glob";
import * as yaml from "js-yaml";
import { loadYaml, NON_PROP_KEY, buildComponentIndex } from "../lib/componentModel.mjs";

const mode = process.argv.includes("--check") ? "check" : "write";
const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const rel = (p) => relative(root, p);

const catalogPath = join(
  root,
  ".agents",
  "skills",
  "page-content-authoring",
  "component-catalog.md"
);
const catalogLabel = rel(catalogPath);

const SECTION_MARKER = "# --- section wrapper inputs (CustomSection) ---";

// Editorial grouping order, preserved from the hand-authored catalog. Unknown
// groups (a new top-level dir under a tier that isn't listed here) are
// appended alphabetically rather than silently dropped.
const GROUP_ORDER = {
  "page-sections": ["heroes", "features", "ctas", "info-blocks", "people", "builders"],
  "building-blocks": ["core-elements", "wrappers", "forms"],
};

const GROUP_TITLES = {
  heroes: "Heroes",
  features: "Features",
  ctas: "CTAs",
  "info-blocks": "Info blocks",
  people: "People",
  builders: "Builders",
  "core-elements": "Core elements",
  wrappers: "Wrappers",
  forms: "Forms",
};

// Short editorial intro shown once under a building-blocks H3, above its
// table. Stable, category-level prose — not derived from any single
// component's YAML, so it lives here rather than being reverse-engineered.
const GROUP_INTRO = {
  wrappers:
    "Containers that hold other building blocks (their child items are themselves `_component` blocks).",
  forms: "Compose these inside a `form` (or a page section's `formBlocks[]`, as in `cta-form`).",
};

// Hand-maintained editorial nuance that can't be derived from YAML — keep short.
// Rendered as an extra footnote bullet under that component's group table.
// Keyed by full `_component` key.
const EDITORIAL_NOTES = {
  "page-sections/features/feature-slider":
    "No section-level heading — each slide carries its own text.",
  "page-sections/builders/custom-section":
    "The escape hatch for arbitrary layouts; `rounded` is unique to this section (page-section wrappers do not forward it).",
};

function titleize(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function groupTitle(slug) {
  return GROUP_TITLES[slug] || titleize(slug);
}

/** Order a set of group names: known groups in their editorial order, then unknown groups alphabetically. */
function orderGroups(groupNames, order) {
  const known = order.filter((g) => groupNames.has(g));
  const rest = [...groupNames].filter((g) => !order.includes(g)).sort();

  return [...known, ...rest];
}

// Props every component destructures (or lists in its inputs.yml) for
// wiring/editor plumbing, not content an author sets — skipped everywhere:
// the main props column, child-item footnotes, and structure-derived
// footnotes. `data-*` (quoted, aliased data attributes like
// `data-children-prop`) is matched by prefix. This set must stay universal —
// a name here is dropped from *every* component, so it only holds names that
// are never legitimate authored content anywhere in the library.
const INFRA_PROPS = new Set(["class", "style", "useDefaultEditableBinding", "_component", "index"]);
const isInfraProp = (key) => INFRA_PROPS.has(key) || key.startsWith("data-");

// Wiring props specific to the fixed set of *child-item* components a parent
// wrapper passes state into — `isOpen`/`accordionName` (AccordionItem),
// `checked`/`groupName` (ContentSelectorPanel). These names collide with
// genuine content props elsewhere (`toggle`'s own `checked`, `choice-group`'s
// per-option `checked`), so — unlike INFRA_PROPS — this set is scoped to
// exactly one call site: filtering a sibling `.astro`'s own destructure for a
// child-item footnote. Never apply it to a main component's props column or
// to structure-derived footnotes. `navigationPosition` stays out of both sets
// — it's a real content prop on the main `content-selector` component too.
const CHILD_WIRING_PROPS = new Set(["isOpen", "accordionName", "checked", "groupName"]);

/**
 * The inputs.yml doc for a component, restricted (for page sections) to the
 * keys above the CustomSection shell-props marker. Components with no marker
 * (building blocks) get every key.
 */
function contentInputsDoc(inputsPath, tier) {
  if (!inputsPath) return {};
  const raw = readFileSync(inputsPath, "utf8");
  const idx = tier === "page-sections" ? raw.indexOf(SECTION_MARKER) : -1;
  const text = idx === -1 ? raw : raw.slice(0, idx);

  return yaml.load(text) || {};
}

/** Format one inputs.yml key for a "Key content props" cell. */
function formatProp(key, cfg) {
  const label = cfg?.type === "array" ? `\`${key}[]\`` : `\`${key}\``;

  if (cfg?.type === "markdown") return `${label} (markdown)`;
  if (cfg?.type === "select" && Array.isArray(cfg.options?.values)) {
    // `options.values` is either a list of `{ id, name }` objects or, for
    // simple enums, bare scalars (strings/numbers) used as their own id.
    const ids = cfg.options.values.map((v) => `\`${typeof v === "object" ? v.id : v}\``).join("/");

    return `${label} (${ids})`;
  }
  return label;
}

/** The "Key content props" cell for a component: ordered, deduped, formatted. */
function propsCell(doc) {
  const seen = new Set();
  const cells = [];

  for (const rawKey of Object.keys(doc)) {
    if (NON_PROP_KEY(rawKey) || rawKey.includes("[")) continue;
    const key = rawKey.split(".")[0];

    if (seen.has(key) || isInfraProp(key)) continue;
    seen.add(key);
    cells.push(formatProp(key, doc[rawKey]));
  }
  return cells.join(", ");
}

/** The single array-type top-level input in a doc, if there is exactly one — used to
 * label a child-item footnote ("`grid` item (`items[]`): ..."). */
function soleArrayProp(doc) {
  const arrayKeys = Object.keys(doc).filter((k) => !k.includes(".") && doc[k]?.type === "array");

  return arrayKeys.length === 1 ? arrayKeys[0] : null;
}

/**
 * The content-prop keys of a `_structures.<name>` block's first entry, for
 * array inputs whose item shape has no sibling `.astro` (e.g. `faq-section`'s
 * `items[]` — a bespoke `{ title, contentSections }` object, not a component).
 * Only bespoke shapes qualify: an entry whose value carries a `_component`
 * key is a real, already-catalogued component (every shared
 * `.cloudcannon/structures/*.yml` block is exactly this — `values_from_glob`
 * pointing at full component structure-value files), so it is skipped rather
 * than double-documented.
 */
function structureItemKeys(arrayCfg, structureValueDoc, sharedStructures) {
  const ref = arrayCfg?.options?.structures;

  if (typeof ref !== "string" || !ref.startsWith("_structures.")) return null;
  const name = ref.slice("_structures.".length);

  const firstBespokeValue = (block) => {
    const value = block?.values?.[0]?.value;

    return value && typeof value === "object" && !Array.isArray(value) && !("_component" in value)
      ? value
      : null;
  };

  // Prefer the component's own local `_structures.<name>` block; fall back to
  // a shared `.cloudcannon/structures/<name>.cloudcannon.structures.yml`.
  const value =
    firstBespokeValue(structureValueDoc?._structures?.[name]) ||
    firstBespokeValue(sharedStructures.get(name));

  if (!value) return null;

  return Object.keys(value).filter((k) => !NON_PROP_KEY(k) && !isInfraProp(k));
}

/** A markdown table, padded exactly the way `prettier` formats GFM tables:
 * every column padded to its widest cell (header included), single space
 * either side of each pipe, separator dashes filling the same width. */
function renderTable(headers, rows) {
  const widths = headers.map((h, i) => Math.max(h.length, 3, ...rows.map((r) => r[i].length)));
  const line = (cells) => `| ${cells.map((c, i) => c.padEnd(widths[i])).join(" | ")} |`;
  const sep = widths.map((w) => "-".repeat(w));

  return [line(headers), line(sep), ...rows.map(line)].join("\n");
}

const { byKey } = await buildComponentIndex(root);
const mains = [...byKey.values()].filter(
  (e) => e.isMain && (e.key.startsWith("page-sections/") || e.key.startsWith("building-blocks/"))
);

if (!mains.length) {
  console.error(
    "docs:catalog found no components under page-sections/ or building-blocks/ — likely a glob bug."
  );
  process.exit(1);
}

// Non-main siblings, grouped by their directory, for child-item footnotes.
const siblingsByDir = new Map();

for (const entry of byKey.values()) {
  if (entry.isMain) continue;
  if (!siblingsByDir.has(entry.dirAbs)) siblingsByDir.set(entry.dirAbs, []);
  siblingsByDir.get(entry.dirAbs).push(entry);
}

// Shared `.cloudcannon/structures/*.cloudcannon.structures.yml`, keyed by
// their top-level name (e.g. "buttonSections") — the fallback source for
// child-item footnotes when a component has no sibling `.astro`.
const sharedStructures = new Map();

for (const file of await glob("*.cloudcannon.structures.yml", {
  cwd: join(root, ".cloudcannon", "structures"),
})) {
  const doc = loadYaml(join(root, ".cloudcannon", "structures", file)) || {};

  for (const [name, block] of Object.entries(doc)) sharedStructures.set(name, block);
}

function footnotesFor(entry, slug, structureValueDoc) {
  const siblings = siblingsByDir.get(entry.dirAbs) || [];
  const doc = contentInputsDoc(entry.inputsPath, entry.tier);
  const arrayProp = soleArrayProp(doc);
  const label = arrayProp ? `\`${slug}\` item (\`${arrayProp}[]\`)` : `\`${slug}\` item`;

  if (siblings.length) {
    return siblings.map((sibling) => {
      const parsed = sibling.parsed;
      const props = parsed
        ? [...parsed.props].filter((p) => !isInfraProp(p) && !CHILD_WIRING_PROPS.has(p))
        : [];

      return `- ${label}: ${props.map((p) => `\`${p}\``).join(", ")}.`;
    });
  }

  // No sibling component — the item may still be a bespoke shape documented
  // only via its `_structures.<name>` block (e.g. faq-section's `items[]`).
  if (arrayProp) {
    const keys = structureItemKeys(doc[arrayProp], structureValueDoc, sharedStructures);

    if (keys?.length) return [`- ${label}: ${keys.map((k) => `\`${k}\``).join(", ")}.`];
  }

  return [];
}

function buildTier(tier, headerLabel) {
  const entries = mains.filter((e) => e.key.startsWith(`${tier}/`));
  const groups = new Map();

  for (const entry of entries) {
    const group = entry.key.split("/")[1];

    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(entry);
  }

  const orderedGroups = orderGroups(new Set(groups.keys()), GROUP_ORDER[tier] || []);
  const sections = [];

  for (const group of orderedGroups) {
    const groupEntries = [...groups.get(group)].sort((a, b) => a.key.localeCompare(b.key));
    const rows = [];
    const footnotes = [];

    for (const entry of groupEntries) {
      const slug = entry.key.split("/").pop();
      const structureValue = entry.structureValuePath
        ? loadYaml(entry.structureValuePath) || {}
        : {};
      const useFor = structureValue.description || "";
      const doc = contentInputsDoc(entry.inputsPath, tier);
      const firstCell = tier === "page-sections" ? `\`${entry.key}\`` : `\`${slug}\``;

      rows.push([firstCell, useFor, propsCell(doc)]);
      footnotes.push(...footnotesFor({ ...entry, tier }, slug, structureValue));

      const note = EDITORIAL_NOTES[entry.key];

      if (note) footnotes.push(`- **\`${slug}\`**: ${note}`);
    }

    const heading =
      tier === "building-blocks"
        ? `### ${groupTitle(group)} — \`building-blocks/${group}/<slug>\``
        : `### ${groupTitle(group)}`;
    const intro = GROUP_INTRO[group];
    const table = renderTable([headerLabel, "Use for", "Key content props"], rows);
    const parts = [heading, "", ...(intro ? [intro, ""] : []), table];

    if (footnotes.length) parts.push("", footnotes.join("\n"));
    sections.push(parts.join("\n"));
  }

  return sections.join("\n\n");
}

const generated = {
  "page-sections": buildTier("page-sections", "`_component`"),
  "building-blocks": buildTier("building-blocks", "`<slug>`"),
};

// Splice into the catalog file between its markers.

const original = readFileSync(catalogPath, "utf8");
let updated = original;
const regions = ["page-sections", "building-blocks"];
const missingMarkers = [];

for (const region of regions) {
  const start = `<!-- generated:catalog:${region}:start (npm run docs:catalog) -->`;
  const end = `<!-- generated:catalog:${region}:end -->`;
  const startIdx = updated.indexOf(start);
  const endIdx = updated.indexOf(end);

  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    missingMarkers.push(region);
    continue;
  }

  const before = updated.slice(0, startIdx + start.length);
  const after = updated.slice(endIdx);

  // Prettier treats an HTML comment as its own block and requires a blank
  // line separating it from adjacent markdown content on both sides.
  updated = `${before}\n\n${generated[region]}\n\n${after}`;
}

if (missingMarkers.length) {
  console.error(
    `Could not find marker pair(s) in ${catalogLabel}: ${missingMarkers.join(", ")}. Expected ` +
      `"<!-- generated:catalog:<region>:start (npm run docs:catalog) -->" / ":end" comments.`
  );
  process.exit(1);
}

if (mode === "write") {
  if (updated === original) {
    console.log(`ok     ${catalogLabel} (${mains.length} components)`);
  } else {
    writeFileSync(catalogPath, updated);
    console.log(`synced ${catalogLabel} (${mains.length} components)`);
  }
  process.exit(0);
}

// --check: report per-row drift rather than just "file differs".
if (updated === original) {
  console.log(`ok     ${catalogLabel} (${mains.length} components)`);
  process.exit(0);
}

const rowKeyOf = (line) => line.match(/^\|\s*`([^`]+)`/)?.[1];
const oldRows = new Map(
  original
    .split("\n")
    .map((l) => [rowKeyOf(l), l])
    .filter(([k]) => k)
);
const newRows = new Map(
  updated
    .split("\n")
    .map((l) => [rowKeyOf(l), l])
    .filter(([k]) => k)
);

console.error(`DRIFT  ${catalogLabel} — generated regions are out of sync with the component YAML`);
for (const [key, line] of newRows) {
  if (!oldRows.has(key)) console.error(`   missing row for \`${key}\``);
  else if (oldRows.get(key) !== line) console.error(`   changed row for \`${key}\``);
}
for (const key of oldRows.keys()) {
  if (!newRows.has(key)) console.error(`   orphaned row for \`${key}\``);
}

console.error("\nRun: npm run docs:catalog");
process.exit(1);
