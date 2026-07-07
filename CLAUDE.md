# CLAUDE.md

Astro component starter: brandable base components for informational websites, visually editable in CloudCannon. Read `docs/ARCHITECTURE.md` before structural changes.

## Commands

- `npm run dev` / `npm run build` (prod, excludes component-docs) / `npm run build:with-library`
- `npm run check` — lint + format + `astro check` + manifest drift check. Run before claiming work done.
- `npm run check:fix` — auto-fix lint/format.
- `npm run manifest:write` — regenerate CloudCannon YAML from `*.manifest.mjs` files.
- After editing `package.json`: `npm run deps:sync` (never bare `npm install` — it breaks the lockfile for Linux CI).

## Detailed workflow guides

`.cursor/skills/*/SKILL.md` are the canonical playbooks — follow them when the task matches:
create-component, screenshot-to-component, migrate-existing-site, editable-regions, theming, adding-fonts, page-content-authoring, blog-mdx-content, site-data-navigation, debug-cloudcannon.

## Conventions that bite

- **Every component is a directory** under `src/components/` with `PascalCase.astro` + sibling CloudCannon YAML (`<kebab>.cloudcannon.inputs.yml` + `<kebab>.cloudcannon.structure-value.yml`). Components are auto-discovered by glob; the `_component` string in content is the kebab-case directory path (e.g. `building-blocks/core-elements/button`).
- **Manifest-owned components** (currently: `button`) have a `<kebab>.manifest.mjs` — edit that and run `npm run manifest:write`; never hand-edit their YAML (CI fails on drift). See `docs/component-manifest-design.md`.
- **Renaming a prop** in a non-manifest component requires updating: the `.astro` destructure, `inputs.yml`, `structure-value.yml` defaults, any `snippets.yml`, and existing content in `src/content/`. Nothing validates this — grep for the old name.
- **Styling**: components use `<style is:global>` wrapped in `@layer components`, consuming CSS custom properties only — no hardcoded colors/spacing/shadows/breakpoint magic numbers. Tokens: `src/styles/variables/*` (primitive), `src/styles/themes/*` (semantic).
- **Path logic is duplicated** between `src/components/utils/renderBlock.astro` and `live-editing.js` — change both or components vanish from the visual editor.
- **Interactive components** must work in the CloudCannon editor, where inline `<script>`s don't run — put setup logic in an importable module and register it in `editor-live-sync.js` (see `carousel/setup.ts`).
- **Editable regions**: inline editing is opt-in via `data-editable` / `data-prop` attributes and the `useDefaultEditableBinding` prop — see the editable-regions skill before touching these.
- Fonts change in `site-fonts.mjs` only. Site nav/footer/SEO data lives in `src/data/*.json`.
- Update `CHANGELOG.md` (Keep a Changelog format) with user-facing changes — see `.cursor/rules/changelog.mdc`.

## Current state

`IMPROVEMENTS.md` is the prioritized roadmap (known debt, phased). `POSITIONING.md` is product strategy. A section not rendering usually means a `_component` path mismatch — check the dev-server console for the renderBlock warning listing available component keys.
