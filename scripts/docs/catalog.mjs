/**
 * Generates the marker-delimited regions of
 * `.agents/skills/page-content-authoring/component-catalog.md` from component YAML;
 * everything outside the markers is hand-written. `--check` verifies instead of writing.
 * "Use for" is the structure-value `description:`; page-section props stop at SECTION_MARKER.
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
// `space-before.yml` is omitted: it is on every block, so it would repeat in every row.
const SHARED_CONTENT_INPUTS = ["/.cloudcannon/inputs/background.yml"];

// Unlisted groups are appended alphabetically.
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

const GROUP_INTRO = {
  wrappers:
    "Containers that hold other building blocks (their child items are themselves `_component` blocks).",
  forms: "Compose these inside a `form` (or a page section's `formBlocks[]`, as in `cta-form`).",
};

const EDITORIAL_NOTES = {
  "page-sections/explainers/feature-slider":
    "No section-level heading — each slide carries its own text.",
  "page-sections/builders/custom-section":
    "The escape hatch for arbitrary layouts; `rounded` is unique to this section (page-section wrappers do not forward it).",
  "building-blocks/wrappers/scroll-deck":
    "Every card matches the tallest card in the deck. Nothing pins below 768px.",
  "building-blocks/wrappers/scroll-stepper":
    "Each scene pairs arbitrary sticky media with arbitrary content. On mobile, media stays before its paired content.",
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

function orderGroups(groupNames, order) {
  const known = order.filter((g) => groupNames.has(g));
  const rest = [...groupNames].filter((g) => !order.includes(g)).sort();

  return [...known, ...rest];
}

// Dropped from every component's docs, so only names that are never authored content anywhere.
const INFRA_PROPS = new Set(["class", "style", "useDefaultEditableBinding", "_component", "index"]);
const isInfraProp = (key) => INFRA_PROPS.has(key) || key.startsWith("data-");

// Parent-to-child wiring props. These names are real content props elsewhere (`toggle`'s
// `checked`), so apply only to child-item footnotes, never to a main component's props.
const CHILD_WIRING_PROPS = new Set([
  "isOpen",
  "accordionName",
  "checked",
  "groupName",
  "tablistLabel",
  "imageAspectRatio",
  "aspectRatio",
  "lightbox",
  "layout",
  "grouped",
  "showAnnualPricing",
  "cardColorScheme",
]);

function contentInputsDoc(inputsPath, tier, structureValue = {}) {
  if (!inputsPath) return {};
  const raw = readFileSync(inputsPath, "utf8");
  const idx = tier === "page-sections" ? raw.indexOf(SECTION_MARKER) : -1;

  if (idx !== -1) return yaml.load(raw.slice(0, idx)) || {};

  const shared = (structureValue._inputs_from_glob || [])
    .filter((p) => SHARED_CONTENT_INPUTS.includes(p))
    .map((p) => loadYaml(join(root, p)) || {});

  return Object.assign(yaml.load(raw) || {}, ...shared);
}

function formatProp(key, cfg) {
  const label = cfg?.type === "array" ? `\`${key}[]\`` : `\`${key}\``;
  const structures = cfg?.type === "object" ? cfg.options?.structures : undefined;

  if (structures?.id_key && Array.isArray(structures.values)) {
    const idKey = structures.id_key;
    const variants = structures.values.map(({ value = {} }) => {
      const fields = Object.keys(value).filter((k) => k !== idKey);

      return `\`${value[idKey]}\`: ${fields.map((k) => `\`${k}\``).join("/")}`;
    });

    return `${label} (by \`${idKey}\` — ${variants.join("; ")})`;
  }

  if (cfg?.type === "markdown") return `${label} (markdown)`;
  if (cfg?.type === "select" && Array.isArray(cfg.options?.values)) {
    const ids = cfg.options.values.map((v) => `\`${typeof v === "object" ? v.id : v}\``).join("/");

    return `${label} (${ids})`;
  }
  return label;
}

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

function soleArrayProp(doc) {
  const arrayKeys = Object.keys(doc).filter((k) => !k.includes(".") && doc[k]?.type === "array");

  return arrayKeys.length === 1 ? arrayKeys[0] : null;
}

/** Item keys of a bespoke `_structures.<name>` shape; entries with a `_component` are already catalogued, so null. */
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

  const value =
    firstBespokeValue(structureValueDoc?._structures?.[name]) ||
    firstBespokeValue(sharedStructures.get(name));

  if (!value) return null;

  return Object.keys(value).filter((k) => !NON_PROP_KEY(k) && !isInfraProp(k));
}

/** Must match prettier's GFM table padding byte-for-byte, or `--check` fails after a format. */
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

const siblingsByDir = new Map();

for (const entry of byKey.values()) {
  if (entry.isMain) continue;
  if (!siblingsByDir.has(entry.dirAbs)) siblingsByDir.set(entry.dirAbs, []);
  siblingsByDir.get(entry.dirAbs).push(entry);
}

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
      const doc = contentInputsDoc(entry.inputsPath, tier, structureValue);
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

  // Prettier requires a blank line either side of an HTML comment.
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
