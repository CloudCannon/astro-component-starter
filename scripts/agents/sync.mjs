/**
 * Generate the tool-specific agent directories from the canonical `.agents/` tree.
 *
 *   .agents/skills/<skill>/**   ->  .claude/skills/<skill>/**   (byte copy; Cursor reads the source)
 *   .agents/rules/<name>.md     ->  .cursor/rules/<name>.mdc    (byte copy; Claude Code imports the source from CLAUDE.md)
 *
 * Never hand-edit a target — it is deleted and rebuilt on every run.
 *
 *   node scripts/agents/sync.mjs           regenerate every target
 *   node scripts/agents/sync.mjs --check   verify targets match the source (CI)
 */
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const mode = process.argv.includes("--check") ? "check" : "write";
const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");

const mappings = [
  {
    source: join(root, ".agents", "skills"),
    target: join(root, ".claude", "skills"),
    rename: (file) => file,
  },
  {
    source: join(root, ".agents", "rules"),
    target: join(root, ".cursor", "rules"),
    rename: (file) => file.replace(/\.md$/, ".mdc"),
  },
];

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
  for (const { source, target, rename } of mappings) {
    rmSync(target, { recursive: true, force: true });
    for (const file of listFiles(source)) {
      const destination = join(target, rename(file));

      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(join(source, file), destination);
    }
    console.log(`synced ${relative(root, source)} -> ${relative(root, target)}`);
  }
  process.exit(0);
}

let failures = 0;

for (const { source, target, rename } of mappings) {
  const targetLabel = relative(root, target);
  const expected = new Map(listFiles(source).map((file) => [rename(file), file]));
  let actual;

  try {
    actual = new Set(listFiles(target));
  } catch {
    console.error(`MISSING  ${targetLabel} (directory does not exist)`);
    failures += 1;
    continue;
  }

  const missing = [...expected.keys()].filter((file) => !actual.has(file)).sort();
  const extra = [...actual].filter((file) => !expected.has(file)).sort();
  const drifted = [...expected]
    .filter(([file]) => actual.has(file))
    .filter(
      ([file, sourceFile]) =>
        !readFileSync(join(source, sourceFile)).equals(readFileSync(join(target, file)))
    )
    .map(([file]) => file)
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
    `\n${failures} dir(s) out of sync with .agents/. Edit .agents/ and run: npm run agents:sync`
  );
  process.exit(1);
}
