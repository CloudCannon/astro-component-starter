/**
 * Dead `margin-top` detector for the `@layer page-sections` layer.
 *
 * `BaseLayout.astro` orders the layers `components, page-sections, utils`, and
 * `styles/utils/_flow.css` sets `margin-block-start` on `.flow > * + *`. So any
 * top margin a page section declares for one of its own flow children loses,
 * silently, whatever its specificity — the section renders at the flow rhythm
 * and the declaration is dead code. Spacing between flow siblings is set with
 * the `spaceBefore` prop or a `--space-before` custom property instead.
 *
 * A static lint can't tell a flow child from a flex/grid child, so this walks
 * the real CSSOM of the built site: for every `@layer page-sections` rule that
 * declares a top margin, it resolves the nested selector, keeps the matched
 * elements that are non-first children of a `.flow`/`.prose` parent, and fails
 * if any exist. `auto` is exempt (a flex push, not rhythm).
 *
 *   npm run build:with-library && node scripts/tests/flow-margins.mjs
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { launchBrowser, serveDist } from "./lib/servedDist.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const distDir = join(root, "dist");

if (!existsSync(distDir)) {
  console.error("dist/ not found — run `npm run build:with-library` first.");
  process.exit(1);
}

const pages = execSync("find dist -name index.html", { cwd: root, encoding: "utf8" })
  .trim()
  .split("\n")
  .map((file) => file.replace(/^dist/, "").replace(/index\.html$/, ""))
  .sort();

const { server, baseUrl } = await serveDist(distDir);
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const offenders = new Map();

for (const path of pages) {
  await page.goto(baseUrl + path, { waitUntil: "load" });

  const found = await page.evaluate(() => {
    const results = [];

    // Nested rules report a relative selectorText (`& .foo`, or `.foo` with an
    // implied `&`), which matches the wrong elements at document scope.
    const resolve = (selector, parent) =>
      selector
        .split(",")
        .map((part) => {
          const trimmed = part.trim();

          if (!parent) return trimmed;

          const scope = `:is(${parent})`;

          return trimmed.includes("&") ? trimmed.replaceAll("&", scope) : `${scope} ${trimmed}`;
        })
        .join(", ");

    const topOf = (style) => {
      const explicit =
        style.getPropertyValue("margin-block-start") || style.getPropertyValue("margin-top");

      if (explicit) return explicit;

      const shorthand = style.getPropertyValue("margin");

      return shorthand ? shorthand.trim().split(/\s+/)[0] : "";
    };

    const walk = (rules, layer, parentSelector) => {
      for (const rule of rules) {
        const kind = rule.constructor.name;

        if (kind === "CSSLayerBlockRule") {
          walk(rule.cssRules, rule.name || layer, parentSelector);
          continue;
        }

        if (kind !== "CSSStyleRule") {
          if (rule.cssRules) walk(rule.cssRules, layer, parentSelector);
          continue;
        }

        const selector = resolve(rule.selectorText, parentSelector);

        if (rule.cssRules?.length) walk(rule.cssRules, layer, selector);
        if (layer !== "page-sections") continue;

        const top = topOf(rule.style);

        if (!top || top === "auto" || /^0(?:[a-z%]*)$/.test(top)) continue;

        let elements = [];

        try {
          elements = [...document.querySelectorAll(selector)];
        } catch {
          continue;
        }

        const flowChildren = elements.filter((element) => {
          const parent = element.parentElement;

          return (
            parent &&
            (parent.classList.contains("flow") || parent.classList.contains("prose")) &&
            element.previousElementSibling
          );
        });

        if (!flowChildren.length) continue;

        results.push({
          selector,
          declared: top,
          computed: [
            ...new Set(flowChildren.map((element) => getComputedStyle(element).marginBlockStart)),
          ].join(" | "),
          count: flowChildren.length,
        });
      }
    };

    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules, null, null);
      } catch {
        // Cross-origin sheets have no readable cssRules; the site has none.
      }
    }

    return results;
  });

  for (const row of found) {
    const key = `${row.selector} :: ${row.declared}`;

    if (!offenders.has(key)) offenders.set(key, { ...row, page: path });
  }
}

await browser.close();
server.close();

if (offenders.size === 0) {
  console.log(`flow-margins: no dead page-section margins across ${pages.length} pages.`);
  process.exit(0);
}

console.error(`flow-margins: ${offenders.size} dead top margin(s) in @layer page-sections.\n`);

for (const row of offenders.values()) {
  console.error(`  ${row.selector}`);
  console.error(
    `    declared ${row.declared} but renders ${row.computed} on ${row.count} flow child(ren) — e.g. ${row.page}`
  );
  console.error(`    use spaceBefore / --space-before instead\n`);
}

process.exit(1);
