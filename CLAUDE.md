# CLAUDE.md

Astro component starter: brandable base components for informational websites, visually editable in CloudCannon. Read `docs/ARCHITECTURE.md` before structural changes.

## Commands

- `npm run dev` / `npm run build` (prod, excludes component-docs) / `npm run build:with-library`
- `npm run check` — lint + format + `astro check` + previews & skills drift checks. Run before claiming work done.
- `npm run check:fix` — auto-fix lint/format.
- `npm run lint:cms` — validate the CloudCannon layer against the components: prop drift (inputs/structure-value keys vs the `.astro` destructure), orphaned/missing YAML, and `_component` resolution. Part of `npm run check`; run after any prop rename.
- `npm run previews:build` — compile the component preview thumbnails in `public/component-previews/` from their co-located `*.preview.mjs` recipes (deterministic, no browser) and wire `image:` into each structure YAML. Rerun after adding/changing a recipe. `npm run previews:check` (part of `check`) guards drift + coverage (recipe present, SVG built + wired) browser-free. `npm run previews:screenshot` captures reference PNGs of the real rendered components into `.preview-screenshots/` (an authoring aid only — never an input to the committed SVGs). `npm run previews:montage` rasterizes every built SVG into one labelled PNG contact sheet at `.preview-montage.png` — use it to review the whole set for legibility and sibling similarity, which `previews:check` cannot judge. Previews are hand-authored via the kit in `scripts/previews/kit.mjs`; edit a component's `<name>.preview.mjs` and rebuild. The kit's header comment is the spec: nine `--pv-*` colour roles, a five-step type scale, a three-step stroke scale, four content width bands, and automatic centring on (640, 400). A recipe declares its `width` and the build **fails** if the drawn geometry doesn't match — so previews can't silently drift off-system. Re-skin the whole set by editing `LIGHT`/`DARK` in the kit.
- `npm run new:component <tier/path/kebab-name>` — scaffold a new component (`.astro` + both CloudCannon YAML files) with correct layer, key, and preview wiring; prints the remaining manual steps.
- Tests: `npm run test:render` (every structure default builds), `npm run test:unit` (Vitest, shared utils), `npm run test:smoke` + `npm run test:a11y` (headless Chrome + axe against `dist/` — run `npm run build:with-library` first).
- After editing `package.json`: `npm run deps:sync` (never bare `npm install` — it breaks the lockfile for Linux CI).

## Detailed workflow guides

`.agents/skills/*/SKILL.md` are the canonical playbooks — follow them when the task matches:
create-component, screenshot-to-component, migrate-existing-site, editable-regions, theming, adding-fonts, page-content-authoring, blog-mdx-content, site-data-navigation, debug-cloudcannon. Canonical skills live in `.agents/skills/`; `.cursor/skills/` and `.claude/skills/` are generated copies — resync with `npm run skills:sync`.

## Conventions that bite

- **Every component is a directory** under `src/components/` with `PascalCase.astro` + sibling CloudCannon YAML (`<kebab>.cloudcannon.inputs.yml` + `<kebab>.cloudcannon.structure-value.yml`). Components are auto-discovered by glob; the `_component` string in content is the kebab-case directory path (e.g. `building-blocks/core-elements/button`).
- **Renaming a prop** requires updating: the `.astro` destructure, `inputs.yml`, `structure-value.yml` defaults, any `snippets.yml`, and existing content in `src/content/`. `npm run lint:cms` catches YAML-side drift; still grep content for the old name.
- **Styling**: components use `<style is:global>` wrapped in `@layer components` (building blocks) or `@layer page-sections` (page sections), consuming CSS custom properties only — no hardcoded colors/spacing/shadows/breakpoint magic numbers. Tokens: `src/styles/variables/*` (primitive), `src/styles/themes/*` (semantic).
- **Component-key derivation is shared**: `renderBlock.astro`, `live-editing.js`, and `scripts/cms/lint.mjs` all import `src/components/utils/componentKey.mjs`. Change the derivation only there — a divergence makes components vanish from the visual editor.
- **Interactive components** must work in the CloudCannon editor, where inline `<script>`s don't run — put setup logic in an importable module and register it in `editor-live-sync.js` (see `carousel/setup.ts`).
- **Editable regions**: inline editing is opt-in via `data-editable` / `data-prop` attributes and the `useDefaultEditableBinding` prop — see the editable-regions skill before touching these.
- Fonts change in `site-fonts.mjs` only. Site nav/footer/SEO data lives in `src/data/*.json`.
- Update `CHANGELOG.md` (Keep a Changelog format) with user-facing changes — see `.cursor/rules/changelog.mdc`.

## Current state

The long-term roadmap and product strategy are kept in the gitignored `.local/` working area (`.local/plans/`, `.local/positioning.md`), not in the repo. A section not rendering usually means a `_component` path mismatch — check the dev-server console for the renderBlock warning listing available component keys.
