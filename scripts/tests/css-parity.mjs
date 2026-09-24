/**
 * Proves `scripts/build/pruneCss.mjs` removed nothing that renders: compares the
 * computed styles and boxes of every element and pseudo, unpruned vs pruned.
 *
 *   node scripts/tests/css-parity.mjs <baseline-dist> [pruned-dist]
 *
 * CSS_PARITY_LIMIT=n   compare only the first n pages.
 * CSS_PARITY_ONLY=str  compare only pages whose URL contains str.
 * CSS_PARITY_EDITOR=1  load `components-full.<hash>.css` into pruned pages, as editor mode does.
 */
import { serveDist, launchBrowser } from "./lib/servedDist.mjs";
import postcss from "postcss";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const PSEUDOS = [null, "::before", "::after", "::marker", "::placeholder"];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

/** A declared shorthand's longhands aren't in the CSS text, so add them from the enumeration. */
const expandProps = (declared) => {
  const enumerated = getComputedStyle(document.body);
  const all = new Set(declared);

  for (let i = 0; i < enumerated.length; i++) {
    const prop = enumerated[i];

    for (const d of declared) {
      if (prop === d || prop.startsWith(`${d}-`)) {
        all.add(prop);
        break;
      }
    }
  }
  for (const always of [
    "display",
    "position",
    "visibility",
    "opacity",
    "z-index",
    "overflow-x",
    "overflow-y",
    "width",
    "height",
    "font-size",
    "line-height",
    "color",
    "background-color",
    "transform",
    "content",
    "grid-template-columns",
    "grid-template-rows",
  ])
    all.add(always);
  return [...all].sort();
};

const capture = ({ pseudos, props }) => {
  const els = document.querySelectorAll("*:not([data-parity-ignore])");
  const rows = [];

  for (const el of els) {
    const r = el.getBoundingClientRect();
    let geo = `${r.x}|${r.y}|${r.width}|${r.height}`;

    for (const pseudo of pseudos) {
      const cs = getComputedStyle(el, pseudo);
      let s = geo;

      geo = "";
      for (const prop of props) s += `${cs.getPropertyValue(prop)};`;
      // The builds run on different ports, and url() computes to an absolute URL.
      s = s.split(location.origin).join("~");
      let h = 0x811c9dc5;

      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      rows.push(h);
    }
  }
  return { rows, count: els.length, scrollHeight: document.documentElement.scrollHeight };
};

const detail = ({ index, pseudos, props }) => {
  const els = document.querySelectorAll("*:not([data-parity-ignore])");
  const el = els[Math.floor(index / pseudos.length)];
  const pseudo = pseudos[index % pseudos.length];
  const cs = getComputedStyle(el, pseudo);
  const style = {};

  for (const prop of props)
    style[prop] = cs.getPropertyValue(prop).split(location.origin).join("~");
  const r = el.getBoundingClientRect();

  style["<rect>"] = `${r.x}|${r.y}|${r.width}|${r.height}`;
  let path = el.tagName.toLowerCase();

  if (typeof el.className === "string" && el.className.trim()) {
    path += `.${el.className.trim().split(/\s+/).join(".")}`;
  }
  return { path, pseudo, style };
};

const drive = () => {
  for (const sel of [
    "details > summary",
    "[aria-expanded]",
    "[popovertarget]",
    ".accordion-item button",
    "[role='tab']",
    ".theme-toggle",
  ]) {
    for (const el of document.querySelectorAll(sel)) {
      try {
        el.click();
      } catch {
        /* inert control */
      }
    }
  }
  for (const el of document.querySelectorAll("details")) el.open = true;
  return document.querySelectorAll("[aria-expanded='true'], details[open], :popover-open").length;
};

