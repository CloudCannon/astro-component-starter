/**
 * Strip the demo content and make a fresh clone your own site.
 *
 * The starter ships a working demo — 14 blog posts, a "Why" page, CloudCannon's
 * logos and a homepage that sells the starter itself. That content is deliberate:
 * astro-component-starter.cc builds from it, and it's what makes a clone look like
 * a real site on first `npm run dev`. But every one of those files is something a
 * new project has to find and delete, and the two URL placeholders
 * (astro.config.mjs `site`, seo.json `url`) break canonicals, the sitemap, RSS and
 * JSON-LD silently if missed. See scripts/check/placeholders.mjs.
 *
 *   npm run reset:starter               interactive
 *   npm run reset:starter -- --dry-run  print the plan, write nothing
 *
 * Deletes files. Guarded on a clean git tree so `git checkout .` is always an undo.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dryRun = process.argv.includes("--dry-run");
const rl = createInterface({ input: process.stdin, output: process.stdout });

const changes = [];

function abs(relativePath) {
  return join(root, relativePath);
}

function record(message) {
  changes.push(message);
}

function writeText(relativePath, contents) {
  if (!dryRun) writeFileSync(abs(relativePath), contents);
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(abs(relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function remove(relativePath) {
  if (!dryRun) rmSync(abs(relativePath), { force: true });
}

/** YAML double-quoted scalar. JSON's string escaping is a valid subset. */
function yaml(value) {
  return JSON.stringify(value);
}

function isGitClean() {
  try {
    const status = execFileSync("git", ["status", "--porcelain"], {
      cwd: root,
      encoding: "utf8",
    });

    return status.trim() === "";
  } catch {
    return true; // not a git repo — nothing to protect
  }
}

/**
 * Pull one line at a time. `rl.question()` drops input when stdin is a pipe —
 * readline drains the pipe and emits every line before the next question()
 * registers a listener. The async iterator pauses between reads, so piped input
 * (and `--dry-run` in a test) behaves the same as a person typing.
 */
const lines = rl[Symbol.asyncIterator]();

async function prompt(text) {
  process.stdout.write(text);
  const { value, done } = await lines.next();

  if (done) {
    process.stdout.write("\n");
    return null;
  }
  return value;
}

function bail() {
  console.log("\n  Cancelled — nothing was written.\n");
  rl.close();
  process.exit(1);
}

async function ask(question, fallback = "") {
  const suffix = fallback ? ` (${fallback})` : "";
  const answer = await prompt(`  ${question}${suffix}: `);

  if (answer === null) bail();
  return answer.trim() || fallback;
}

async function confirm(question, defaultYes = true) {
  const answer = await prompt(`  ${question} ${defaultYes ? "(Y/n)" : "(y/N)"} `);

  if (answer === null) bail();
  const normalized = answer.trim().toLowerCase();

  if (!normalized) return defaultYes;
  return normalized.startsWith("y");
}

