# Architecture

How the load-bearing machinery fits together. For workflows (adding components, theming, content authoring), see the skills in `.agents/skills/` (canonical; `.claude/skills/` is a generated copy for Claude Code).

## The one-paragraph version

Pages are markdown files whose frontmatter holds a `pageSections` array of component data blocks. A catch-all route renders each block through a component registry that auto-discovers every `.astro` file under `src/components/`. Each component ships its own CloudCannon editor config as sibling YAML files, aggregated by glob so the CMS page builder always matches the component library. Design lives in CSS custom properties (primitive → semantic → component tiers), so rebranding is a token change, not a component change.

## Content → HTML pipeline

1. **Content**: `src/content/pages/*.md` — frontmatter validated by `src/content.config.ts` (`pageSchema`). `pageSections` is an array of blocks; each block has a `_component` path (e.g. `page-sections/heroes/hero-center`) plus that component's props. The markdown body below the frontmatter is also rendered (after the sections).
2. **Routing**: `src/pages/[...slug].astro` — `getStaticPaths` over the `pages` collection (excluding `blog`, which has its own routes under `src/pages/blog/`).
3. **Page shell**: `src/layouts/Page.astro` — merges frontmatter with props, wires SEO into `BaseLayout.astro`, renders `MainNav.astro` (from `src/data/mainNav.json`), the sections, the markdown body, and `Footer` (from `src/data/footer.json`).
4. **Component resolution**: `src/components/utils/renderBlock.astro` — the registry. `import.meta.glob("../**/*.{jsx,astro}")` discovers every component; paths are normalized via `pascalToKebab` (a `button/Button.astro` file collapses to the key `building-blocks/core-elements/button`). Each block's `_component` is looked up here; misses log a warning listing all available keys (that warning is your first stop when a section doesn't render).

**Implication**: adding a `.astro` file under `src/components/` in the right directory automatically registers it — there is no manual registry. The `_component` string in content must exactly match the kebab-case directory path.

## CloudCannon editing layer

Two co-operating systems:

### Structured editing (page builder / data panels)

- `cloudcannon.config.yml` (root) defines collections and pulls structures from `.cloudcannon/structures/*.yml`.
- Each `.cloudcannon/structures/*.yml` aggregates per-component files by glob, e.g. `pageSections` ← `/src/components/page-sections/**/*.cloudcannon.structure-value.yml`.
- Form fields are scoped to their own picker by the same mechanism: `formBlocks` ← `/src/components/building-blocks/forms/**/*.cloudcannon.structure-value.yml`, consumed only by the `formBlocks` array inputs on `form` and `cta-form`. They cannot appear in the page-sections picker (that glob matches `page-sections/**` only). Two components are deliberately excluded from the picker — `form` itself (no nested forms) and `segments` — see the comment in `.cloudcannon/structures/formBlocks.cloudcannon.structures.yml`.
- Per component (sibling files, same directory as the `.astro`):
  - `<name>.cloudcannon.inputs.yml` — editor field definitions (`_inputs` syntax).
  - `<name>.cloudcannon.structure-value.yml` — label/icon/description, default `value` (including `_component`), previews, and `_inputs_from_glob` pointing back at the inputs file.
  - `<name>.cloudcannon.snippets.yml` — MDX snippet definition (only the ~13 components usable inside markdown/blog bodies).

### Visual (inline) editing

- `@cloudcannon/editable-regions` is wired in `astro.config.mjs`; `live-editing.js` registers every component with the editor using its own `import.meta.glob("./src/components/**/*.astro")`. The kebab-case key derivation is shared with `renderBlock.astro` and `scripts/cms/lint.mjs` via `src/components/utils/componentKey.mjs` — one source of truth, so the registries can't drift.
- Components opt into inline editing via data attributes: `data-editable="text" data-prop="heading"` (single field), `data-editable="array" data-prop="contentSections"` on a container + `data-editable="array-item"` on children (managed by renderBlock), `data-editable="component"` for whole-component bindings. The `useDefaultEditableBinding` prop toggles a component's default binding; `renderBlock` passes it down.
- `editor-live-sync.js` handles presentation-only re-initialization inside the CloudCannon editor (Embla carousels, bento-box grid spans) because the editor's renderer doesn't execute inline scripts — component setup logic that must also run in the editor lives in importable modules (see `carousel/setup.ts` for the pattern).

## Theming

- **Tiers**: `src/styles/variables/*` (primitive tokens: palette, spacing, radius, shadows, fonts, z-layers, animation durations) → `src/styles/themes/_light.css` / `_dark.css` (semantic tokens like `--color-text`, `--color-bg-brand`) → components consume only semantic/primitive tokens in their `<style is:global>` blocks.
- **Layers**: `@layer reset, base, components, page-sections, utils, overrides` — declared in `BaseLayout.astro` before any component CSS. Component styles go in `@layer components`.
- **Dark mode**: inline script (`ThemeToggleScript.astro`) sets `data-theme` on `<html>` pre-paint (no FOUC); sections can pin a scheme via `data-theme` + `data-theme-lock`.
- **Fonts**: `site-fonts.mjs` (root) is the single source of truth — feeds Astro's fonts config in `astro.config.mjs` and the `<Font>` preloads in `src/layouts/SiteFonts.astro`. Provider is `fontProviders.fontsource()` (self-hosted via the installed `@fontsource/*` packages).
- **Reduced motion**: `src/styles/base/_animations.css` globally disables animations/transitions (including `::backdrop` / `::details-content`); JS-driven motion (Embla autoplay/auto-scroll) checks `prefers-reduced-motion` in `carousel/setup.ts`.

## Component library docs (`/component-docs`)

`src/component-docs/` is a self-documenting library UI (pure Astro, no React) with its own content collections, a component viewer, and a builder. It is excluded from production builds: `npm run build` sets `DISABLE_COMPONENT_LIBRARY=true`, which the component-docs routes check in `getStaticPaths`; `npm run build:with-library` includes it. The sitemap excludes it either way.

## Protected patterns (don't "refactor" these)

These are load-bearing decisions, not accidents. Fix problems around them with tooling, not by restructuring them:

- **The three-file component convention** (`.astro` + `inputs.yml` + `structure-value.yml`) and glob aggregation — it scales; fix drift with tooling, not by restructuring.
- **The three-tier token hierarchy** (primitive → semantic → component) and semantic naming.
- **Dark-mode architecture** — the `is:inline` script, `data-theme`, and theme-lock (FOUC-free by construction).
- **CSS-first interactivity** — Popover API modal, `<details>` accordion, `:has()`, `@layer` organization, and the `onPageLoad` + `setup.ts` script lifecycle.
- **Bar navigation's keyboard/ARIA implementation** — treat it as the reference for new interactive components.
- **`site-fonts.mjs`** as the font single-source-of-truth.

## Checks

`npm run check` = ESLint (js/yaml) + Stylelint + Prettier + `astro check` (types) + `previews:check` (thumbnail coverage) + `skills:check` (skills-copy drift) + `lint:cms` (prop/YAML drift, `_component` resolution). Test suites: `test:render` (every structure default builds), `test:unit` (Vitest over `src/components/utils/`) and `test:smoke` (headless-Chrome interaction tests: accordion, modal focus trap, carousel, mobile nav, theme toggle) — the last runs against a `build:with-library` `dist/`. CI (`.github/workflows/test.yml`) runs lockfile verification + `npm run check` + unit tests, plus a "Smoke tests" browser job. The lockfile must be regenerated with `npm run deps:sync` (not plain `npm install`) — macOS installs strip the Linux-only optional deps (sharp, rollup binaries) that CI needs.
