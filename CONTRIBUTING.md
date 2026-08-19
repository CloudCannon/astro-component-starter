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

Run `npm run check` before claiming any work done. It chains:

- `lint` — ESLint on JS/TS/Astro, ESLint on YAML, Stylelint on CSS.
- `format` — Prettier check across the repo (`format:fix` / `check:fix` to auto-fix).
- `typecheck` — `astro check` (TypeScript across `.astro` files).
- `previews:check` — fails if a component is missing its `*.preview.mjs` recipe or built SVG (or an SVG is orphaned / `image:` unwired / a committed SVG is stale vs. its recipe); browser-free.
- `skills:check` — fails if `.claude/skills/` drifts from canonical `.agents/skills/`.
- `lint:cms` — validates the CloudCannon layer against the components: prop drift, orphaned/missing YAML, `_component` resolution.

## Dependencies: never bare `npm install`

After editing `package.json`, run `npm run deps:sync` — never plain `npm install`. A macOS install strips the Linux-only optional dependencies (sharp and rollup native binaries) from the lockfile, which breaks CI. `deps:sync` regenerates the lockfile with those platforms pinned, then runs `npm ci`. `package.json` is JSON and can't carry a comment saying this — that's why it lives here.

## Changelog

User-facing changes (features, fixes, behavior changes) get an entry in the `[Unreleased]` section of `CHANGELOG.md`, [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Append to an existing `### Added`/`### Changed`/etc. heading — never duplicate one. Skip internal-only refactors. Full rule: [`.cursor/rules/changelog.mdc`](.cursor/rules/changelog.mdc).

## Skills layout

Agent skills live canonically in `.agents/skills/` (one directory per skill, each with a `SKILL.md`). Cursor reads that folder directly. `.claude/skills/` is a generated, byte-identical copy for Claude Code — never hand-edit it. Edit the canonical skill, then run `npm run skills:sync`; `skills:check` fails CI on drift.
