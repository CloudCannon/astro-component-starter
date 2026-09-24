/**
 * Heroicons (`data-slot="icon"`) are covered by `LICENSE-heroicons.txt`; every other SVG
 * in `src/icons/` must open with its own record:
 *   <!-- Source: Simple Icons (https://simpleicons.org) | License: CC0-1.0 -->
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const iconsDir = join(root, "src", "icons");

const HEROICONS_SIGNATURE = 'data-slot="icon"';

const HEADER = /^\s*<!--\s*Source:\s*([^|]+?)\s*\|\s*License:\s*(.+?)\s*-->\s*<svg\b/;

/** Enough of an SPDX identifier to reject "see website" and free-text answers. */
const SPDX_ID = /^[A-Za-z0-9][A-Za-z0-9.+-]*$/;

function listSvgs(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);

    if (entry.isDirectory()) {
      listSvgs(absolute, base, out);
    } else if (entry.isFile() && entry.name.endsWith(".svg")) {
      out.push(relative(base, absolute).split(sep).join("/"));
    }
  }
  return out;
}

const failures = [];
let recorded = 0;

for (const path of listSvgs(iconsDir)) {
  const source = readFileSync(join(iconsDir, path), "utf8");

  if (source.includes(HEROICONS_SIGNATURE)) continue;

  const header = HEADER.exec(source);

  if (!header) {
    failures.push(`unrecorded: ${path} (no Source/License header)`);
  } else if (!SPDX_ID.test(header[2])) {
    failures.push(`unlicensed: ${path} (License "${header[2]}" is not an SPDX id)`);
  } else {
    recorded += 1;
  }
}

if (failures.length) {
  console.error("ERROR  src/icons/ — third-party icons must record their source and license");
  for (const failure of failures) console.error(`   ${failure}`);
  console.error("\nGive each file above a leading comment, e.g.");
  console.error("   <!-- Source: Simple Icons (https://simpleicons.org) | License: CC0-1.0 -->");
  console.error("\nSee .agents/skills/adding-icons/SKILL.md and src/icons/README.md.");
  process.exit(1);
}

console.log(`ok     src/icons/ (${recorded} third-party icons, all recorded)`);
