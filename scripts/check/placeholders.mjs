/**
 * Report starter placeholders that survive into a real site.
 *
 * These fail silently, which is why they need a check. `site` in astro.config.mjs
 * is the base for every absolute URL Astro generates — canonicals, the sitemap,
 * RSS links and the JSON-LD `@id` graph. Left at example.com the build succeeds,
 * the pages look right, and every one of those URLs points at a domain the site
 * doesn't own. Nothing in `astro check`, the linters or the tests notices.
 *
 * The branding items are lower stakes but the same class of problem: ship them
 * and the site serves CloudCannon's logo and title as its own.
 *
 *   node scripts/check/placeholders.mjs            warn, exit 0
 *   node scripts/check/placeholders.mjs --strict   exit 1 if anything is unset
 *
 * Warn is the default so this repo — which legitimately holds the placeholders,
 * since the demo site builds from them — keeps a green CI. A site built from the
 * starter should switch it to --strict, or just run `npm run reset:starter`,
 * which sets every value below.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const strict = process.argv.includes("--strict");

const PLACEHOLDER_URL = "https://example.com";
const STARTER_NAME = "Astro Component Starter";
const STARTER_LOGO = "acs-logo";

function read(relativePath) {
  try {
    return readFileSync(join(root, relativePath), "utf8");
  } catch {
    return null;
  }
}

function readJson(relativePath) {
  const raw = read(relativePath);

  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const breaking = [];
const branding = [];

const astroConfig = read("astro.config.mjs");

if (astroConfig?.includes(`site: "${PLACEHOLDER_URL}"`)) {
  breaking.push({
    file: "astro.config.mjs",
    detail: `site is still ${PLACEHOLDER_URL}`,
    why: "every canonical, sitemap entry, RSS link and JSON-LD @id points at example.com",
  });
}

const seo = readJson("src/data/seo.json");

if (seo?.url === PLACEHOLDER_URL) {
  breaking.push({
    file: "src/data/seo.json",
    detail: `url is still ${PLACEHOLDER_URL}`,
    why: "Organization and WebSite structured data advertise the wrong domain",
  });
}
if (seo?.name === STARTER_NAME) {
  branding.push({ file: "src/data/seo.json", detail: `name is still "${STARTER_NAME}"` });
}
if (typeof seo?.titleFormat === "string" && seo.titleFormat.includes(STARTER_NAME)) {
  branding.push({
    file: "src/data/seo.json",
    detail: `titleFormat still appends "${STARTER_NAME}" to every page title`,
  });
}
if (typeof seo?.logoSource === "string" && seo.logoSource.includes(STARTER_LOGO)) {
  branding.push({ file: "src/data/seo.json", detail: "logoSource is the starter logo" });
}

for (const file of ["src/data/mainNav.json", "src/data/footer.json"]) {
  const data = readJson(file);

  if (!data) continue;
  const logos = [data.logoSource, data.logoAlternateSource].filter(
    (value) => typeof value === "string" && value.includes(STARTER_LOGO)
  );

  if (logos.length) {
    branding.push({ file, detail: "logo still points at the starter logo" });
  }
  const stubSocials = (data.socials ?? []).filter((social) =>
    /^https:\/\/(www\.)?(github|x|twitter|linkedin|facebook|instagram)\.com\/?$/.test(
      social?.link ?? ""
    )
  );

  if (stubSocials.length) {
    branding.push({
      file,
      detail: `${stubSocials.length} social link${stubSocials.length === 1 ? "" : "s"} still point at a bare platform URL`,
    });
  }
}

if (!breaking.length && !branding.length) {
  console.log("✔ No starter placeholders found.");
  process.exit(0);
}

const label = strict ? "✖" : "!";

console.log("");
if (breaking.length) {
  console.log(`${label} Placeholders that break production URLs:`);
  for (const item of breaking) {
    console.log(`    ${item.file} — ${item.detail}`);
    console.log(`      ${item.why}`);
  }
  console.log("");
}
if (branding.length) {
  console.log(`${label} Starter branding still in place:`);
  for (const item of branding) {
    console.log(`    ${item.file} — ${item.detail}`);
  }
  console.log("");
}
console.log("  Run `npm run reset:starter` to set these, or edit the files directly.");
console.log("");

process.exit(strict && breaking.length ? 1 : 0);
