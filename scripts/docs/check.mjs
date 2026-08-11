/**
 * Lint the docs-authoring layer under `src/component-docs/content/components`
 * against the components it documents.
 *
 *   node scripts/docs/check.mjs
 *
 * Docs pages auto-derive from `src/components/**` structure-value YAML —
 * `content/components/<key>/index.md` is OPTIONAL enrichment and
 * `examples/*.md` are hand-written example blocks (frontmatter: `title` +
 * optional `spacing` + `blocks`, a component prop tree keyed by
 * `_component`). Slot metadata is derived from `.astro` source; `slots:` in
 * an index.md is a per-slot override patch. None of that is validated
 * anywhere else, so drift here silently breaks the docs viewer or an
 * example's rendered output.
 *
 * Output is one `ok`/`FAIL`/`WARN` line per thing checked, mirroring
 * `scripts/cms/lint.mjs`. FAILs exit 1; WARNs never fail the build.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { glob } from "glob";
import { frontmatter, allowedPropKeys, buildComponentIndex } from "../lib/componentModel.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const rel = (p) => relative(root, p);
const contentRoot = join(root, "src", "component-docs", "content", "components");

const fails = [];
const warns = [];
const oks = [];
const fail = (file, reason) => fails.push({ file, reason });
const warn = (file, reason) => warns.push({ file, reason });
const ok = (label) => oks.push(label);

const { componentKeys, byKey } = await buildComponentIndex(root);

const indexFiles = (await glob("**/index.md", { cwd: contentRoot })).sort();
const exampleFiles = (await glob("**/examples/*.md", { cwd: contentRoot })).sort();

/** Cache of parsed frontmatter, keyed by path relative to contentRoot. */
const fmCache = new Map();

function readFm(relToContent) {
  if (fmCache.has(relToContent)) return fmCache.get(relToContent);
  const fm = frontmatter(readFileSync(join(contentRoot, relToContent), "utf8"));

  fmCache.set(relToContent, fm);
  return fm;
}

// Check 1 — Orphan docs dirs (FAIL): any dir under content/components/ that
// carries an index.md or an examples/ dir must mirror a real component — the
// same relative path under src/components/ with a main .astro. Docs dirs are
// otherwise unconstrained (many components have no docs dir at all — that's
// the normal, undocumented-but-derived case), so this only catches the
// opposite: leftover docs content for a component that no longer exists.

const exampleDirs = (await glob("**/examples", { cwd: contentRoot })).filter((p) =>
  statSync(join(contentRoot, p)).isDirectory()
);

const docsDirs = new Set();

for (const f of indexFiles) docsDirs.add(dirname(f));
for (const d of exampleDirs) docsDirs.add(dirname(d));

for (const docsRel of [...docsDirs].sort()) {
  const entry = byKey.get(docsRel);
  const docsAbs = join(contentRoot, docsRel);

  if (entry && entry.isMain) ok(`docs dir    ${rel(docsAbs)}`);
  else
    fail(
      rel(docsAbs),
      `no main component at src/components/${docsRel} — delete or rename this docs directory`
    );
}

// Checks 2 + 3 — Example frontmatter (FAIL) and prop drift (FAIL): every
// examples/*.md must parse, declare a non-empty `title:` and a `blocks:`
// tree, and every block in that tree must reference a real `_component` with
// only props the component actually accepts.

// HTML passthrough: props a component never destructures by name but forwards
// via a `...rest` spread onto the root element. Only allowed for components
// whose destructure actually has a rest element (`allowedPropKeys().hasRest`).
const HTML_PASSTHROUGH = new Set([
  "style",
  "class",
  "id",
  "title",
  "role",
  "rel",
  "target",
  "tabindex",
]);
const isHtmlPassthrough = (key) =>
  HTML_PASSTHROUGH.has(key) || key.startsWith("aria-") || key.startsWith("data-");

/** Walk a `blocks:` tree, collecting prop-drift problem strings for `problems`. */
function walkBlocks(node, problems) {
  if (Array.isArray(node)) {
    for (const item of node) walkBlocks(item, problems);
    return;
  }
  if (!node || typeof node !== "object") return;

  if (typeof node._component === "string") {
    const entry = byKey.get(node._component);

    if (!entry) {
      problems.push(`_component "${node._component}" does not resolve to a known component`);
    } else {
      const { keys, hasRest } = allowedPropKeys(entry);

      for (const key of Object.keys(node)) {
        if (key === "_component" || key.startsWith("_")) continue;
        if (keys.has(key)) continue;
        if (hasRest && isHtmlPassthrough(key)) continue;
        problems.push(
          `prop "${key}" on _component "${node._component}" is not destructured/in inputs.yml/in structure-value.yml${
            hasRest ? " and is not an HTML-passthrough key" : ""
          }`
        );
      }
    }
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "_component") continue;
    if (value && typeof value === "object") walkBlocks(value, problems);
  }
}

