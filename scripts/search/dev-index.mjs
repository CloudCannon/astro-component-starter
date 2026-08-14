/**
 * Copy the freshly built Pagefind index — plus the built image assets its
 * results reference — into `public/` so `astro dev` can serve them.
 *
 *   npm run search:dev   (builds first, then runs this)
 *
 * Why the images too: the index stores hashed `/_astro/*` thumbnail URLs
 * that only exist in `dist/`, so those are copied as well. Both output
 * folders are gitignored and stale until this is rerun; later builds copy
 * them into `dist/` harmlessly (the index is regenerated, the images are
 * content-hashed), and deploy builds start from a clean checkout where
 * neither exists.
 */
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
