/**
 * Sync the CloudCannon icon picker with the SVGs on disk.
 *
 * Every `.svg` under `src/icons/` is the single source of truth for selectable icons.
 * `_select_data.icons` in cloudcannon.config.yml is generated from it — every
 * `select` input that references `values: _select_data.icons` shows that list,
 * and each option's thumbnail resolves through `template: src/icons/{id}.svg`.
 * An id with no SVG renders a broken preview; an SVG with no id is invisible to
 * editors. Neither shows up as an error anywhere, so the list is checked in CI.
 *
 *   node scripts/icons/sync.mjs           regenerate the block from src/icons/
 *   node scripts/icons/sync.mjs --check   verify the block matches disk (CI)
 *
 * Only the `icons:` block of the config is rewritten; the rest is untouched.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { iconKeyFromPath } from "../../src/components/utils/iconKey.mjs";

const mode = process.argv.includes("--check") ? "check" : "write";
const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");

const iconsDir = join(root, "src", "icons");
const configPath = join(root, "cloudcannon.config.yml");
const configLabel = relative(root, configPath);

/** Ids are emitted unquoted, so keep them to characters YAML never reinterprets. */
const SAFE_ID = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/;

/** Recursively collect the id of every SVG under `dir`. */
function listIcons(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);

    if (entry.isDirectory()) {
      listIcons(absolute, base, out);
    } else if (entry.isFile() && entry.name.endsWith(".svg")) {
      out.push(iconKeyFromPath(relative(base, absolute).split(sep).join("/")));
    }
  }
  return out;
}

/**
 * `arrow-down-tray` -> `Arrow Down Tray`. Subdirectories keep their separator,
 * so `social/github` -> `Social/github`, which groups the socials together in
 * the picker's alphabetical list.
 */
function titleize(id) {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const ids = listIcons(iconsDir).sort();

const invalid = ids.filter((id) => !SAFE_ID.test(id));

if (invalid.length) {
  console.error(`Unsupported icon filename(s) under ${relative(root, iconsDir)}:`);
  for (const id of invalid) console.error(`   ${id}.svg`);
  console.error("\nUse lowercase kebab-case names so the generated ids stay valid YAML.");
  process.exit(1);
}

const config = readFileSync(configPath, "utf8");
const lines = config.split("\n");

// The block is `  icons:` under `_select_data:`, running until the first line
// that is neither blank nor an indented list entry.
const start = lines.findIndex((line) => line === "  icons:");

if (start === -1) {
  console.error(`Could not find the \`  icons:\` block in ${configLabel}.`);
  process.exit(1);
}

let end = start + 1;

while (end < lines.length && /^ {4,}\S/.test(lines[end])) end += 1;

const generated = ids.flatMap((id) => [`    - id: ${id}`, `      name: ${titleize(id)}`]);
const updated = [...lines.slice(0, start + 1), ...generated, ...lines.slice(end)].join("\n");

if (mode === "write") {
  if (updated === config) {
    console.log(`ok     ${configLabel} (${ids.length} icons)`);
  } else {
    writeFileSync(configPath, updated);
    console.log(`synced ${configLabel} (${ids.length} icons)`);
  }
  process.exit(0);
}

// --check: report which ids drifted rather than just that the file differs.
if (updated === config) {
  console.log(`ok     ${configLabel} (${ids.length} icons)`);
  process.exit(0);
}

const listed = lines
  .slice(start + 1, end)
  .map((line) => line.match(/^ {4}- id: (.+)$/)?.[1])
  .filter(Boolean);

const onDisk = new Set(ids);
const inConfig = new Set(listed);
const missing = ids.filter((id) => !inConfig.has(id));
const orphaned = listed.filter((id) => !onDisk.has(id));

console.error(`DRIFT  ${configLabel} — _select_data.icons is out of sync with src/icons/`);
for (const id of missing) console.error(`   missing:  ${id} (SVG on disk, not in the picker)`);
for (const id of orphaned) console.error(`   orphaned: ${id} (in the picker, no SVG on disk)`);
if (!missing.length && !orphaned.length) {
  console.error("   the ids match but their names or ordering do not");
}

console.error("\nRun: npm run icons:sync");
process.exit(1);
