/**
 *   npm run editor                     build, then serve
 *   npm run editor -- --with-library   include /component-docs in the build
 *   npm run editor -- --no-build       serve the existing dist/ as-is
 *
 * `--no-app-sync` is required: app sync rewrites the working tree without a Save.
 */
import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Pinned: an unpinned `npx` reuses whichever version it cached first.
const CLI = "@cloudcannon/cli@0.0.20";
const CLI_MIN_NODE = 24;

if (Number(process.versions.node.split(".")[0]) < CLI_MIN_NODE) {
  console.error(
    `\n${CLI} needs Node ${CLI_MIN_NODE} or newer; this is Node ${process.versions.node}.\n` +
      "Run `nvm use` (see .nvmrc).\n"
  );
  process.exit(1);
}

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
    "  The editor reads dist/, not the dev server. Run `npm run build` in another terminal",
    "  after a change; the open preview picks it up without restarting this.",
    "  Open pages by file path (/about/index.html): folder URLs like /about/ return a 500.",
    "",
  ].join("\n")
);

run("npx", ["-y", CLI, "dev", "dist", "--no-app-sync", "--port", port]);
