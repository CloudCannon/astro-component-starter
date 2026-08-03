---
name: create-component
description: Use when adding a new page-section or building-block component — scaffolding the .astro file, its co-located CloudCannon YAML, registering it for the Visual Editor, and adding a docs entry. Start here for "add a component / building block / wrapper / UI element to the library".
---

# Create a component

A component is a directory under `src/components/` holding a `PascalCase.astro` file plus co-located CloudCannon YAML. Components are auto-discovered by glob — the `.astro` file's kebab-case directory path is its `_component` id in content and the editor.

This skill owns the CloudCannon YAML templates and structures registration for the starter (per `.agents/skills/STYLE.md`). Other skills link here for those.

## When to use

- Adding a new page section, wrapper, core element, or form control to the library.
- Turning a design/screenshot into a reusable component (pair with the [screenshot-to-component skill](../screenshot-to-component/SKILL.md)).

## When not to use

- Wiring inline editing on an existing component — [editable-regions skill](../editable-regions/SKILL.md).
- Composing existing components into page content — [page-content-authoring skill](../page-content-authoring/SKILL.md).
- Adding site nav/footer/social data — [site-data-navigation skill](../site-data-navigation/SKILL.md).

## Contents

| File                                                       | Covers                                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [component-templates.md](component-templates.md)           | `.astro` templates per tier, standard props, early-return, CSS-first, interactive JS wiring    |
| [cloudcannon-yaml.md](cloudcannon-yaml.md)                 | `structure-value.yml` / `inputs.yml` / `snippets.yml` templates, structures registration       |
| [component-docs.md](component-docs.md)                     | `/component-docs` page — auto-derived by default; optional `index.md` + `examples/` enrichment |
| [../references/structures.md](../references/structures.md) | Generic CloudCannon structure rules (previews, discriminator, null handling)                   |

## Decide before scaffolding

| Question                                                      | If yes                                                                                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Does it need JS that must also run in the CloudCannon editor? | Inline `<script>`s don't run in the editor. Setup goes in an importable module registered in `editor-live-sync.js` — see templates. |
| Which tier is it?                                             | Core element / wrapper / page section (table below).                                                                                |

## Tiers and naming

| Tier         | Path                                    | It is…                                                     |
| ------------ | --------------------------------------- | ---------------------------------------------------------- |
| Core element | `building-blocks/core-elements/{slug}/` | Atomic UI (button, heading, image, text, form control)     |
| Wrapper      | `building-blocks/wrappers/{slug}/`      | Container holding other components (card, grid, accordion) |
| Page section | `page-sections/{category}/{slug}/`      | Full-width section composing building blocks (hero, cta)   |

Page-section categories: `builders`, `ctas`, `features`, `heroes`, `info-blocks`, `people`. A category is just a directory — create a new one if none fits, and it is picked up by the same globs.

| Item              | Convention                      | Example                                          |
| ----------------- | ------------------------------- | ------------------------------------------------ |
| Directory         | kebab-case                      | `hero-center`                                    |
| Main component    | PascalCase matching directory   | `HeroCenter.astro` → key `.../hero-center`       |
| Child component   | `{Parent}{Role}.astro`          | `AccordionItem.astro` → key `.../accordion-item` |
| CloudCannon files | `{slug}.cloudcannon.{type}.yml` | `hero-center.cloudcannon.inputs.yml`             |

**Why the key collapse:** `pascalToKebab` drops the filename when it matches its parent directory (`hero-center/HeroCenter.astro` → `.../hero-center`); a child whose name differs keeps it (`.../accordion/accordion-item`). This logic lives in one shared module, `src/components/utils/componentKey.mjs`, which `renderBlock.astro` and `live-editing.js` both import.

## Steps

**Shortcut:** `npm run new:component <tier/path/slug>` automates steps 1–5 — it generates the `.astro` (correct layer, token-consuming) + both YAML files (correct `_component` key, preview `image:` wiring, and for page sections the section-wrapper `_inputs` block copied from a live component), then prints what remains. The steps below stay the reference for what good output looks like.

