/**
 * Build the site and serve the real CloudCannon editor against `dist/`.
 *
 *   npm run editor                  build, then serve
 *   npm run editor -- --with-library   include /component-docs in the build
 *   npm run editor -- --no-build       serve the existing dist/ as-is
 *
 * `--no-app-sync` is not optional: app sync writes editor changes back to the
 * working tree without a Save, non-atomically, reflowing whole YAML files.
 */
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const port = args.find((a) => a.startsWith("--port="))?.split("=")[1] ?? "10101";

function run(command, commandArgs) {
  const { status } = spawnSync(command, commandArgs, { cwd: root, stdio: "inherit" });

  if (status !== 0) process.exit(status ?? 1);
}

if (!args.includes("--no-build")) {
  run("npm", ["run", args.includes("--with-library") ? "build:with-library" : "build"]);
}

const distIndex = join(root, "dist", "index.html");
let builtAt;

try {
  builtAt = statSync(distIndex).mtime;
} catch {
  console.error("\nNo dist/index.html — drop --no-build, or run npm run build first.\n");
  process.exit(1);
}

console.log(
  [
    "",
    `  Serving dist/ built ${builtAt.toLocaleString()}`,
    "  The editor reads dist/, not the dev server — rerun this after every change.",
    "",
  ].join("\n")
);

run("npx", ["-y", "@cloudcannon/cli", "dev", "dist", "--no-app-sync", "--port", port]);
