// Copies dist/'s Pagefind index into public/ for `astro dev` (`npm run search:dev`), plus
// the hashed `/_astro/*` thumbnails its results reference, which only exist in dist/.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, extname, join } from "node:path";

const root = join(dirname(new URL(import.meta.url).pathname), "..", "..");
const dist = join(root, "dist");

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

if (!existsSync(join(dist, "pagefind"))) {
  console.error("dist/pagefind is missing — run this via `npm run search:dev` (it builds first).");
  process.exit(1);
}

rmSync(join(root, "public", "pagefind"), { recursive: true, force: true });
cpSync(join(dist, "pagefind"), join(root, "public", "pagefind"), { recursive: true });

const astroDir = join(dist, "_astro");
const outDir = join(root, "public", "_astro");

rmSync(outDir, { recursive: true, force: true });

let copied = 0;

if (existsSync(astroDir)) {
  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(astroDir)) {
    if (IMAGE_EXTENSIONS.has(extname(file).toLowerCase())) {
      cpSync(join(astroDir, file), join(outDir, file));
      copied += 1;
    }
  }
}

console.log(
  `Search dev index refreshed: public/pagefind + ${copied} image asset(s) in public/_astro.`
);
console.log("Both are gitignored and stale until you rerun `npm run search:dev`.");
