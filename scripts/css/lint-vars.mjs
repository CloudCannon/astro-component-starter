/**
 * Every `var(--x)` in `src/` must resolve to a declared custom property.
 *
 *   node scripts/css/lint-vars.mjs [--list]
 *
 * An unresolved `var()` is invalid at computed-value time, so the property
 * silently inherits — no error in review, the build, or usually the page.
 *
 * Unused tokens are deliberately not flagged: the token layer is the starter's
 * public theming API, so a token no brand happens to use is not a bug.
 */
import { readFileSync } from "node:fs";
import { glob } from "glob";

const args = process.argv.slice(2);
const list = args.includes("--list");

const SOURCES = ["src/**/*.{css,astro,ts,tsx,js,mjs}", "*.{js,mjs}"];

/** Emitted by Astro's `<Font />`, one per family — never declared in CSS. */
function externallyInjected() {
  const src = readFileSync("site-fonts.mjs", "utf8");

  return new Set([...src.matchAll(/cssVariable:\s*["'](--[a-zA-Z0-9-]+)["']/g)].map((m) => m[1]));
}

// Optional quote matches the `style={{ "--name": … }}` form in .astro templates.
const DECL = /(--[a-zA-Z0-9-]+)["']?\s*:/g;

// Trailing delimiter classifies the reference: `)` must resolve, `,` has a
// fallback, anything else is a built name (`var(--spacing-${gap})`).
const REF = /var\(\s*(--[a-zA-Z0-9-]+)\s*([,)]?)/g;

function levenshtein(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];

    prev[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const next = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));

      diag = prev[j];
      prev[j] = next;
    }
  }

  return prev[b.length];
}

function closest(name, candidates) {
  let best = null;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const score = levenshtein(name, candidate);

    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // Past roughly a third of the name being wrong it stops being a useful hint.
  return bestScore <= Math.max(3, Math.ceil(name.length / 3)) ? best : null;
}

const files = [...new Set((await Promise.all(SOURCES.map((p) => glob(p)))).flat())].sort();

const declared = new Set(externallyInjected());
const refs = [];
let dynamic = 0;
let withFallback = 0;

for (const file of files) {
  const source = readFileSync(file, "utf8");

  for (const [, name] of source.matchAll(DECL)) declared.add(name);

  const lines = source.split("\n");

  lines.forEach((line, index) => {
    for (const [, name, delimiter] of line.matchAll(REF)) {
      if (delimiter === ",") {
        withFallback++;
        continue;
      }

      if (delimiter !== ")") {
        dynamic++;
        continue;
      }

      refs.push({ file, line: index + 1, name });
    }
  });
}

const undeclared = refs.filter((ref) => !declared.has(ref.name));

if (list) {
  for (const name of [...declared].sort()) console.log(name);
  process.exit(0);
}

const summary =
  `${declared.size} declared, ${refs.length} resolvable reference(s) ` +
  `(${withFallback} with fallback, ${dynamic} dynamic) across ${files.length} file(s)`;

if (!undeclared.length) {
  console.log(`ok     every var() resolves — ${summary}.`);
  process.exit(0);
}

const names = [...declared];

for (const { file, line, name } of undeclared) {
  const hint = closest(name, names);

  console.error(`FAIL   ${file}:${line}  ${name}${hint ? `  — closest: ${hint}` : ""}`);
}

console.error(
  `\n${undeclared.length} unresolved custom propert${undeclared.length === 1 ? "y" : "ies"} ` +
    `(${summary}).\nThese fail silently: the declaration is invalid at computed-value time, so the ` +
    `property inherits instead of erroring. Run with --list to see every declared token.`
);
process.exit(1);
