/**
 * Per-page CSS pruning.
 *
 * Every page is served by the catch-all `[...slug].astro`, so Astro collects
 * one CSS union for the whole component library and inlines it into all 42
 * pages. This drops, per page, the component style blocks whose classes the
 * page's own markup never uses.
 *
 * Two invariants keep it from eating live styles:
 *
 *   1. It prunes whole `@layer components` / `@layer page-sections` blocks —
 *      one per component `<style is:global>` — never individual rules. A block
 *      survives if ANY rule in it could match, so variant and state rules for a
 *      component that IS on the page always come along.
 *   2. The full sheet is still written to `components-full.css`, and
 *      `BaseLayout.astro` imports it when `window.inEditorMode` is set. The
 *      CloudCannon editor renders components client-side that were never in the
 *      page's HTML, so the editor must see everything.
 *
 * A class only counts as "required" outside `:not()`/`:is()`/`:where()`/`:has()`
 * — inside those it is optional or negated, so requiring it would drop live
 * rules.
 */
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { createHash } from "node:crypto";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";

// `BaseLayout.astro` writes this path literally in its editor-mode bootstrap;
// the emitted file is content-hashed and the reference rewritten below, so an
// editor browser cannot serve a stale sheet after a rebuild.
const FULL_CSS_REF = "/_astro/components-full.css";

const PRUNABLE_LAYERS = new Set(["components", "page-sections"]);
const SELECTOR_ALT_CAP = 32;

async function filesWithExtension(dir, extension) {
  const out = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) out.push(...(await filesWithExtension(full, extension)));
    else if (entry.name.endsWith(extension)) out.push(full);
  }
  return out;
}

/** Class tokens a selector requires; classes under a functional pseudo are not required. */
function requiredClasses(selector) {
  const out = [];

  try {
    selectorParser((root) => {
      root.walkClasses((node) => {
        for (let p = node.parent; p; p = p.parent) {
          if (p.type === "pseudo" && p.nodes?.length) return;
        }
        out.push(node.value);
      });
    }).processSync(selector);
  } catch {
    return null; // unparseable: treat as always-possible
  }
  return out;
}

function extendAlternatives(alts, rule) {
  const perSelector = rule.selectors.map(requiredClasses);

  if (perSelector.some((s) => s === null)) return alts;
  const next = [];

  for (const base of alts) {
    for (const sel of perSelector) {
      const merged = new Set(base);

      for (const c of sel) merged.add(c);
      next.push(merged);
      if (next.length >= SELECTOR_ALT_CAP) return next;
    }
  }
  return next.length ? next : alts;
}

const anySatisfiable = (alts, present) =>
  alts.some((alt) => {
    for (const c of alt) if (!present.has(c)) return false;
    return true;
  });

function containerIsLive(container, alts, present) {
  for (const node of container.nodes ?? []) {
    if (node.type === "decl") {
      if (anySatisfiable(alts, present)) return true;
    } else if (node.type === "rule") {
      if (containerIsLive(node, extendAlternatives(alts, node), present)) return true;
    } else if (node.type === "atrule") {
      // Keyframes, @property and @font-face are referenced by name, not by
      // selector, so no class test can prove them dead.
      if (node.name === "keyframes" || node.name === "property" || node.name === "font-face")
        return true;
      if (containerIsLive(node, alts, present)) return true;
    }
  }
  return false;
}

function classesFromMarkup(html) {
  const present = new Set();

  for (const m of html.matchAll(/\sclass=("([^"]*)"|'([^']*)')/g)) {
    for (const token of (m[2] ?? m[3] ?? "").split(/\s+/)) if (token) present.add(token);
  }
  return present;
}

/** Quoted string literals, split on whitespace — covers `classList.add("a b")`.
 *  A class name assembled at runtime (`` `is-${state}` ``) would be invisible
 *  here and its rules would be pruned; nothing in the tree builds one. */
