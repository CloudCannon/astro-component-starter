# CLAUDE.md

Astro component starter: brandable base components for informational websites, visually editable in CloudCannon. Read `docs/ARCHITECTURE.md` before structural changes.

## Commands

- `npm run dev` / `npm run build` (prod, excludes component-docs) / `npm run build:with-library`
- `npm run check` — lint (incl. `lint:css-vars`) + format + `astro check` + previews & skills drift checks + `lint:cms` + `lint:schema`. Run before claiming work done.
- `npm run check:fix` — auto-fix lint/format.
- `npm run lint:css-vars` — every `var(--x)` in `src/` must resolve to a declared custom property. Guessing a token name is the most common CSS mistake here (spacing starts at `xs`, weights are normal/semibold/bold with no `medium`, z-index is `--layer-N`) and it fails **silently** — an unresolved `var()` makes the declaration invalid at computed-value time, so the property just inherits. `var(--x, fallback)` and dynamically-built names (`var(--spacing-${gap})`) are skipped by design; `--list` prints every declared token. Part of `npm run lint`. Editor-side equivalent: the `cssVariables.lookupFiles` setting in `.vscode/settings.json`.
- `npm run lint:cms` — validate the CloudCannon layer against the **components**: prop drift (inputs/structure-value keys vs the `.astro` destructure), orphaned/missing YAML, and `_component` resolution. Part of `npm run check`; run after any prop rename.
- `npm run lint:schema` — validate the CloudCannon layer against **CloudCannon**: `cloudcannon.config.yml` plus every `*.cloudcannon.*.yml` and `.cloudcannon/structures/*.yml`, against the official JSON Schemas from the pinned `@cloudcannon/configuration-types`. Catches invalid keys, out-of-enum `icon:` values (Material Symbols, snake_case — not the kebab-case Heroicons used for component icon _inputs_), and wrong input types. Part of `npm run check`; `--only <substring>` scopes it. Complements `lint:cms` — neither subsumes the other, and a clean run still isn't proof the editor is happy (deprecated-but-valid keys pass).
- `npm run previews:build` — compile the component preview thumbnails in `public/component-previews/` from their co-located `*.preview.mjs` recipes (deterministic, no browser) and wire `image:` into each structure YAML — plus the component's `snippets.yml` preview when it has one, so the MDX snippet picker matches (a snippet with a `gallery:` block is skipped; it shows the author's own image instead). Rerun after adding/changing a recipe. `npm run previews:check` (part of `check`) guards drift + coverage (recipe present, SVG built + wired) browser-free. `npm run previews:screenshot` captures reference PNGs of the real rendered components into `.preview-screenshots/` (an authoring aid only — never an input to the committed SVGs). `npm run previews:montage` rasterizes every built SVG into one labelled PNG contact sheet at `.preview-montage.png` — use it to review the whole set for legibility and sibling similarity, which `previews:check` cannot judge. Previews are hand-authored via the kit in `scripts/previews/kit.mjs`; edit a component's `<name>.preview.mjs` and rebuild. The kit's header comment is the spec: nine `--pv-*` colour roles, a five-step type scale, a three-step stroke scale, four content width bands, and automatic centring on (640, 360). A recipe declares its `width` and the build **fails** if the drawn geometry doesn't match — so previews can't silently drift off-system. Re-skin the whole set by editing `LIGHT`/`DARK` in the kit.
- `npm run icons:sync` — regenerate `_select_data.icons` in `cloudcannon.config.yml` from the SVGs in `src/icons/` (recursive; subdirectories become part of the id, e.g. `social/github`). Run after adding or removing an icon. `npm run icons:check` (part of `check`) fails on drift either way — an id with no SVG shows a broken thumbnail in the picker, an SVG with no id can't be selected, and neither is an error anywhere else. Only the `icons:` block is rewritten; option labels are derived from the filename, so rename the file to rename the label.
- `npm run new:component <tier/path/kebab-name>` — scaffold a new component (`.astro` + both CloudCannon YAML files) with correct layer, key, and preview wiring; prints the remaining manual steps.
- Tests: `npm run test:render` (every structure default builds), `npm run test:unit` (Vitest, shared utils), `npm run test:smoke` (headless Chrome against `dist/` — run `npm run build:with-library` first).
- After editing `package.json`: `npm run deps:sync` (never bare `npm install` — it breaks the lockfile for Linux CI).

## Detailed workflow guides

`.agents/skills/*/SKILL.md` are the canonical playbooks — follow them when the task matches:
create-component, screenshot-to-component, migrate-existing-site, editable-regions, theming, adding-fonts, page-content-authoring, blog-mdx-content, site-data-navigation, debug-cloudcannon. Everything agent-facing is canonical under `.agents/` (skills in `.agents/skills/`, rules in `.agents/rules/`); `.claude/skills/` and `.cursor/rules/` are generated — never hand-edit them, run `npm run agents:sync` (`agents:check` in `check` fails on drift).

## Conventions that bite

- **Every component is a directory** under `src/components/` with `PascalCase.astro` + sibling CloudCannon YAML (`<kebab>.cloudcannon.inputs.yml` + `<kebab>.cloudcannon.structure-value.yml`). Components are auto-discovered by glob; the `_component` string in content is the kebab-case directory path (e.g. `building-blocks/core-elements/button`).
- **Renaming a prop** requires updating: the `.astro` destructure, `inputs.yml`, `structure-value.yml` defaults, any `snippets.yml`, and existing content in `src/content/`. `npm run lint:cms` catches YAML-side drift; still grep content for the old name.
- **Styling**: components use `<style is:global>` wrapped in `@layer components` (building blocks) or `@layer page-sections` (page sections), consuming CSS custom properties only — no hardcoded colors/spacing/shadows/breakpoint magic numbers. Tokens: `src/styles/variables/*` (primitive), `src/styles/themes/*` (semantic). **Never guess a token name** — the scales have plausible-looking steps that don't exist (`--spacing-2xs`, `--font-size-body-sm`, `--z-index-2`), and an unresolved `var()` fails silently. Check with `npm run lint:css-vars --list` or let the editor autocomplete it.
- **Component-key derivation is shared**: `renderBlock.astro`, `live-editing.js`, and `scripts/cms/lint.mjs` all import `src/components/utils/componentKey.mjs`. Change the derivation only there — a divergence makes components vanish from the visual editor.
- **Interactive components** must work in the CloudCannon editor, where inline `<script>`s don't run — put setup logic in an importable module and register it in `editor-live-sync.js` (see `carousel/setup.ts`).
- **Editable regions**: inline editing is opt-in via `data-editable` / `data-prop` attributes and the `useDefaultEditableBinding` prop — see the editable-regions skill before touching these.
- **Comments**: default to none. Add one only when a reader would otherwise make a wrong edit — a constraint, a silent failure mode, a coupling. Never to describe what code does, explain a design choice, or mark a change you just made (that belongs in the conversation or `CHANGELOG.md`). One line, two at most; no section banners. Full rule imported below.
- Fonts change in `site-fonts.mjs` only. Site nav/footer/SEO data lives in `src/data/*.json`.
- Update `CHANGELOG.md` (Keep a Changelog format) with user-facing changes — full rule imported below.

## Current state

A section not rendering usually means a `_component` path mismatch — check the dev-server console for the renderBlock warning listing available component keys.

## Rules

@.agents/rules/comments.md
@.agents/rules/changelog.md