function normalizeUrl(input) {
  let value = input.trim().replace(/\/+$/, "");

  if (!value) return null;
  if (!/^https?:\/\//.test(value)) value = `https://${value}`;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function homepage(siteName) {
  return `---
_schema: default
title: Home
description: ${yaml(`Welcome to ${siteName}.`)}
pageSections:
  - _component: page-sections/heroes/hero-center
    eyebrow: ""
    heading: ${yaml(siteName)}
    subtext: Replace this with a sentence about what you do.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Get in touch
        hideText: false
        link: "/"
        iconName: ""
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    backgroundColor: base
    background:
      type: image
      positionVertical: top
      positionHorizontal: center
      priority: false
      imageSource: ""
      imageAlt: ""
      videoSource: null
      overlay: 0
---
`;
}

console.log("\n  Reset the Astro Component Starter\n");
if (dryRun) console.log("  Dry run — nothing will be written.\n");

if (!dryRun && !isGitClean()) {
  console.log("  Your git working tree has uncommitted changes.");
  console.log("  This script deletes files; commit or stash first so you can undo.\n");
  const proceed = await confirm("Continue anyway?", false);

  if (!proceed) {
    rl.close();
    process.exit(1);
  }
  console.log("");
}

const siteName = await ask("Site name", "");

if (!siteName) {
  console.log("\n  A site name is required.\n");
  rl.close();
  process.exit(1);
}

let siteUrl = null;

while (!siteUrl) {
  siteUrl = normalizeUrl(await ask("Production URL", ""));
  if (!siteUrl) console.log("  Enter a valid URL, e.g. https://acme.com");
}

const blogFiles = existsSync(abs("src/content/blog"))
  ? readdirSync(abs("src/content/blog")).filter((file) => file.endsWith(".mdx"))
  : [];

const removeBlog = blogFiles.length
  ? await confirm(`Remove demo blog posts (${blogFiles.length})?`)
  : false;
const removePages = await confirm("Remove demo pages and reset the homepage?");
const resetBranding = await confirm("Reset nav/footer/SEO branding?");

// --- astro.config.mjs: the placeholder that breaks every absolute URL ---------
const configPath = "astro.config.mjs";
const config = readFileSync(abs(configPath), "utf8");
const nextConfig = config.replace(/site: "https:\/\/example\.com",.*$/m, `site: ${yaml(siteUrl)},`);

if (nextConfig !== config) {
  writeText(configPath, nextConfig);
  record(`${configPath}   site → ${siteUrl}`);
}

// --- SEO defaults -------------------------------------------------------------
const seo = readJson("src/data/seo.json");

seo.name = siteName;
seo.url = siteUrl;
seo.titleFormat = `{title} | ${siteName}`;
if (resetBranding) {
  seo.description = `Welcome to ${siteName}.`;
  seo.logoSource = "";
}
writeJson("src/data/seo.json", seo);
record(`src/data/seo.json  name, url, titleFormat${resetBranding ? ", description, logo" : ""}`);

// --- Demo content -------------------------------------------------------------
if (removeBlog) {
  for (const file of blogFiles) remove(`src/content/blog/${file}`);
  record(`removed ${blogFiles.length} demo blog post${blogFiles.length === 1 ? "" : "s"}`);
}

if (removePages) {
  const demoPages = ["src/content/pages/why.md"].filter((page) => existsSync(abs(page)));

  for (const page of demoPages) remove(page);
  writeText("src/content/pages/index.md", homepage(siteName));
  record("reset the homepage to a blank hero");
  if (demoPages.length) {
    record(`removed ${demoPages.length} demo page${demoPages.length === 1 ? "" : "s"}`);
  }
}

// --- Navigation, footer -------------------------------------------------------
// Both drop /why/ (deleted above) and /component-docs/, which `npm run build`
// excludes from production — a nav link to it 404s on a real site.
if (resetBranding) {
  const nav = readJson("src/data/mainNav.json");

  nav.logoSource = "";
  nav.logoAlternateSource = "";
  nav.logoAlt = siteName;
  nav.navData = [
    { name: "Home", path: "/", children: [] },
    { name: "Blog", path: "/blog/", children: [] },
  ];
  writeJson("src/data/mainNav.json", nav);
  record("src/data/mainNav.json  logo cleared, nav reduced to Home + Blog");

  const footer = readJson("src/data/footer.json");

  footer.logoSource = "";
  footer.logoAlternateSource = "";
  footer.logoAlt = siteName;
  footer.links = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog/" },
  ];
  footer.socials = [];
  footer.footerText = `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  writeJson("src/data/footer.json", footer);
  record("src/data/footer.json  logo cleared, socials emptied, copyright set");
}

rl.close();

console.log("");
for (const change of changes) console.log(`  ✔ ${change}`);
console.log("");

if (dryRun) {
  console.log("  Dry run — no files were written.\n");
} else {
  console.log("  Next:");
  if (resetBranding)
    console.log("    • Add your logo — src/data/mainNav.json, footer.json, seo.json");
  console.log("    • Write your description — src/data/seo.json");
  console.log("    • Set your colours and fonts — src/styles/themes/, site-fonts.mjs");
  console.log("    • npm run dev\n");
}