function classesFromScript(source, into) {
  for (const m of source.matchAll(/(["'`])((?:[^"'`\\\n]|\\.){1,200}?)\1/g)) {
    for (const token of m[2].split(/[\s.]+/)) {
      if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(token)) into.add(token);
    }
  }
}

/**
 * `alwaysKeep` lists class names to treat as present on every page, for markup
 * this cannot see in the HTML: a component built at runtime from an assembled
 * class name, or one a third-party script injects. Naming a component's root
 * class is enough — the block is kept whole. `PRUNE_CSS=0` skips pruning
 * entirely, which is the baseline `test:css-parity` compares against.
 */
export default function pruneCss({
  enabled = process.env.PRUNE_CSS !== "0",
  alwaysKeep = [],
} = {}) {
  return {
    name: "prune-css",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        if (!enabled) {
          logger.info("PRUNE_CSS=0 - leaving every page's CSS intact");
          return;
        }
        const root = fileURLToPath(dir);
        const pages = await filesWithExtension(root, ".html");

        if (!pages.length) return;

        const scriptCache = new Map();
        const fullBlocks = new Map(); // block text -> layer, insertion-ordered
        let before = 0;
        let after = 0;
        let droppedBlocks = 0;
        let keptBlocks = 0;

        const results = [];

        for (const page of pages) {
          const html = await readFile(page, "utf8");
          const present = classesFromMarkup(html);

          for (const className of alwaysKeep) present.add(className);

          for (const m of html.matchAll(/<script[^>]*\ssrc="([^"]+)"[^>]*>/g)) {
            const src = m[1];

            if (!src.startsWith("/")) continue;
            if (!scriptCache.has(src)) {
              try {
                scriptCache.set(src, await readFile(join(root, src.split("/").join(sep)), "utf8"));
              } catch {
                scriptCache.set(src, "");
              }
            }
            classesFromScript(scriptCache.get(src), present);
          }
          for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
            classesFromScript(m[1], present);
          }

          let pageBefore = 0;
          let pageAfter = 0;

          const rewritten = html.replace(
            /(<style[^>]*>)([\s\S]*?)(<\/style>)/g,
            (whole, open, css, close) => {
              pageBefore += css.length;
              if (!css.includes("@layer")) {
                pageAfter += css.length;
                return whole;
              }
              let parsed;

              try {
                parsed = postcss.parse(css);
              } catch (error) {
                logger.warn(
                  `could not parse a style block in ${relative(root, page)}: ${error.message}`
                );
                pageAfter += css.length;
                return whole;
              }

              // Remove dead nodes and re-serialize the whole root. Joining
              // per-node `toString()` instead drops the terminating `;` of a
              // childless at-rule — which silently deletes the `@layer a, b, c;`
              // order statement, letting layers order by first appearance and
              // inverting the entire cascade.
              const doomed = [];

              parsed.each((node) => {
                const isPrunable =
                  node.type === "atrule" &&
                  node.name === "layer" &&
                  node.nodes &&
                  PRUNABLE_LAYERS.has(node.params.trim());

                if (!isPrunable) return;

                const text = node.toString();

                if (!fullBlocks.has(text)) fullBlocks.set(text, node.params.trim());

                if (containerIsLive(node, [new Set()], present)) keptBlocks++;
                else {
                  droppedBlocks++;
                  doomed.push(node);
                }
              });
              for (const node of doomed) node.remove();

              const next = parsed.toString();
              const order = /@layer\s+[^{;]*,[^{;]*;/;

              if (order.test(css) && !order.test(next)) {
                throw new Error(`lost the @layer order statement in ${relative(root, page)}`);
              }
              pageAfter += next.length;
              return open + next + close;
            }
          );

          before += pageBefore;
          after += pageAfter;
          results.push([page, rewritten]);
        }

        const full = [...fullBlocks.keys()].join("\n");
        const digest = createHash("sha256").update(full).digest("hex").slice(0, 8);
        const fullHref = `/_astro/components-full.${digest}.css`;

        await writeFile(join(root, "_astro", `components-full.${digest}.css`), full);
        await Promise.all(
          results.map(([page, html]) => writeFile(page, html.split(FULL_CSS_REF).join(fullHref)))
        );

        // BaseLayout's editor bootstrap is an inline <script>, which Astro
        // bundles out to its own JS asset — so the reference to rewrite is in
        // there, not in the HTML.
        let rewrittenRefs = 0;

        for (const script of await filesWithExtension(root, ".js")) {
          const source = await readFile(script, "utf8");

          if (!source.includes(FULL_CSS_REF)) continue;
          await writeFile(script, source.split(FULL_CSS_REF).join(fullHref));
          rewrittenRefs++;
        }
        if (!rewrittenRefs) {
          throw new Error(
            `nothing references ${FULL_CSS_REF}; the editor would load no component CSS`
          );
        }

        const unmatched = alwaysKeep.filter(
          (c) => !new RegExp(`\\.${c.replace(/[^\w-]/g, "\\$&")}(?![\\w-])`).test(full)
        );

        if (unmatched.length) {
          logger.warn(
            `alwaysKeep names no rule in any component block: ${unmatched.join(", ")} - typo, or the component was removed?`
          );
        }

        const saved = before - after;

        logger.info(
          `${
            alwaysKeep.length ? `alwaysKeep: ${alwaysKeep.join(", ")}\n` : ""
          }pruned ${droppedBlocks} of ${droppedBlocks + keptBlocks} component style blocks across ${pages.length} pages ` +
            `(${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB inline, ` +
            `-${((saved / before) * 100).toFixed(1)}%); full sheet ${(full.length / 1024).toFixed(0)}KB for the editor`
        );
      },
    },
  };
}