// The theme toggle swaps images, and an undecoded image has no height.
const settle = async () => {
  // Bounded: `decode()` on a lazy image that hasn't started loading never settles.
  await Promise.race([
    Promise.all(
      [...document.images].filter((img) => !img.complete).map((img) => img.decode().catch(() => {}))
    ),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]);
  return new Promise((resolve) => {
    for (const animation of document.getAnimations()) {
      const iterations = animation.effect?.getTiming().iterations ?? 1;

      if (iterations !== Infinity) {
        try {
          animation.finish();
        } catch {
          /* not finishable */
        }
      }
    }
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
};

async function pagePaths(dir) {
  const out = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) out.push(...(await pagePaths(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const baselineDir = process.argv[2];
const prunedDir = process.argv[3] ?? "dist";

if (!baselineDir) {
  console.error("usage: node scripts/tests/css-parity.mjs <baseline-dist> [pruned-dist]");
  process.exit(2);
}

const fullSheetFile = (await readdir(join(prunedDir, "_astro"))).find((name) =>
  /^components-full\.[0-9a-f]+\.css$/.test(name)
);

if (!fullSheetFile) {
  console.error(`no components-full.<hash>.css in ${prunedDir}/_astro - was the build pruned?`);
  process.exit(2);
}

const declared = new Set();

postcss
  .parse(await readFile(join(prunedDir, "_astro", fullSheetFile), "utf8"))
  .walkDecls((d) => declared.add(d.prop.toLowerCase()));

const a = await serveDist(baselineDir);
const b = await serveDist(prunedDir);
const browser = await launchBrowser();

let urls = (await pagePaths(prunedDir))
  .map(
    (p) =>
      `/${relative(prunedDir, p)
        .split(sep)
        .join("/")
        .replace(/index\.html$/, "")}`
  )
  .sort();

if (process.env.CSS_PARITY_ONLY) urls = urls.filter((u) => u.includes(process.env.CSS_PARITY_ONLY));
if (process.env.CSS_PARITY_LIMIT) urls = urls.slice(0, Number(process.env.CSS_PARITY_LIMIT));

let comparisons = 0;
let props = null;
const failures = [];
const started = Date.now();

for (const viewport of VIEWPORTS) {
  for (const scheme of ["light", "dark"]) {
    const opts = {
      viewport: { width: viewport.width, height: viewport.height },
      colorScheme: scheme,
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    };
    const [ca, cb] = await Promise.all([browser.newContext(opts), browser.newContext(opts)]);
    const [pa, pb] = await Promise.all([ca.newPage(), cb.newPage()]);

    if (process.env.CSS_PARITY_EDITOR) {
      await pb.addInitScript((file) => {
        addEventListener(
          "DOMContentLoaded",
          () => {
            const full = document.createElement("style");

            full.dataset.parityIgnore = "";
            full.textContent = `@import url("/_astro/${file}");`;
            document.head.append(full);
          },
          { once: true }
        );
      }, fullSheetFile);
    }

    for (const url of urls) {
      for (const phase of ["static", "driven"]) {
        const visit = async (page, base) => {
          if (phase === "static") {
            await page.goto(base + url, { waitUntil: "networkidle" });
            await page.evaluate(() => document.fonts.ready.then(() => true));
            if (!props) props = await page.evaluate(expandProps, [...declared]);
          } else {
            await page.evaluate(drive);
          }
          await page.evaluate(settle);
          return page.evaluate(capture, { pseudos: PSEUDOS, props });
        };

        const ra = await visit(pa, a.baseUrl);
        const rb = await visit(pb, b.baseUrl);

        const tag = { url, viewport: viewport.name, scheme, phase };

        if (ra.count !== rb.count) {
          failures.push({ ...tag, kind: "element count", left: ra.count, right: rb.count });
          continue;
        }
        // scrollHeight rounds a fractional height; element boxes are compared exactly below.
        if (Math.abs(ra.scrollHeight - rb.scrollHeight) > 1) {
          failures.push({
            ...tag,
            kind: "document height",
            left: ra.scrollHeight,
            right: rb.scrollHeight,
          });
        }
        comparisons += ra.rows.length;

        for (let i = 0; i < ra.rows.length; i++) {
          if (ra.rows[i] === rb.rows[i]) continue;
          const args = { index: i, pseudos: PSEUDOS, props };
          const [da, db] = await Promise.all([
            pa.evaluate(detail, args),
            pb.evaluate(detail, args),
          ]);
          const diffs = Object.keys(da.style)
            .filter((k) => da.style[k] !== db.style[k])
            .map((k) => `${k}: ${da.style[k]}  ->  ${db.style[k]}`);

          if (!diffs.length) continue;
          failures.push({ ...tag, element: da.path + (da.pseudo ?? ""), diffs });
        }
      }
    }
    await Promise.all([ca.close(), cb.close()]);
    console.log(
      `  ${viewport.name}/${scheme}: ${urls.length} pages, ${failures.length} mismatches so far ` +
        `(${((Date.now() - started) / 1000).toFixed(0)}s)`
    );
  }
}

await browser.close();
a.server.close();
b.server.close();

console.log(
  `\ncompared ${comparisons.toLocaleString()} element/pseudo signatures over ${props.length} properties ` +
    `across ${urls.length} pages x ${VIEWPORTS.length} viewports x 2 schemes x 2 states`
);
if (!failures.length) {
  console.log("PASS - the pruned build computes identically to the unpruned one.");
  process.exit(0);
}
console.log(`FAIL - ${failures.length} mismatches\n`);
for (const f of failures.slice(0, 40)) {
  const where = `${f.url} [${f.viewport}/${f.scheme}/${f.phase}]`;

  if (f.kind) {
    console.log(`  ${where} ${f.kind}: ${f.left} vs ${f.right}`);
    continue;
  }
  console.log(`  ${where} ${f.element}`);
  for (const d of f.diffs.slice(0, 6)) console.log(`      ${d}`);
}
if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`);
process.exit(1);
