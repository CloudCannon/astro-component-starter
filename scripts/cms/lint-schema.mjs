/**
 * Schema lint — validates every CloudCannon YAML fragment against the official
 * JSON Schemas from `@cloudcannon/configuration-types`.
 *
 *   node scripts/cms/lint-schema.mjs [--only <substring>]
 *
 * This is the complement to `lint:cms`. That script checks the YAML against the
 * *components* (prop drift, orphaned files, `_component` resolution); this one
 * checks the YAML against *CloudCannon* — invalid keys, bad enum values, wrong
 * input types. Neither subsumes the other: a file can name every prop correctly
 * and still be rejected by the editor, and vice versa.
 *
 * Why schemas and not the CloudCannon CLI: this repo deliberately does not use
 * `cloudcannon configure generate` (it would flatten the co-located, glob-
 * collected config into a monolith — see .agents/skills/STYLE.md). Validation
 * carries none of that risk, and the schema package is the same authority the
 * CLI validates against, pinned in the lockfile instead of fetched at runtime.
 *
 * Error presentation is delegated to the package's own `loadValidator`, which
 * suppresses non-matching union-branch noise and appends `closest:` spelling
 * suggestions. Hand-rolling Ajv here produced misleading output: one bad key on
 * an input makes every `type` branch fail, so the raw errors blame `type` and
 * quote whichever enum the last branch happened to define.
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
