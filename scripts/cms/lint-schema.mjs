/**
 * Validates the CloudCannon YAML against the official JSON Schemas from
 * `@cloudcannon/configuration-types` — invalid keys, out-of-enum values, wrong
 * input types.
 *
 *   node scripts/cms/lint-schema.mjs [--only <substring>]
 *
 * Complements `lint:cms`, which checks the same files against the *components*
 * (prop drift, `_component` resolution). Neither subsumes the other.
 *
 * Error formatting is delegated to the package's `loadValidator`: it suppresses
 * non-matching union-branch noise, which raw Ajv output drowns in.
 */
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

// Each glob is validated against the schema for the `*_from_glob` key that
// loads it in cloudcannon.config.yml — the same names the schema package uses,
// so this mapping stays auditable against the loader.
const TARGETS = [
  // The root config itself. Easy to forget because it isn't glob-collected, but
  // it holds the `data_config` datasets and collection `_inputs` that every
  // component leans on — and a stray key here fails the same silent way.
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

    const errors = validate(data);

    if (errors.length) {
      failures.push({
        file,
        schema,
        problems: errors.map(
          ({ error, message }) => `${formatInstancePath(error.instancePath, data)} — ${message}`
        ),
      });
    }
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
