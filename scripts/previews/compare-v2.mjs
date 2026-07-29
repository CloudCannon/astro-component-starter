/**
 * One-off fidelity checker for the v2 preview port.
 *
 *   node scripts/previews/compare-v2.mjs <reference-dir>
 *
 * Parses every shape out of the reference SVGs and the built ones, applies each
 * file's group translate so positions are absolute-on-canvas, and reports the
 * per-shape delta. Used to verify that the recipe rewrite reproduces the
 * hand-authored reference set rather than merely looking similar.
 *
 * Not part of `npm run check` — the reference set is a scratch input, not a
 * committed artifact. Delete this once the port is signed off.
 */
import { globSync } from "glob";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const refDir = process.argv[2];

if (!refDir) {
  console.error("usage: node scripts/previews/compare-v2.mjs <reference-dir>");
  process.exit(1);
}

const builtDir = join(process.cwd(), "public", "component-previews");
const TOL = Number(process.env.TOL ?? 2);

/** Every shape in a file, positions made absolute by folding in the group translate. */
function shapes(svg) {
  const t = svg.match(/transform="translate\((-?[\d.]+)[ ,]+(-?[\d.]+)\)"/);
  const tx = t ? Number(t[1]) : 0;
  const ty = t ? Number(t[2]) : 0;
  const out = [];

  for (const m of svg.matchAll(/<rect\b[^>]*?>/g)) {
    const tag = m[0];
    const a = (name) => {
      const v = tag.match(new RegExp(`\\b${name}="([^"]*)"`));

      return v ? v[1] : null;
    };
    const w = Number(a("width"));
    const h = Number(a("height"));

    // The full-canvas paper backdrop is outside the group and not content.
    if (w === 1280 && h === 800) continue;
    out.push({
      k: "rect",
      x: Number(a("x")) + tx,
      y: Number(a("y")) + ty,
      w,
      h,
      r: Number(a("rx") ?? 0) || 0,
      fill: a("fill"),
      stroke: a("stroke"),
      sw: Number(a("stroke-width") ?? 0) || 0,
      dash: a("stroke-dasharray"),
      op: a("opacity"),
    });
  }
  for (const m of svg.matchAll(/<circle\b[^>]*?>/g)) {
    const tag = m[0];
    const a = (name) => {
      const v = tag.match(new RegExp(`\\b${name}="([^"]*)"`));

      return v ? v[1] : null;
    };

    out.push({
      k: "circle",
      x: Number(a("cx")) + tx,
      y: Number(a("cy")) + ty,
      w: Number(a("r")) * 2,
      h: Number(a("r")) * 2,
      fill: a("fill"),
      op: a("opacity"),
    });
  }
  for (const m of svg.matchAll(/<polygon\b[^>]*?>/g)) {
    const tag = m[0];
    const pts = tag
      .match(/points="([^"]*)"/)[1]
      .trim()
      .split(/\s+/)
      .map((p) => p.split(",").map(Number));
    const xs = pts.map(([x]) => x + tx);
    const ys = pts.map(([, y]) => y + ty);
    const fillMatch = tag.match(/fill="([^"]*)"/);

    out.push({
      k: "poly",
      x: Math.min(...xs),
      y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
      pts: pts.length,
      fill: fillMatch ? fillMatch[1] : null,
    });
  }
  return out;
}

/** Sort key so two files' shape lists line up regardless of draw order. */
const key = (s) => `${s.k}|${s.fill}|${Math.round(s.w)}x${Math.round(s.h)}`;

const files = globSync("**/*.svg", { cwd: refDir }).sort();
let exact = 0;
const problems = [];

for (const file of files) {
  const ref = shapes(readFileSync(join(refDir, file), "utf8"));
  let got;

  try {
    got = shapes(readFileSync(join(builtDir, file), "utf8"));
  } catch {
    problems.push({ file, note: "not built" });
    continue;
  }

  if (ref.length !== got.length) {
    problems.push({ file, note: `shape count ${got.length} vs reference ${ref.length}` });
    continue;
  }

  const a = [...ref].sort((p, q) => key(p).localeCompare(key(q)) || p.x - q.x || p.y - q.y);
  const b = [...got].sort((p, q) => key(p).localeCompare(key(q)) || p.x - q.x || p.y - q.y);
  const deltas = [];

  for (let i = 0; i < a.length; i++) {
    if (key(a[i]) !== key(b[i])) {
      deltas.push(`shape mismatch: ${key(a[i])} vs ${key(b[i])}`);
      continue;
    }
    const dx = Math.abs(a[i].x - b[i].x);
    const dy = Math.abs(a[i].y - b[i].y);

    if (dx > TOL || dy > TOL) {
      deltas.push(
        `${key(a[i])} off by (${(b[i].x - a[i].x).toFixed(0)}, ${(b[i].y - a[i].y).toFixed(0)})`
      );
    }
    if ((a[i].stroke ?? null) !== (b[i].stroke ?? null) || (a[i].sw ?? 0) !== (b[i].sw ?? 0)) {
      deltas.push(`${key(a[i])} stroke ${b[i].stroke}/${b[i].sw} vs ${a[i].stroke}/${a[i].sw}`);
    }
    if ((a[i].dash ?? null) !== (b[i].dash ?? null)) {
      deltas.push(`${key(a[i])} dash ${b[i].dash} vs ${a[i].dash}`);
    }
  }

  if (deltas.length) problems.push({ file, deltas });
  else exact++;
}

console.log(`${exact}/${files.length} previews match the reference within ${TOL}px.\n`);

for (const p of problems) {
  console.log(`~ ${p.file}`);
  if (p.note) console.log(`    ${p.note}`);
  for (const d of (p.deltas ?? []).slice(0, 8)) console.log(`    ${d}`);
  if ((p.deltas ?? []).length > 8) console.log(`    … ${p.deltas.length - 8} more`);
}
