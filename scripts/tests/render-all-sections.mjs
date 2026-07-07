/**
 * Render-everything smoke test.
 *
 * Assembles a temporary page whose `pageSections` contains the default
 * `value` of every structure-value file (i.e. every component offered in the
 * CloudCannon page builder), then runs a production build. If any component
 * throws on its own advertised defaults — or a `_component` path points at a
 * component that no longer exists — the build fails and so does this script.
 *
 *   node scripts/tests/render-all-sections.mjs
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { glob } from "glob";
import yaml from "js-yaml";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const fixturePath = join(root, "src/content/pages/kitchen-sink-render-test.md");

// Form fields live inside `formBlocks` arrays, not `pageSections` (they have
// inputs.yml but no structure-value.yml), so globbing structure-values gives
// exactly the set of blocks a CloudCannon editor can place on a page.
const structureFiles = await glob("src/components/**/*.cloudcannon.structure-value.yml", {
  cwd: root,
});

const sections = [];
const skipped = [];

for (const file of structureFiles.sort()) {
  const structure = yaml.load(readFileSync(join(root, file), "utf8"));
  const value = structure?.value;

  if (!value?._component) {
    skipped.push(file);
    continue;
  }

  const componentDir = join(root, "src/components", value._component);

  if (!existsSync(componentDir)) {
    console.error(`DANGLING _component "${value._component}" in ${file}`);
    process.exitCode = 1;
    continue;
  }

  sections.push(value);
}

if (process.exitCode) process.exit(process.exitCode);
if (skipped.length) {
  console.warn(`Skipped ${skipped.length} structure file(s) without a value._component:`);
  for (const file of skipped) console.warn(`  ${file}`);
}

console.log(`Rendering ${sections.length} component structure defaults…`);

const page = `---\n${yaml.dump(
  {
    title: "Kitchen sink render test",
    noindex: true,
    pageSections: sections,
  },
  { noRefs: true, lineWidth: -1 }
)}---\n`;

writeFileSync(fixturePath, page);

try {
  execSync("npx astro build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, DISABLE_COMPONENT_LIBRARY: "true" },
  });

  const output = join(root, "dist/kitchen-sink-render-test/index.html");

  if (!existsSync(output)) {
    console.error("Build succeeded but the kitchen-sink page was not emitted.");
    process.exit(1);
  }
  console.log(`OK: all ${sections.length} structure defaults rendered.`);
} finally {
  rmSync(fixturePath, { force: true });
}
