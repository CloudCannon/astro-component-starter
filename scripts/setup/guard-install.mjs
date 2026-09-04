/**
 * Refuse a bare `npm install` in this repo.
 *
 * The lockfile carries Linux/x64 optional deps (sharp, rollup, pagefind) that a
 * macOS install prunes, so a bare install produces a tree that builds here and
 * breaks CI. `deps:sync` re-resolves for Linux first, then `npm ci`.
 *
 * Runs as `preinstall`, which npm fires only for a full install — adding a named
 * package (`npm install foo`) skips root lifecycle scripts, and `deps:sync` passes
 * `--ignore-scripts` on its install step and reaches `npm ci` as `npm_command=ci`.
 */
const command = process.env.npm_command;
const inCI = process.env.CI && process.env.CI !== "false";

if (command === "install" && !inCI && process.env.ALLOW_NPM_INSTALL !== "1") {
  console.error(
    [
      "",
      "  Bare `npm install` is blocked in this repo.",
      "",
      "  Run `npm run deps:sync` instead — it re-resolves the Linux/x64 optional",
      "  deps CI needs, then installs from the lockfile. A macOS-only install",
      "  drops them and the Linux build fails with a missing sharp/rollup binary.",
      "",
      "  Adding a dependency? Edit package.json, then `npm run deps:sync`.",
      "  Really need this? ALLOW_NPM_INSTALL=1 npm install",
      "",
    ].join("\n")
  );
  process.exit(1);
}
