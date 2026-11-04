// `@layer utils` `.flow > * + *` beats any page-sections top margin on a flow child; this finds
// those dead declarations in the real CSSOM. `auto` is exempt (a flex push).
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

    // Nested rules report a relative selectorText, which matches wrongly at document scope.
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
        // Cross-origin sheets have no readable cssRules.
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
