/**
 * Fast component-preview coverage check (no browser, no build).
 *
 * Previews are authored as co-located `*.preview.mjs` recipes and compiled to
 * SVGs by `previews:build` (deterministic, browser-free). This check is the
 * cheap coherence gate: it only reads files and asserts the preview set lines up.
 *
 *   node scripts/previews/check.mjs
 *
 * Fails (exit 1) if:
 *   - a component (any `*.cloudcannon.structure-value.yml` with a
 *     `value._component`) has no sibling `*.preview.mjs` recipe;
 *   - a component has no `public/component-previews/<_component>.svg`;
 *   - an SVG under `public/component-previews/` matches no component (orphan);
 *   - a component's structure YAML is missing the
 *     `image: /component-previews/<_component>.svg` wiring.
 *
 * The "are the committed SVGs in sync with their recipes?" drift guard is
 * `previews:build --check`, run alongside this in `previews:check`.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { glob, globSync } from "glob";
import * as yaml from "js-yaml";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const previewsDir = join(root, "public", "component-previews");

// ---------------------------------------------------------------------------
// 1. Discover components — exactly the set generate.mjs previews.
// ---------------------------------------------------------------------------

const structureFiles = await glob("src/components/**/*.cloudcannon.structure-value.yml", {
  cwd: root,
});

// component key -> the structure-value file it came from.
const componentFile = new Map();

for (const file of structureFiles) {
  const key = yaml.load(readFileSync(join(root, file), "utf8"))?.value?._component;

  if (key) componentFile.set(key, file);
}

const components = [...componentFile.keys()].sort();

if (!components.length) {
  console.error("No structure-value files with a value._component found.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2a. Recipe presence: every component has a sibling `*.preview.mjs`.
// ---------------------------------------------------------------------------

const recipeless = [];

for (const component of components) {
  const componentDir = dirname(join(root, componentFile.get(component)));

  if (!globSync("*.preview.mjs", { cwd: componentDir }).length) {
    recipeless.push(component);
  }
}

// ---------------------------------------------------------------------------
// 2b. Coverage: every component has a built SVG.
// ---------------------------------------------------------------------------

const expectedSvgs = new Set(components.map((component) => `${component}.svg`));
const missing = components.filter(
  (component) => !existsSync(join(previewsDir, `${component}.svg`))
);

// ---------------------------------------------------------------------------
// 3. Orphans: every SVG maps back to a component.
// ---------------------------------------------------------------------------

const svgFiles = globSync("**/*.svg", {
  cwd: previewsDir,
}).map((file) => file.split(sep).join("/"));

const orphans = svgFiles.filter((svg) => !expectedSvgs.has(svg)).sort();

// ---------------------------------------------------------------------------
// 4. Wiring: every component references its SVG in its structure YAML.
// ---------------------------------------------------------------------------

const unwired = [];

for (const component of components) {
  const file = componentFile.get(component);
  const absFile = join(root, file);
  const imageLine = `image: /component-previews/${component}.svg`;

  if (!readFileSync(absFile, "utf8").includes(imageLine)) {
    unwired.push({ component, file });
  }
}

// ---------------------------------------------------------------------------
// 5. Report.
// ---------------------------------------------------------------------------

if (!recipeless.length && !missing.length && !orphans.length && !unwired.length) {
  console.log(`ok     ${components.length} components, ${svgFiles.length} previews in sync`);
  process.exit(0);
}

if (recipeless.length) {
  console.error(`MISSING recipe for ${recipeless.length} component(s):`);
  for (const component of recipeless) {
    console.error(`   ${component} -> needs a sibling <name>.preview.mjs`);
  }
}

if (missing.length) {
  console.error(`MISSING preview SVG for ${missing.length} component(s):`);
  for (const component of missing) {
    console.error(`   ${component} -> public/component-previews/${component}.svg`);
  }
}

if (orphans.length) {
  console.error(`ORPHAN preview SVG(s) with no matching component:`);
  for (const svg of orphans) console.error(`   public/component-previews/${svg}`);
}

if (unwired.length) {
  console.error(`UNWIRED — structure YAML missing the preview image line:`);
  for (const { component, file } of unwired) {
    console.error(`   ${file} needs: image: /component-previews/${component}.svg`);
  }
}

console.error(
  `\nPreview drift detected. Add any missing \`*.preview.mjs\` recipe, then run ` +
    `\`npm run previews:build\` to (re)compile SVGs and wire them in.`
);
process.exit(1);
