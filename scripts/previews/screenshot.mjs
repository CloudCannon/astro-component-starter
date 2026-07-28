/**
 * Reference-screenshot capture — an AUTHORING AID, not a build step.
 *
 *   node scripts/previews/screenshot.mjs [--skip-build] [--only <substring>] [--out <dir>]
 *
 * Builds the bare `preview-renders/*` pages (COMPONENT_PREVIEWS=true), serves
 * dist/, and screenshots each component's rendered output to a PNG. These PNGs
 * ground recipe authoring (`*.preview.mjs`) — they are never an input to the
 * committed SVGs, which are produced deterministically by `build.mjs`.
 *
 * Requires Chrome/Edge/Chromium (or CHROME_PATH). Output defaults to
 * `.preview-screenshots/` (git-ignored, regenerated on demand).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, sep } from "node:path";
import { glob } from "glob";
import * as yaml from "js-yaml";
import { chromium } from "playwright-core";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const distDir = join(root, "dist");

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const outDir = args.includes("--out")
  ? args[args.indexOf("--out") + 1]
  : join(root, ".preview-screenshots");

const VIEWPORT = { width: 1280, height: 800 };

const structureFiles = await glob("src/components/**/*.cloudcannon.structure-value.yml", {
  cwd: root,
});
let components = structureFiles
  .map((file) => yaml.load(readFileSync(join(root, file), "utf8"))?.value?._component)
  .filter(Boolean)
  .sort();

if (only) components = components.filter((c) => c.includes(only));

if (!components.length) {
  console.error(only ? `No components match "${only}".` : "No components found.");
  process.exit(1);
}

if (!skipBuild) {
  console.log("Building preview-render pages (astro build)…");
  execSync("npx astro build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, COMPONENT_PREVIEWS: "true", DISABLE_COMPONENT_LIBRARY: "true" },
  });
}

if (!existsSync(distDir)) {
  console.error("dist/ does not exist — run without --skip-build first.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const server = createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let filePath = join(distDir, urlPath);

    if (!filePath.startsWith(distDir + sep) && filePath !== distDir) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (existsSync(filePath) && statSync(filePath).isDirectory())
      filePath = join(filePath, "index.html");
    if (!existsSync(filePath)) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
    res.end(readFileSync(filePath));
  } catch {
    res.writeHead(500);
    res.end();
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

async function launchBrowser() {
  const attempts = process.env.CHROME_PATH
    ? [{ executablePath: process.env.CHROME_PATH }]
    : [{ channel: "chrome" }, { channel: "msedge" }, {}];
  let lastError;

  for (const options of attempts) {
    try {
      return await chromium.launch({ headless: true, ...options });
    } catch (error) {
      lastError = error;
    }
  }
  console.error("Could not launch a browser. Install Chrome or set CHROME_PATH.");
  throw lastError;
}

mkdirSync(outDir, { recursive: true });
const browser = await launchBrowser();
const failures = [];

try {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  console.log(`Screenshotting ${components.length} component(s) → ${outDir}`);

  for (const component of components) {
    const url = `http://127.0.0.1:${port}/preview-renders/${component}/`;

    try {
      await page
        .goto(url, { waitUntil: "networkidle", timeout: 15000 })
        .catch(() => page.goto(url, { waitUntil: "load", timeout: 15000 }));
      await page.waitForTimeout(150);

      const outPath = join(outDir, `${component.replace(/\//g, "__")}.png`);
      const target = (await page.$("[data-preview-root]")) ?? page;

      await target.screenshot({ path: outPath });
      console.log(`  ✓ ${component}`);
    } catch (error) {
      failures.push(component);
      console.error(`  ✗ ${component}: ${error.message.split("\n")[0]}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\n${failures.length} failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`\nDone. Screenshots in ${outDir}`);
