/**
 * Sync agent skills from the canonical source to the tool-specific dirs.
 *
 * `.agents/skills/` is the single source of truth for agent skills (one
 * directory per skill, each with a SKILL.md). `.cursor/skills/` and
 * `.claude/skills/` are generated, byte-identical copies read by Cursor and
 * Claude Code respectively — never hand-edit them.
 *
 *   node scripts/skills/sync.mjs           regenerate both copies
 *   node scripts/skills/sync.mjs --check   verify copies match the canonical tree (CI)
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const mode = process.argv.includes("--check") ? "check" : "write";
const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");

const sourceDir = join(root, ".agents", "skills");
const targets = [join(root, ".cursor", "skills"), join(root, ".claude", "skills")];

/** Recursively collect POSIX-style relative paths of every file under `dir`. */
function listFiles(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name);

    if (entry.isDirectory()) {
      listFiles(absolute, base, out);
    } else if (entry.isFile()) {
      out.push(relative(base, absolute).split(sep).join("/"));
    }
  }
  return out;
}

if (mode === "write") {
  for (const target of targets) {
    rmSync(target, { recursive: true, force: true });
    mkdirSync(target, { recursive: true });
    cpSync(sourceDir, target, { recursive: true });
    console.log(`synced ${relative(root, sourceDir)} -> ${relative(root, target)}`);
  }
  process.exit(0);
}

// --check: compare each target tree against the canonical tree without writing.
const sourceFiles = new Set(listFiles(sourceDir));
let failures = 0;

for (const target of targets) {
  const targetLabel = relative(root, target);
  let targetFiles;

  try {
    targetFiles = new Set(listFiles(target));
  } catch {
    console.error(`MISSING  ${targetLabel} (directory does not exist)`);
    failures += 1;
    continue;
  }

  const missing = [...sourceFiles].filter((file) => !targetFiles.has(file)).sort();
  const extra = [...targetFiles].filter((file) => !sourceFiles.has(file)).sort();
  const drifted = [...sourceFiles]
    .filter((file) => targetFiles.has(file))
    .filter((file) => !readFileSync(join(sourceDir, file)).equals(readFileSync(join(target, file))))
    .sort();

  if (missing.length || extra.length || drifted.length) {
    failures += 1;
    console.error(`DRIFT  ${targetLabel}`);
    for (const file of missing) console.error(`   missing: ${file}`);
    for (const file of extra) console.error(`   extra:   ${file}`);
    for (const file of drifted) console.error(`   changed: ${file}`);
  } else {
    console.log(`ok     ${targetLabel}`);
  }
}

if (failures) {
  console.error(
    `\n${failures} dir(s) out of sync with .agents/skills/. Edit .agents/skills/ and run: npm run skills:sync`
  );
  process.exit(1);
}
