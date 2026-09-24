/**
 * Drops, per page, the component style blocks whose classes the page never uses.
 *   1. Prunes whole `@layer components` / `page-sections` blocks, never single rules, so a
 *      present component keeps all its variant and state rules.
 *   2. The editor renders components absent from the HTML, so `BaseLayout.astro` loads the
 *      full sheet (`components-full.css`) in editor mode.
 */
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { createHash } from "node:crypto";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";

// `BaseLayout.astro` writes this path literally; it is rewritten below to the content-hashed file.
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
      // Referenced by name, not selector, so no class test can prove them dead.
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

/** A class assembled at runtime (`` `is-${state}` ``) is invisible here; its rules get pruned. */
function classesFromScript(source, into) {
  for (const m of source.matchAll(/(["'`])((?:[^"'`\\\n]|\\.){1,200}?)\1/g)) {
    for (const token of m[2].split(/[\s.]+/)) {
      if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(token)) into.add(token);
    }
  }
}

/** `alwaysKeep`: classes treated as present on every page (runtime-built or third-party). */
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
        let dedupedBlocks = 0;

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
              } catch (error) {
                logger.warn(
                  `could not read linked script ${src} in ${relative(root, page)}: ${error.message} - its classes will not be counted`
                );
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

          const STYLE_TAG = /(<style[^>]*>)([\s\S]*?)(<\/style>)/g;
          const parsedTags = [];

          for (const [, , css] of html.matchAll(STYLE_TAG)) {
            pageBefore += css.length;
            if (!css.includes("@layer")) {
              parsedTags.push(null);
              continue;
            }
            try {
              parsedTags.push(postcss.parse(css));
            } catch (error) {
              logger.warn(
                `could not parse a style block in ${relative(root, page)}: ${error.message}`
              );
              parsedTags.push(null);
            }
          }

          const blocks = [];

          for (const parsed of parsedTags) {
            parsed?.each((node) => {
              if (
                node.type === "atrule" &&
                node.name === "layer" &&
                node.nodes &&
                PRUNABLE_LAYERS.has(node.params.trim())
              )
                blocks.push({ node, text: node.toString() });
            });
          }

          // Only the last of duplicate blocks wins the cascade; keeping the first would reorder it.
          const lastIndex = new Map();

          blocks.forEach(({ text }, i) => lastIndex.set(text, i));
          blocks.forEach(({ node, text }, i) => {
            if (!fullBlocks.has(text)) fullBlocks.set(text, node.params.trim());
            if (lastIndex.get(text) !== i) {
              dedupedBlocks++;
              node.remove();
            } else if (containerIsLive(node, [new Set()], present)) keptBlocks++;
            else {
              droppedBlocks++;
              node.remove();
            }
          });

          let tagIndex = 0;

          // Re-serialize the whole root: joining per-node `toString()` drops the `@layer a, b, c;`
          // order statement and silently inverts the cascade.
          const rewritten = html.replace(STYLE_TAG, (whole, open, css, close) => {
            const parsed = parsedTags[tagIndex++];

            if (!parsed) {
              pageAfter += css.length;
              return whole;
            }
            const next = parsed.toString();
            const order = /@layer\s+[^{;]*,[^{;]*;/;

            if (order.test(css) && !order.test(next)) {
              throw new Error(`lost the @layer order statement in ${relative(root, page)}`);
            }
            pageAfter += next.length;
            return open + next + close;
          });

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

        // Astro bundles BaseLayout's inline editor bootstrap into a JS asset; rewrite it there.
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
          }pruned ${droppedBlocks} of ${droppedBlocks + keptBlocks} component style blocks and ${dedupedBlocks} duplicates across ${pages.length} pages ` +
            `(${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB inline, ` +
            `-${((saved / before) * 100).toFixed(1)}%); full sheet ${(full.length / 1024).toFixed(0)}KB for the editor`
        );
      },
    },
  };
}
