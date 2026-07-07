/**
 * Generate or verify CloudCannon YAML from component manifests.
 *
 *   node scripts/manifest/generate.mjs --check   verify committed YAML matches manifests (CI)
 *   node scripts/manifest/generate.mjs --write   regenerate YAML from manifests
 *
 * Only components with a `*.manifest.mjs` file are covered; everything else
 * keeps the handwritten workflow. See docs/component-manifest-design.md.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "glob";
import yaml from "js-yaml";
import { buildInputs, buildStructureValue } from "./lib.mjs";

const mode = process.argv.includes("--write") ? "write" : "check";
const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");

/** Recursively collect paths where two values differ. */
function diffPaths(expected, actual, path = "") {
  if (expected === actual) return [];

  const isObj = (v) => typeof v === "object" && v !== null;

  if (!isObj(expected) || !isObj(actual)) {
    return [
      `${path || "(root)"}: manifest has ${JSON.stringify(expected)}, file has ${JSON.stringify(actual)}`,
    ];
  }

  const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
  const diffs = [];

  for (const key of keys) {
    diffs.push(...diffPaths(expected[key], actual[key], path ? `${path}.${key}` : key));
  }
  return diffs;
}

function dump(value) {
  return yaml.dump(value, { indent: 2, lineWidth: -1, noRefs: true });
}

const manifestPaths = await glob("src/components/**/*.manifest.mjs", { cwd: root });
let failures = 0;

for (const manifestPath of manifestPaths.sort()) {
  const absolute = join(root, manifestPath);
  const { default: manifest } = await import(pathToFileURL(absolute).href);
  const componentDir = dirname(absolute);
  const componentName = manifest.component.split("/").at(-1);

  const outputs = [
    { file: `${componentName}.cloudcannon.inputs.yml`, value: buildInputs(manifest) },
    {
      file: `${componentName}.cloudcannon.structure-value.yml`,
      value: buildStructureValue(manifest),
    },
  ];

  for (const { file, value } of outputs) {
    const target = join(componentDir, file);
    const targetLabel = relative(root, target);

    if (mode === "write") {
      writeFileSync(target, dump(value));
      console.log(`wrote  ${targetLabel}`);
      continue;
    }

    let existing;

    try {
      existing = yaml.load(readFileSync(target, "utf8"));
    } catch {
      console.error(`MISSING ${targetLabel} (run with --write)`);
      failures += 1;
      continue;
    }

    const diffs = diffPaths(value, existing);

    if (diffs.length) {
      failures += 1;
      console.error(`DRIFT  ${targetLabel}`);
      for (const diff of diffs) console.error(`   ${diff}`);
    } else {
      console.log(`ok     ${targetLabel}`);
    }
  }
}

if (mode === "check" && failures) {
  console.error(
    `\n${failures} file(s) out of sync with their manifest. Edit the *.manifest.mjs and run: npm run manifest:write`
  );
  process.exit(1);
}

if (!manifestPaths.length) {
  console.log("No *.manifest.mjs files found.");
}
