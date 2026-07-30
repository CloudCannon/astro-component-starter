/**
 * Recipe compiler — turns co-located `*.preview.mjs` recipes into the committed
 * preview SVGs and wires them into each component's structure-value YAML.
 *
 *   node scripts/previews/build.mjs [--only <substring>] [--check]
 *
 *   --only <str>   Only build components whose key contains <str>.
 *   --check        Don't write; exit 1 if any output would change (CI drift).
 *
 * Deterministic and browser-free: same recipes → same SVGs. A component's key
 * is its directory path under `src/components/` (the `_component` string).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "glob";
import { compile } from "./kit.mjs";
import { wirePreviewImage, wireSnippetPreviewImage } from "./wire-yaml.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const componentsDir = join(root, "src", "components");
const outDir = join(root, "public", "component-previews");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const checkOnly = args.includes("--check");

// A recipe lives beside its component; the component key is the recipe's
// directory relative to src/components/ (POSIX-separated).
function keyForRecipe(file) {
  return relative(componentsDir, dirname(join(root, file)))
    .split(sep)
    .join("/");
}

const recipeFiles = (await glob("src/components/**/*.preview.mjs", { cwd: root })).sort();

let recipes = recipeFiles.map((file) => ({ file, key: keyForRecipe(file) }));

if (only) recipes = recipes.filter((r) => r.key.includes(only));

if (!recipes.length) {
  console.error(only ? `No recipes match "${only}".` : "No *.preview.mjs recipes found.");
  process.exit(1);
}

const drift = [];
const failures = [];
let written = 0;
let wiredCount = 0;

for (const { file, key } of recipes) {
  try {
    const mod = await import(pathToFileURL(join(root, file)).href);
    const recipe = mod.default;
    const tree = typeof recipe === "function" ? recipe() : recipe;

    if (!tree || typeof tree !== "object") {
      throw new Error(
        "recipe default export must be a preview({...}) spec (or a function returning one)"
      );
    }

    const svg = compile(tree, key);
    const outPath = join(outDir, `${key}.svg`);
    const existing = existsSync(outPath) ? readFileSync(outPath, "utf8") : null;

    if (existing !== svg) {
      drift.push(key);
      if (!checkOnly) {
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, svg);
        written++;
      }
    }

    if (!checkOnly) {
      // Wire the SVG path into the structure-value YAML.
      const structFile = join(root, file).replace(
        /\.preview\.mjs$/,
        ".cloudcannon.structure-value.yml"
      );

      if (existsSync(structFile)) {
        const wired = wirePreviewImage(key, structFile);

        if (wired === "written") wiredCount++;
      }

      // Components that are also MDX snippets get the same thumbnail in the
      // snippet picker. Only some components have a snippets file.
      const snippetFile = join(root, file).replace(/\.preview\.mjs$/, ".cloudcannon.snippets.yml");

      if (existsSync(snippetFile)) {
        const wired = wireSnippetPreviewImage(key, snippetFile);

        if (wired === "written") wiredCount++;
      }
    }

    console.log(`  ${existing === svg ? "·" : "✓"} ${key}`);
  } catch (error) {
    failures.push(key);
    console.error(`  ✗ ${key}: ${error.message.split("\n")[0]}`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} recipe(s) failed: ${failures.join(", ")}`);
  process.exit(1);
}

if (checkOnly) {
  if (drift.length) {
    console.error(
      `\n${drift.length} preview(s) out of date: ${drift.join(", ")}\n` +
        `Run \`npm run previews:build\` and commit the result.`
    );
    process.exit(1);
  }
  console.log(`\nok  ${recipes.length} recipes, all SVGs up to date.`);
} else {
  console.log(
    `\nDone. ${written} SVG(s) written, ${wiredCount} YAML(s) wired. ${recipes.length} recipes total.`
  );
}
