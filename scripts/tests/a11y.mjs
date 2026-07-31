/**
 * Accessibility scan (axe-core) of the built site.
 *
 * Requires `npm run build:with-library` first. Serves dist/ with the same
 * static server the other browser scripts use, injects
 * node_modules/axe-core/axe.min.js into each page, and reports violations
 * grouped by page (rule id + impact + selectors).
 *
 * Pages scanned: every component-docs component page (together they render a
 * live example of every component) plus the main site pages (home, top-level
 * content pages, blog posts, the component-docs index, and the gallery).
 *
 * Threshold: exits 1 on `serious` or `critical` violations. `minor` and
 * `moderate` violations are printed for visibility but do not fail the run —
 * raising the threshold means clearing that backlog first (mostly
 * landmark/region rules on the docs pages).
 *
 *   node scripts/tests/a11y.mjs [--only <substring>]
 */
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { glob } from "glob";
import { launchBrowser, serveDist } from "./lib/servedDist.mjs";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const distDir = join(root, "dist");

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const FAIL_IMPACTS = new Set(["serious", "critical"]);

// Locate axe-core and the built pages.

let axePath;

try {
  const require = createRequire(import.meta.url);

  axePath = join(dirname(require.resolve("axe-core")), "axe.min.js");
} catch {
  console.error(
    "axe-core is not installed. Add it to devDependencies and run `npm run deps:sync`."
  );
  process.exit(1);
}

const marker = join(distDir, "component-docs", "components");

if (!existsSync(marker)) {
  console.error(
    "dist/ is missing the component-docs pages. Run `npm run build:with-library` first."
  );
  process.exit(1);
}

const componentPages = await glob("component-docs/components/**/index.html", { cwd: distDir });
const sitePages = await glob(
  "{index.html,*/index.html,blog/*/index.html,component-docs/index.html,component-docs/gallery/index.html}",
  { cwd: distDir }
);

const toUrlPath = (file) => `/${file.replace(/index\.html$/, "")}`;

let pages = [...new Set([...sitePages, ...componentPages].map(toUrlPath))].sort();

if (only) {
  pages = pages.filter((page) => page.includes(only));
}

if (!pages.length) {
  console.error(only ? `No pages match "${only}".` : "No built pages found in dist/.");
  process.exit(1);
}

// Scan.

const { server, baseUrl } = await serveDist(distDir);
const browser = await launchBrowser();

let cleanCount = 0;
let reportedOnlyCount = 0;

const failingPages = [];
const erroredPages = [];

console.log(`Scanning ${pages.length} page(s) with axe-core…`);

try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  page.setDefaultTimeout(15000);

  for (const path of pages) {
    try {
      await page.goto(`${baseUrl}${path}`, { waitUntil: "load", timeout: 20000 });
      await page.addScriptTag({ path: axePath });

      const results = await page.evaluate(async () => {
        return await window.axe.run(document, { resultTypes: ["violations"] });
      });

      const violations = results.violations ?? [];
      const failing = violations.filter((violation) => FAIL_IMPACTS.has(violation.impact));
      const reported = violations.filter((violation) => !FAIL_IMPACTS.has(violation.impact));

      if (!violations.length) {
        cleanCount += 1;
        console.log(`  ✓ ${path}`);
        continue;
      }

      if (failing.length) {
        failingPages.push(path);
        console.error(`  ✗ ${path} — ${failing.length} serious/critical, ${reported.length} other`);
      } else {
        reportedOnlyCount += 1;
        console.warn(`  ⚠ ${path} — ${reported.length} minor/moderate (reported only)`);
      }

      for (const violation of violations) {
        const nodes = violation.nodes ?? [];
        const targets = nodes
          .slice(0, 3)
          .map((node) => node.target.join(" "))
          .join(" | ");
        const suffix = nodes.length > 3 ? ` (+${nodes.length - 3} more)` : "";

        console.log(
          `      [${violation.impact}] ${violation.id}: ${violation.help} — ${targets}${suffix}`
        );
      }
    } catch (error) {
      erroredPages.push(path);
      console.error(`  ✗ ${path} — scan failed: ${error.message.split("\n")[0]}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

console.log(
  `\nScanned ${pages.length} page(s): ${cleanCount} clean, ${reportedOnlyCount} with minor/moderate ` +
    `issues (reported only), ${failingPages.length} with serious/critical violations, ` +
    `${erroredPages.length} failed to scan.`
);

if (failingPages.length || erroredPages.length) {
  if (failingPages.length) {
    console.error(`Serious/critical violations on: ${failingPages.join(", ")}`);
  }
  if (erroredPages.length) {
    console.error(`Failed to scan: ${erroredPages.join(", ")}`);
  }
  process.exit(1);
}

console.log("OK: no serious or critical accessibility violations.");
