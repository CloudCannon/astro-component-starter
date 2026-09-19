/**
 * Fail when a third-party icon doesn't say where it came from and under what license.
 *
 * Heroicons are covered as a set: the 324 files carrying the Heroicons v2 signature
 * (`data-slot="icon"`) are redistributed under the MIT license in
 * `LICENSE-heroicons.txt`. Every other SVG under `src/icons/` — the social brand
 * marks and the two InstUI direction icons — is a one-off, and each must open with a
 * comment naming its source and its license:
 *
 *   <!-- Source: Simple Icons (https://simpleicons.org) | License: CC0-1.0 -->
 *
 * Nothing about a missing header breaks a build, and the icon renderer drops
 * everything before `<svg>` (see `normalizeIconSvg`), so the record is invisible on
 * the page. Without this check it is also invisible in review — which is how
 * unlicensed artwork gets redistributed.
 *
 *   node scripts/icons/licenses.mjs   verify every third-party icon is recorded
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const iconsDir = join(root, "src", "icons");

/** How a Heroicons file identifies itself; the rest carry their own provenance. */
const HEROICONS_SIGNATURE = 'data-slot="icon"';

/** A leading `<!-- Source: … | License: … -->` immediately above the root `<svg>`. */
const HEADER = /^\s*<!--\s*Source:\s*([^|]+?)\s*\|\s*License:\s*(.+?)\s*-->\s*<svg\b/;

/** Enough of an SPDX identifier to reject "see website" and free-text answers. */
const SPDX_ID = /^[A-Za-z0-9][A-Za-z0-9.+-]*$/;

/** Relative POSIX paths of every SVG under `dir`. */
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
