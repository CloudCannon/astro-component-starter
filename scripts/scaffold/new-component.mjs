/**
 * Scaffold a new component: the .astro file plus its co-located CloudCannon
 * YAML, so none of the create-component steps can be forgotten.
 *
 *   node scripts/scaffold/new-component.mjs <tier/path/kebab-name>
 *
 *   node scripts/scaffold/new-component.mjs building-blocks/core-elements/badge
 *   node scripts/scaffold/new-component.mjs page-sections/features/feature-tabs
 *
 * Generates into src/components/<path>/:
 *   - <PascalCase>.astro                        (destructure + minimal markup + layered styles)
 *   - <kebab>.cloudcannon.inputs.yml            (one example input)
 *   - <kebab>.cloudcannon.structure-value.yml   (label/icon/value/previews/_inputs_from_glob;
 *                                                page sections also get the shared section-wrapper
 *                                                `_inputs` block, copied from a real page section
 *                                                so it can never drift from the live shape)
 *
 * The .agents/skills/create-component skill is the full playbook; this script
 * automates its file-creation steps and prints the remaining ones.
 *
 * Dependencies: none beyond node — templates live in ./templates.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { componentKeyFromPath, pascalToKebab } from "../../src/components/utils/componentKey.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const componentsDir = join(root, "src", "components");
const templatesDir = join(root, "scripts", "scaffold", "templates");

// The donor whose section-wrapper inputs are copied into new page sections
// (create-component skill, step 5: "don't hand-type ~180 lines"), and the marker
// line that begins that block in the donor file.
const SECTION_INPUTS_DONOR = join(
  componentsDir,
  "page-sections/ctas/cta-center/cta-center.cloudcannon.inputs.yml"
);
const SECTION_INPUTS_MARKER = "# --- section wrapper inputs (CustomSection) ---";

const die = (message) => {
  console.error(`error: ${message}`);
  process.exit(1);
};

// ---------------------------------------------------------------------------
// Parse + validate the requested path.
// ---------------------------------------------------------------------------

const rawArg = process.argv[2];

if (!rawArg || rawArg.startsWith("-")) {
  console.error(
    [
      "usage: node scripts/scaffold/new-component.mjs <tier/path/kebab-name>",
      "",
      "  node scripts/scaffold/new-component.mjs building-blocks/core-elements/badge",
      "  node scripts/scaffold/new-component.mjs page-sections/features/feature-tabs",
    ].join("\n")
  );
  process.exit(1);
}

const requested = rawArg.replace(/^\/+|\/+$/g, "").replace(/^src\/components\//, "");
const segments = requested.split("/");
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

for (const segment of segments) {
  if (!KEBAB.test(segment))
    die(`"${segment}" is not kebab-case (expected e.g. "feature-tabs", got "${requested}").`);
}

const tier = segments[0];
const tierLayer = { "building-blocks": "components", "page-sections": "page-sections" }[tier];

if (!tierLayer)
  die(
    `tier must be "building-blocks" or "page-sections", got "${tier}". ` +
      `(navigation/ and utils/ components are wired by hand — see the create-component skill.)`
  );

if (segments.length < 3)
  die(
    `expected <tier>/<group>/<name> (e.g. "building-blocks/core-elements/badge"), got "${requested}".`
  );

const slug = segments[segments.length - 1];
const parentRel = segments.slice(0, -1).join("/");
const parentAbs = join(componentsDir, parentRel);

if (!existsSync(parentAbs)) {
  const grandparent = join(componentsDir, segments.slice(0, -2).join("/"));
  const siblings = existsSync(grandparent)
    ? readdirSync(grandparent, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .join(", ")
    : "(none)";

  const categoryHint =
    tier === "page-sections"
      ? ` A new category is just a directory — mkdir src/components/${parentRel} and re-run.`
      : "";

  die(`src/components/${parentRel}/ does not exist. Existing options: ${siblings}.${categoryHint}`);
}

const targetAbs = join(componentsDir, requested);

if (existsSync(targetAbs)) die(`src/components/${requested}/ already exists.`);

// ---------------------------------------------------------------------------
// Derive names via the shared componentKey module (never reimplement).
// ---------------------------------------------------------------------------

const pascal = slug
  .split("-")
  .map((word) => word[0].toUpperCase() + word.slice(1))
  .join("");

// Round-trip guard: the glob registries derive the key from the filename with
// pascalToKebab, so the name must survive kebab -> Pascal -> kebab unchanged.
if (pascalToKebab(pascal) !== slug)
  die(
    `"${slug}" is not derivable from a PascalCase filename ` +
      `("${pascal}.astro" would register as "${pascalToKebab(pascal)}"). Pick another name.`
  );

const componentKey = componentKeyFromPath(`${requested}/${pascal}.astro`);

if (componentKey !== requested)
  die(`internal: derived key "${componentKey}" does not match "${requested}".`);

const label = slug
  .split("-")
  .map((word) => word[0].toUpperCase() + word.slice(1))
  .join(" ");

// ---------------------------------------------------------------------------
// Render templates.
// ---------------------------------------------------------------------------

const templateSet = tier === "page-sections" ? "page-section" : "building-block";

const render = (templateName) =>
  readFileSync(join(templatesDir, templateName), "utf8")
    .replaceAll("__PASCAL__", pascal)
    .replaceAll("__SLUG__", slug)
    .replaceAll("__KEY__", componentKey)
    .replaceAll("__LABEL__", label);

/**
 * Extract the section-wrapper inputs (verbatim text) from the donor's *inputs*
 * file — everything from the marker comment to the end of the file.
 *
 * The wrapper props live in `inputs.yml`, not in `structure-value.yml`: that is
 * where `_inputs_from_glob` already points, so both the structure value and the
 * MDX snippet pick them up from one place, and `lint:cms` can see them (it reads
 * inputs.yml and the structure-value `value:`, never an inline `_inputs:`).
 * The marker is an explicit boundary so reordering inputs can't shift the slice.
 */
