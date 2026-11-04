// Uses the package's `loadValidator`, not raw Ajv, which drowns in union-branch noise.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { glob } from "glob";
import * as yaml from "js-yaml";
import {
  formatInstancePath,
  loadValidator,
} from "@cloudcannon/configuration-types/dist/validate.js";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

// Each glob's schema must match the `*_from_glob` key that loads it in cloudcannon.config.yml.
const TARGETS = [
  {
    schema: "global",
    pattern: "cloudcannon.config.yml",
  },
  {
    schema: "values_from_glob",
    pattern: "src/components/**/*.cloudcannon.structure-value.yml",
  },
  {
    schema: "_inputs_from_glob",
    pattern: "src/components/**/*.cloudcannon.inputs.yml",
  },
  {
    schema: "_snippets_from_glob",
    pattern: "src/components/**/*.cloudcannon.snippets.yml",
  },
  {
    schema: "_structures_from_glob",
    pattern: ".cloudcannon/structures/*.cloudcannon.structures.yml",
  },
];

// The schema types `preview`/`picker_preview` icons as any string, so it never checks them.
const iconNames = new Set(
  JSON.parse(
    readFileSync(
      join(
        root,
        "node_modules/@cloudcannon/configuration-types/dist/cloudcannon-config.latest.schema.json"
      ),
      "utf8"
    )
  ).definitions.icon.enum
);

function previewIconProblems(node, path = [], inPreview = false, out = []) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => previewIconProblems(item, [...path, index], inPreview, out));
    return out;
  }
  if (!node || typeof node !== "object") return out;

  for (const [key, value] of Object.entries(node)) {
    const here = [...path, key];
    const preview = inPreview || key === "preview" || key === "picker_preview";

    if (preview && key === "icon") {
      for (const name of [value].flat()) {
        if (typeof name === "string" && !iconNames.has(name)) {
          out.push(`${here.join(".")} — "${name}" is not a Material Symbols icon name`);
        }
      }
    }
    previewIconProblems(value, here, preview, out);
  }
  return out;
}

let checked = 0;
const failures = [];

for (const { schema, pattern } of TARGETS) {
  const { validate } = await loadValidator(schema);

  let files = (await glob(pattern, { cwd: root })).sort();

  if (only) files = files.filter((file) => file.includes(only));

  for (const file of files) {
    checked++;

    let data;

    try {
      data = yaml.load(readFileSync(join(root, file), "utf8"));
    } catch (error) {
      failures.push({ file, schema, problems: [`YAML parse error: ${error.message}`] });
      continue;
    }

    const problems = [
      ...validate(data).map(
        ({ error, message }) => `${formatInstancePath(error.instancePath, data)} — ${message}`
      ),
      ...previewIconProblems(data),
    ];

    if (problems.length) failures.push({ file, schema, problems });
  }
}

if (!failures.length) {
  console.log(`ok     ${checked} CloudCannon YAML file(s) valid against the official schemas.`);
  process.exit(0);
}

for (const { file, schema, problems } of failures) {
  console.error(`FAIL   ${file}  [${schema}]`);
  for (const problem of problems) console.error(`   ${problem}`);
}

console.error(
  `\n${failures.length} of ${checked} file(s) rejected by the CloudCannon schema. ` +
    `Invalid keys and out-of-enum values are accepted silently by the editor ` +
    `(the field or icon just falls back), so these never surface at runtime.`
);
process.exit(1);