for (const f of exampleFiles) {
  const abs = join(contentRoot, f);
  const fm = readFm(f);

  if (!fm) {
    fail(rel(abs), "frontmatter failed to parse");
    continue;
  }

  const fmProblems = [];

  if (typeof fm.title !== "string" || !fm.title.trim())
    fmProblems.push("missing/empty `title:` — ComponentViewer needs it");
  if (fm.blocks === undefined || fm.blocks === null) fmProblems.push("missing `blocks:`");

  if (fmProblems.length) {
    fail(rel(abs), fmProblems.join("; "));
    continue; // no blocks tree to walk.
  }
  ok(`example fm  ${rel(abs)}`);

  const problems = [];

  walkBlocks(fm.blocks, problems);
  if (problems.length) fail(rel(abs), problems.join("; "));
  else ok(`prop drift  ${rel(abs)}`);
}

// Check 4 — Example wiring: an index.md that carries an `examples:` key at
// all — even `examples: []`/`examples:` (null), both of which are
// indistinguishable from a genuinely absent key once the docsComponentSchema
// transform runs — is treated as the author having taken over curation for
// that component. `slugs` entries with no matching examples/<slug>.md → FAIL
// (dead reference). On-disk non-primary examples referenced by no group →
// WARN: `primary.md` is always shown separately and never needs listing, but
// every other file does — a docs dir with NO `examples:` key at all is the
// only case where non-primary examples still auto-render (one group per
// on-disk file, see ComponentLayout.astro's fallback branch).

for (const f of indexFiles) {
  const docsRel = dirname(f);
  const fm = readFm(f);

  if (!fm || !Object.prototype.hasOwnProperty.call(fm, "examples")) continue;

  const groups = Array.isArray(fm.examples) ? fm.examples : [];
  const abs = join(contentRoot, f);
  const examplesDirAbs = join(contentRoot, docsRel, "examples");
  const onDisk = existsSync(examplesDirAbs)
    ? readdirSync(examplesDirAbs)
        .filter((n) => n.endsWith(".md"))
        .map((n) => n.replace(/\.md$/, ""))
    : [];

  const referenced = new Set();
  let missing = 0;

  for (const group of groups) {
    const slugs = Array.isArray(group?.slugs) ? group.slugs : [];

    for (const slug of slugs) {
      referenced.add(slug);
      if (!onDisk.includes(slug)) {
        fail(rel(abs), `examples entry references missing examples/${slug}.md`);
        missing += 1;
      }
    }
  }
  if (!missing) ok(`wiring      ${rel(abs)}`);

  for (const slug of onDisk) {
    if (slug === "primary") continue;
    if (!referenced.has(slug)) {
      warn(
        rel(join(examplesDirAbs, `${slug}.md`)),
        `not referenced by any group in ${rel(abs)} — invisible in the docs viewer while examples: is curated there`
      );
    }
  }
}

// Check 5 — Slots overrides (FAIL): an index.md's `slots:` list is a patch
// over derived slot metadata (see src/component-docs/shared/slotDerivation.ts).
// `fallback_for` must name a prop the main component actually destructures;
// `child_component.name` must resolve to a sibling .astro or a real
// component key. Silently skipped when a docs dir has no `slots:` at all.

for (const f of indexFiles) {
  const docsRel = dirname(f);
  const fm = readFm(f);

  if (!fm || !Array.isArray(fm.slots) || !fm.slots.length) continue;

  const abs = join(contentRoot, f);
  const entry = byKey.get(docsRel);
  const destructuredProps = entry?.parsed?.props || new Set();
  const slotProblems = [];

  for (const slot of fm.slots) {
    if (!slot || typeof slot !== "object") continue;
    const label = slot.title || "(untitled slot)";

    if (slot.fallback_for != null && !destructuredProps.has(slot.fallback_for)) {
      slotProblems.push(
        `slot "${label}": fallback_for "${slot.fallback_for}" is not a prop ${
          entry ? rel(entry.astroAbs) : `src/components/${docsRel}`
        } destructures`
      );
    }

    const childName = slot.child_component?.name;

    if (childName) {
      const siblingAbs = entry ? join(entry.dirAbs, `${childName}.astro`) : null;
      const resolvesAsSibling = siblingAbs && existsSync(siblingAbs);
      const resolvesAsKey = componentKeys.has(childName);

      if (!resolvesAsSibling && !resolvesAsKey) {
        slotProblems.push(
          `slot "${label}": child_component.name "${childName}" is not a sibling .astro or a known component key`
        );
      }
    }
  }

  if (slotProblems.length) fail(rel(abs), slotProblems.join("; "));
  else ok(`slots       ${rel(abs)}`);
}

for (const label of oks) console.log(`ok     ${label}`);
for (const { file, reason } of warns) console.warn(`WARN   ${file}\n   ${reason}`);
for (const { file, reason } of fails) console.error(`FAIL   ${file}\n   ${reason}`);

console.log(
  `\n${oks.length} ok, ${warns.length} warning(s), ${fails.length} failure(s) across the docs-authoring layer.`
);

if (fails.length) {
  console.error(`\nDocs drift detected. Fix the docs content or the component it documents.`);
  process.exit(1);
}

// Guard against a silently-empty run (e.g. glob path regression).
if (!oks.length && !warns.length) {
  console.error("docs:check found nothing to check — likely a path/glob bug.");
  process.exit(1);
}