function sectionInputsBlock() {
  const lines = readFileSync(SECTION_INPUTS_DONOR, "utf8").split("\n");
  const start = lines.findIndex((line) => line === SECTION_INPUTS_MARKER);

  if (start === -1) {
    die(
      `no "${SECTION_INPUTS_MARKER}" marker found in ${SECTION_INPUTS_DONOR}.\n` +
        `       The scaffolder copies the section-wrapper inputs from that marker down. ` +
        `Restore the marker line, or point SECTION_INPUTS_DONOR at another page section.`
    );
  }
  return `\n${lines.slice(start).join("\n").trimEnd()}\n`;
}

const files = {
  [`${pascal}.astro`]: render(`${templateSet}.astro.tmpl`),
  [`${slug}.cloudcannon.inputs.yml`]: render(`${templateSet}.inputs.yml.tmpl`).replace(
    "__SECTION_INPUTS__\n",
    tier === "page-sections" ? sectionInputsBlock() : ""
  ),
  [`${slug}.cloudcannon.structure-value.yml`]: render(`${templateSet}.structure-value.yml.tmpl`),
};

mkdirSync(targetAbs);
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(targetAbs, name), content);
  console.log(`created  src/components/${requested}/${name}`);
}

// ---------------------------------------------------------------------------
// Remaining manual steps (the ones a script can't do for you).
// ---------------------------------------------------------------------------

const isWrapper = requested.startsWith("building-blocks/wrappers/");

console.log(
  `
Scaffolded "${componentKey}" (label "${label}"). The render registry and Visual
Editor discover it by glob — no registration needed${isWrapper ? ", except:" : "."}
${
  isWrapper
    ? `
  ! Wrappers ARE the exception: add its structure-value.yml path to each
    .cloudcannon/structures/*Sections context where it may be placed.
`
    : ""
}
Next steps:

  1. Flesh it out: real props/markup/styles in ${pascal}.astro, then mirror
     every prop in the two .cloudcannon YAML files (defaults in structure-value,
     editor config in inputs). Replace the TODO description, pick a real
     Material Symbols icon (currently "extension"), and fix the label if the
     Title Case guess ("${label}") is wrong. Inline editing is opt-in — see the
     editable-regions skill before adding data-editable/data-prop.
  2. author {slug}.preview.mjs (a kit recipe), then npm run previews:build
     Compiles the preview SVG this component's YAML already points at
     (/component-previews/${componentKey}.svg). Until it exists,
     "npm run previews:check" (part of npm run check) fails on the missing recipe/SVG.
  3. Add a docs entry: src/component-docs/content/components/${componentKey}/index.md
     (+ an examples/ dir). The docs collection globs that directory
     (src/content.config.ts) — the page appears as soon as the file exists.${
       tier === "page-sections"
         ? `
  4. MDX-insertable? Add ${slug}.cloudcannon.snippets.yml (see the
     create-component skill).
  5. npm run check`
         : `
  4. npm run check`
     }

Full playbook: .agents/skills/create-component/SKILL.md`
);
