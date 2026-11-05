// Coverage and wiring only; SVG-vs-recipe drift is `previews:build --check`.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { glob, globSync } from "glob";
import * as yaml from "js-yaml";
import { previewImagePath, snippetWantsPreviewImage } from "./wire-yaml.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const previewsDir = join(root, "public", "component-previews");

// Must discover exactly the set build.mjs previews.
const structureFiles = await glob("src/components/**/*.cloudcannon.structure-value.yml", {
  cwd: root,
});

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

const recipeless = [];

for (const component of components) {
  const componentDir = dirname(join(root, componentFile.get(component)));

  if (!globSync("*.preview.mjs", { cwd: componentDir }).length) {
    recipeless.push(component);
  }
}

const expectedSvgs = new Set(components.map((component) => `${component}.svg`));
const missing = components.filter(
  (component) => !existsSync(join(previewsDir, `${component}.svg`))
);

const svgFiles = globSync("**/*.svg", {
  cwd: previewsDir,
}).map((file) => file.split(sep).join("/"));

const orphans = svgFiles.filter((svg) => !expectedSvgs.has(svg)).sort();

const unwired = [];

for (const component of components) {
  const file = componentFile.get(component);
  const absFile = join(root, file);
  const imageLine = `image: ${previewImagePath(component)}`;
  const source = readFileSync(absFile, "utf8");

  if (!source.includes(imageLine) || !source.includes("fit: cover")) {
    unwired.push({ component, file });
  }

  const snippetFile = file.replace(
    /\.cloudcannon\.structure-value\.yml$/,
    ".cloudcannon.snippets.yml"
  );

  if (existsSync(join(root, snippetFile))) {
    const snippetSource = readFileSync(join(root, snippetFile), "utf8");

    if (
      snippetWantsPreviewImage(snippetSource) &&
      (!snippetSource.includes(imageLine) || !snippetSource.includes("fit: cover"))
    ) {
      unwired.push({ component, file: snippetFile });
    }
  }
}

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
    console.error(`   ${file} needs: image: ${previewImagePath(component)} and gallery.fit: cover`);
  }
}

console.error(
  `\nPreview drift detected. Add any missing \`*.preview.mjs\` recipe, then run ` +
    `\`npm run previews:build\` to (re)compile SVGs and wire them in.`
);
process.exit(1);
