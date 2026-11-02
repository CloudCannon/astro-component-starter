/**
 * Fails on an icon id that names no SVG in `src/icons/`. Icon renders nothing for an unknown id
 * and only warns in dev, so a typo or a renamed icon otherwise ships as an empty element.
 *
 * Reads icon props in content frontmatter, `src/data/*.json`, the `value:` seeds of every
 * structure YAML (the `icon:` beside them is a Material Symbol, not ours), and literal
 * `iconName`/`name`/`getIcon()` ids in `.astro` and `.mdx` source.
 */
import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { glob } from "glob";
import { frontmatter, loadYaml } from "../lib/componentModel.mjs";
import { iconKeyFromPath } from "../../src/components/utils/iconKey.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const rel = (p) => relative(root, p);
const files = (pattern) => glob(pattern, { cwd: root, absolute: true });

const known = new Set((await files("src/icons/**/*.svg")).map((p) => iconKeyFromPath(rel(p))));

const ICON_KEYS = new Set(["iconName", "triggerIconName", "icon"]);
const isIconComponent = (node) =>
  typeof node._component === "string" && node._component.endsWith("core-elements/icon");

const failures = [];
let checked = 0;

function checkId(id, where) {
  if (typeof id !== "string" || id.trim() === "") return;
  checked += 1;
  if (!known.has(id.trim())) failures.push(`${where}: unknown icon "${id}"`);
}

function walkData(node, where) {
  if (Array.isArray(node)) return node.forEach((item) => walkData(item, where));
  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if (ICON_KEYS.has(key) && typeof value === "string") checkId(value, where);
    else if (key === "name" && isIconComponent(node)) checkId(value, where);
    else walkData(value, where);
  }
}

function walkStructureYaml(node, where) {
  if (Array.isArray(node)) return node.forEach((item) => walkStructureYaml(item, where));
  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if (key === "value") walkData(value, where);
    else walkStructureYaml(value, where);
  }
}

const SOURCE_PATTERNS = [
  /\b(?:iconName|triggerIconName)\s*=\s*"([^"{}]+)"/g,
  /<Icon\b[^>]*?\sname="([^"{}]+)"/g,
  /\bgetIcon\(\s*"([^"]+)"\s*\)/g,
];

for (const abs of await files("src/{content,component-docs/content}/**/*.{md,mdx}")) {
  const source = readFileSync(abs, "utf8");

  walkData(frontmatter(source), rel(abs));

  if (abs.endsWith(".mdx"))
    for (const pattern of SOURCE_PATTERNS)
      for (const match of source.matchAll(pattern)) checkId(match[1], rel(abs));
}

for (const abs of await files("src/data/*.json"))
  walkData(JSON.parse(readFileSync(abs, "utf8")), rel(abs));

for (const abs of await files("{src/components,.cloudcannon/structures}/**/*.cloudcannon.*.yml"))
  walkStructureYaml(loadYaml(abs), rel(abs));

for (const abs of await files("src/**/*.astro")) {
  const source = readFileSync(abs, "utf8");

  for (const pattern of SOURCE_PATTERNS)
    for (const match of source.matchAll(pattern)) checkId(match[1], rel(abs));
}

if (failures.length) {
  console.error("ERROR  icon ids that name no SVG in src/icons/ (they render nothing):");
  for (const failure of failures) console.error(`   ${failure}`);
  console.error("\nPick an id from .cloudcannon/data/icons.yml (https://lucide.dev/icons/).");
  process.exit(1);
}

console.log(`ok     ${checked} icon references resolve`);