1. **Pick the tier and create the directory** under `src/components/{tier-path}/{slug}/`.
2. **Write `{Name}.astro`** from the matching template in [component-templates.md](component-templates.md). Destructure the standard props; compose existing building blocks over custom HTML. Components don't declare a `Props` interface — the select-option vocabulary for an enum-like prop lives in its CloudCannon `inputs.yml`.
3. **Write `{slug}.cloudcannon.structure-value.yml`** — label, icon, `value` with every prop + default (camelCase), `preview` + `picker_preview`, `_inputs_from_glob`. See [cloudcannon-yaml.md](cloudcannon-yaml.md). **Knob defaults in `value:` must equal the `.astro` destructure defaults** (sample _content_ like headings may differ deliberately) — `lint:cms` checks key existence but not value equality, so this is on you.
4. **Write `{slug}.cloudcannon.inputs.yml`** — field-type config for props needing non-default editor UI.
5. **Page sections only:** append the section-wrapper inputs to the **inputs.yml** (not the structure-value.yml), copied from `cta-center.cloudcannon.inputs.yml` starting at its `# --- section wrapper inputs (CustomSection) ---` marker — don't hand-type ~185 lines. `npm run new:component` does this for you.
6. **Register for the editor** where not automatic (table below).
7. **MDX-insertable page section?** Add `{slug}.cloudcannon.snippets.yml`.
8. **Docs page:** nothing to do — it auto-derives from the two YAML files. Optionally enrich it with `src/component-docs/content/components/{tier-path}/{slug}/index.md` + `examples/*.md` — see [component-docs.md](component-docs.md).
9. **If `package.json` changed:** `npm run deps:sync` (never bare `npm install` — it breaks the Linux CI lockfile).
10. **Author its preview** (page-builder components): write a co-located `{slug}.preview.mjs` recipe using the kit (`scripts/previews/kit.mjs`) — a `preview({ width, draw: [...] })` spec whose `draw` list is primitives and composites (`bar`/`lines`/`pill`/`field`/`media`/`plate`/`photoGlyph`/…) placed in absolute canvas coordinates. Read the kit's header comment first: it documents the five design-system rules the previews all obey (nine colour roles, five-step type scale, three-step stroke scale, four width bands, auto-centring). Pick a band with `band(760)` and use `B.left`; `compile()` centres the drawn box on (640, 400) and **fails the build** if the drawn geometry doesn't match the declared `width`, so a composition that drifts off-band is caught rather than shipped. A component that genuinely can't fill a band (one small control) sets `exempt: true` with a comment saying why. Study a sibling component's `.preview.mjs` for the idiom. Optionally run `npm run previews:screenshot` first to capture a reference PNG of the real render into `.preview-screenshots/`. Then run `npm run previews:build` to compile the SVG to `public/component-previews/<_component>.svg` (deterministic, no browser) and wire `image:` into the component's `preview`/`picker_preview` blocks — and, when the component has a `snippets.yml`, into its snippet `preview:` too, so the MDX snippet picker shows the same thumbnail. A snippet whose preview defines a `gallery:` block is skipped deliberately: it already shows an image from the author's own content, which beats a generic thumbnail. `npm run check` runs `previews:check`, which fails if a component lacks a recipe, an SVG, or its wiring, or if a committed SVG is stale vs. its recipe. Finally run `npm run previews:montage` and open `.preview-montage.png` to check the new tile actually reads at thumbnail size and isn't a near-twin of a sibling — `previews:check` verifies a preview _exists_, never that it's legible. Use `field()` for form controls (its stroke weight is heavier than a content `plate()` on purpose) and give same-silhouette controls a distinguishing cue.
11. **Interactive behavior?** Add a smoke test in `scripts/tests/smoke.mjs` (headless-Chrome interaction tests; see the accordion/modal/carousel tests for the pattern). New components are covered by `npm run test:a11y` automatically via their docs pages.
12. **Verify** (below).

## Editor registration: automatic vs manual

Adding a `.astro` file auto-registers it in the render registry (`renderBlock.astro`) and the Visual Editor registry (`live-editing.js`) — **both discover by glob; you edit neither.** (The duplicated path logic in those two files matters only if you change the normalization rules, not when adding a component.) The co-located YAML is likewise aggregated by glob in `cloudcannon.config.yml`.

| Component    | Manual registration needed?                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Page section | No — globbed into `pageSections`.                                                                                        |
| Core element | No in most contexts — globbed into `containerSections` etc. (`button`, `pagination` are explicitly excluded).            |
| Wrapper      | **Yes** — add its `structure-value.yml` path to each `.cloudcannon/structures/*Sections` context where it may be placed. |

Full context list and how to add a new nested content area: [cloudcannon-yaml.md](cloudcannon-yaml.md#structures-registration-cloudcannonstructurescloudcannonstructuresyml).

## Styling rules

**MUST:** wrap styles in `<style is:global>` inside `@layer components` (building blocks) or `@layer page-sections` (page sections).
**MUST:** use CSS custom properties for all values — no hardcoded colors, spacing, radii, shadows, or breakpoint magic numbers. Token names live in `src/styles/variables/*` and `src/styles/themes/*`; the [theming skill](../theming/SKILL.md) owns them.
**MUST NOT:** use `:global()` — every block is already global, so it is redundant.
**MUST NOT:** put `data-editable` or `display: contents` on the root element (see [component-templates.md](component-templates.md)).

## Verify your work

| Command                       | When                                                                                          | Look for                                                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`               | Always. Lint + format + `astro check` + previews & skills drift + `lint:cms` + `lint:schema`. | Exit 0. No lint/type errors, no drift.                                                                                                                                          |
| `npm run lint:schema`         | You wrote or edited any `*.cloudcannon.*.yml`.                                                | Exit 0. Validates each file against the official CloudCannon JSON Schema — catches invalid keys, out-of-enum `icon:` values, wrong input types. `--only <substring>` scopes it. |
| `npm run previews:build`      | You added or changed a component's `*.preview.mjs` recipe.                                    | New/updated SVG in `public/component-previews/` + `image:` wired into its structure-value **and** snippets YAML; no build errors.                                               |
| `npm run dev` + Visual Editor | You registered structures or wired editable regions.                                          | Block appears in the Add menu with the right label/icon; adding it populates every field; edits live-update.                                                                    |

**Component not found / section not rendering:** the dev-server console logs `Component not found: <_component>. Available components: [...]`. The `_component` in your content or structure-value.yml doesn't match any directory key — compare it against the printed list. This is the single most common failure and is almost always a `_component` path typo.
