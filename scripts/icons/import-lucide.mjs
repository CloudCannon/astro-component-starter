/**
 * Replaces the Lucide icons in `src/icons/` with those of a pinned `lucide-static` release.
 *
 *   node scripts/icons/import-lucide.mjs 1.56.0
 *
 * Only canonical names (the keys of the package's `tags.json`) are copied: the package also
 * ships every deprecated alias as its own file, which would list one drawing several times in
 * the picker. Removed ids are printed because content naming one renders no icon.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const version = process.argv[2];

if (!/^\d+\.\d+\.\d+$/.test(version ?? "")) {
  console.error("Usage: node scripts/icons/import-lucide.mjs <exact lucide-static version>");
  process.exit(1);
}

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const iconsDir = join(root, "src", "icons");
const LUCIDE_SIGNATURE = "@license lucide-static";

const work = mkdtempSync(join(tmpdir(), "lucide-static-"));

try {
  const tarball = execFileSync(
    "npm",
    ["pack", `lucide-static@${version}`, "--silent", "--pack-destination", work],
    { encoding: "utf8" }
  ).trim();

  execFileSync("tar", ["-xzf", join(work, tarball), "-C", work]);

  const pkg = join(work, "package");
  const canonical = Object.keys(JSON.parse(readFileSync(join(pkg, "tags.json"), "utf8"))).sort();

  const topLevel = readdirSync(iconsDir).filter((name) => name.endsWith(".svg"));
  const previous = new Set();
  const others = new Set();

  for (const file of topLevel) {
    const id = file.replace(/\.svg$/, "");

    if (readFileSync(join(iconsDir, file), "utf8").includes(LUCIDE_SIGNATURE)) previous.add(id);
    else others.add(id);
  }

  const collisions = canonical.filter((id) => others.has(id));

  if (collisions.length) {
    console.error(`Lucide ${version} would overwrite non-Lucide icons: ${collisions.join(", ")}`);
    process.exit(1);
  }

  for (const id of previous) rmSync(join(iconsDir, `${id}.svg`));
  for (const id of canonical)
    copyFileSync(join(pkg, "icons", `${id}.svg`), join(iconsDir, `${id}.svg`));
  copyFileSync(join(pkg, "LICENSE"), join(iconsDir, "LICENSE-lucide.txt"));

  const next = new Set(canonical);
  const removed = [...previous].filter((id) => !next.has(id));

  console.log(`Imported ${canonical.length} Lucide icons from lucide-static@${version}.`);
  if (removed.length)
    console.log(`Removed ids (fix any content that names them): ${removed.join(", ")}`);
  console.log("Next: npm run icons:sync, and update the version in src/icons/README.md.");
} finally {
  rmSync(work, { recursive: true, force: true });
}
