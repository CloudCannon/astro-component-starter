# Contributing

Read [`CLAUDE.md`](CLAUDE.md) (commands, conventions that bite), [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (how the machinery fits together), and [`AGENTS.md`](AGENTS.md) (skills index) before changing anything structural. This file covers the contribution mechanics they don't.

## Adding a component

The canonical playbook is the [create-component skill](.agents/skills/create-component/SKILL.md) — follow it, not this summary. The shape of the work:

1. Pick the tier (core element / wrapper / page section) and create a kebab-case directory under `src/components/` with a matching `PascalCase.astro`. Discovery is by glob — no manual registry.
2. Write the sibling CloudCannon YAML: `{slug}.cloudcannon.structure-value.yml` (label, icon, defaults for every prop) and `{slug}.cloudcannon.inputs.yml`. Wrappers additionally need registering in `.cloudcannon/structures/*.yml` contexts.
3. Style with `<style is:global>` in `@layer components` (building blocks) or `@layer page-sections` (page sections), tokens only — no hardcoded colors/spacing/breakpoints.
4. Interactive JS that must work in the CloudCannon editor goes in an importable module registered in `editor-live-sync.js` — inline `<script>`s don't run there.
5. Add a docs entry under `src/component-docs/content/components/`.
6. Page-builder components: author a `*.preview.mjs` recipe, then `npm run previews:build` to compile its thumbnail SVG.
7. `npm run check`, then verify in the Visual Editor (`npm run dev`).

## The check gauntlet

Run `npm run check` before claiming any work done. It chains 13 steps, in order:

- `lint` — ESLint on JS/TS/Astro, ESLint on YAML, Stylelint on CSS.
- `format` — Prettier check across the repo (`format:fix` / `check:fix` to auto-fix).
- `typecheck` — `astro check` (TypeScript across `.astro` files).
- `previews:check` — fails if a component is missing its `*.preview.mjs` recipe or built SVG (or an SVG is orphaned / `image:` unwired / a committed SVG is stale vs. its recipe); browser-free.
- `docs:catalog:check` — fails if the generated component catalog in `.agents/skills/page-content-authoring/component-catalog.md` drifts from the co-located CloudCannon YAML.
- `agents:check` — fails if `.claude/skills/` or `.cursor/rules/` drift from canonical `.agents/`.
- `icons:check` — fails when the CloudCannon icon dataset (`.cloudcannon/data/icons.yml`) drifts from the SVGs in `src/icons/` in either direction.
- `lint:cms` — validates the CloudCannon layer against the components: prop drift, orphaned/missing YAML, `_component` resolution.
- `lint:roots` — fails on prop-driven `class`/`style`/`data-*` on a component root CloudCannon can make a region root (the editor's re-render keeps the root, so the attribute goes stale).
- `lint:nesting` — enforces the two-tier slot policy for the CloudCannon `*Sections` picker contexts.
- `docs:check` — lints the docs-authoring layer (`src/component-docs/content/components`) against the components it documents.
- `lint:schema` — validates `cloudcannon.config.yml` and every `*.cloudcannon.*.yml` / structures file against the official CloudCannon JSON Schemas.
- `check:placeholders` — warns on placeholder site URLs and privacy-policy text; add `--strict` to make it an error (the production gate).

## Dependencies

Plain `npm install` works. The native binaries CI needs (`sharp`, `pagefind`) are declared in `optionalDependencies`, so the lockfile keeps the Linux and Windows rows whatever platform you install from. If CI reports the lockfile is out of sync, run `npm run deps:sync` — it re-resolves for Linux/x64 first, then installs from the lockfile — and commit the regenerated `package-lock.json`. `npm run deps:check` verifies CI-readiness locally.

## Changelog

User-facing changes (features, fixes, behavior changes) get an entry in the unreleased section at the top of `CHANGELOG.md` (currently `[2.0.0] - Unreleased`), [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Append to an existing `### Added`/`### Changed`/etc. heading — never duplicate one. Skip internal-only refactors. Full rule: [`.agents/rules/changelog.md`](.agents/rules/changelog.md).

## Skills layout

Agent skills and rules live canonically in `.agents/` (`skills/<skill>/SKILL.md`, `rules/<name>.md`). `.claude/skills/` and `.cursor/rules/` are generated copies — never hand-edit them. Edit under `.agents/`, then run `npm run agents:sync`; `agents:check` fails CI on drift.
