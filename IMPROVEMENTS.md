# Improvement Roadmap

A full audit of the starter (components, theming, CloudCannon integration, tooling/DX) distilled into phases. Generated 2026-07-07.

**Overall read:** the fundamentals are genuinely strong — the three-tier token system (primitive → semantic → component), the per-component `*.cloudcannon.*.yml` convention with glob aggregation, the FOUC-free dark mode, the CSS-first interactive components (Popover API modal, `<details>` accordion), and the Bar navigation's keyboard/ARIA work are all patterns to protect, not rewrite. The weaknesses cluster around three themes:

1. **Drift** — Astro props and CloudCannon YAML are maintained by hand in parallel with no validation linking them. Rename a prop and the editor silently breaks.
2. **Token escape hatches** — colors and fonts rebrand perfectly, but shadows, focus rings, breakpoints, easing, line-heights, and status colors are hardcoded per-component, so the "morph into any brand" promise is only ~70% true.
3. **No safety net** — no tests, no typecheck in CI, no a11y checks, no visual regression. Every refactor is on faith.

---

## Phase 0 — Immediate fixes (mechanical, this week)

### Dependencies & repo hygiene

- [x] ~~Remove `react` and `react-dom`~~ **CORRECTED — they are required.** No first-party code imports react, but `BaseLayout.astro:67` dynamic-imports `live-editing.js`, which imports `@cloudcannon/editable-regions/astro-react-renderer`, which imports `react` — so every build must resolve it (verified: removal breaks `astro build`). Visitors never download it (the chunk only loads in the CloudCannon editor). To actually drop react: remove the renderer import from `live-editing.js:2` too — but that removes visual-editor support for any future `.jsx` components (`renderBlock` globs `*.{jsx,astro}`), so it's a product decision, not cleanup.
- [ ] **Switch `site-fonts.mjs` to `fontProviders.fontsource()`** (lines 17, 25 currently use `fontProviders.google()`). `@fontsource/inter` and `@fontsource/raleway` are already installed; the file's own doc comment (line 6) and `component-docs/content/pages/customizing-your-brand.md` both say fontsource is the default. Right now builds depend on Google's API and the docs lie.
- [ ] **Untrack committed `.DS_Store` files** (~18 tracked: root, `src/`, `src/components/`, `public/`, `.cloudcannon/`, `.cursor/`…). `.gitignore` already covers them; run `git rm --cached` on the tracked ones.
- [ ] **Delete empty `src/pages/component-preview-prototype/`** directory.
- [ ] **Fix lockfile drift**: `npm ls` reports invalid versions for `@astrojs/compiler-rs` (0.1.10 locked vs 0.2.0 installed) and `@cloudcannon/editable-regions` (0.0.14 vs 0.0.15). Run `npm run deps:sync`.
- [ ] **`package.json` metadata**: `author` is still `"Your Name"`.

### One-line component fixes

- [ ] `Toggle.astro:77` — `color: red;` → `var(--color-danger)` (hardcoded color, breaks theming and dark mode).
- [ ] `Button.astro:137` — `gap: 0.15em` → spacing token (`var(--spacing-em-xs)` or a `--button-icon-gap` token).
- [ ] `Modal.astro:157` — `box-shadow: 0 16px 48px rgba(0,0,0,0.2)` → shadow token (see Phase 1 shadow scale; fine to add a single `--shadow-modal` now).
- [ ] `AccordionItem.astro:73-74` — dead `list-style-type` rule on `summary` inside `:first-of-type`; remove.

### Accessibility (small diffs, real impact)

- [ ] **Add `prefers-reduced-motion` support** — currently only `Video.astro` respects it. Needed in:
  - `Carousel.astro` (disable autoplay/auto-scroll, lines ~231-237)
  - `AccordionItem.astro` (open/close animation, lines ~105-132)
  - `Modal.astro` (transitions, lines ~168-183)
  - `Bar.astro` (submenu grow-out animation)
  - `Button.astro` (hover/focus transitions)

### CI

- [ ] **Add `astro check`** as `npm run typecheck`, wire into `npm run check` and the GitHub Actions workflow. Currently CI only lints/formats — `.astro` TypeScript errors ship silently.

---

## Phase 1 — Near term (next sprint or two)

### 1a. Close the token gaps (the brandability tax)

- [ ] **Shadow scale** — new `src/styles/variables/_shadows.css` with 5–7 elevations (`--shadow-sm` … `--shadow-xl`, `--shadow-modal`). Migrate Modal, cards, dropdowns.
- [ ] **Focus ring tokens** — `--focus-ring-width/-style/-color`. Today: forms use a 3px `box-shadow` ring on `:focus`, nav uses `outline` on focus, Button uses an inset shadow, and light/dark themes use _different_ focus rgba values (`0,87,255` vs `0,122,255`). Standardize on `:focus-visible` everywhere with one token set.
- [ ] **Breakpoint normalization** — components hardcode 600px (`Footer.astro:103`), 640px (`CustomSection`, `Card`, `Split`, `_fonts.css:30`), and 768px (`MainNav.astro:96`). Note: CSS custom properties **don't work in media queries** — either adopt `postcss-custom-media` (`@custom-media --mobile (width < 640px)`) or standardize on documented canonical values and enforce with a stylelint rule. Don't cargo-cult `var()` into `@media`.
- [ ] **Line-height tokens** — 1.5 / 1.2 / 1.25 / 1.3 scattered across components; extract `--line-height-tight/normal/relaxed`.
- [ ] **Status colors into the palette** — danger/info/success in `_light.css:235-243` and link colors (`blue`/`darkblue` at `_light.css:16`, `_dark.css:16`) are hardcoded hex/keywords that ignore `_colors.css`. Add palette entries and reference them from theme files.
- [ ] **Motion/easing tokens** — animation tokens define durations only; `ease-in-out`/`ease-out` are hardcoded.
- [ ] **Accent backgrounds in `_dark.css:22-23`** are rgb() literals, not palette references.

### 1b. Kill the duplication (~400 lines)

- [ ] **Padding/gap utility classes** — `CustomSection.astro:148-226` (79 lines), `Card.astro:247-293` (47 lines), `Split.astro:185-215` (31 lines) all hand-roll `.pad-x-{size}` / `.gap-{size}` variants, plus each duplicates its own mobile padding-reduction logic. Extract to a shared utility stylesheet in the `utils` layer.
- [ ] **Markdown rendering** — `Heading.astro`, `SimpleText.astro`, `Text.astro` each import and instantiate markdown-it separately (with inconsistent import casing). Extract `src/utils/markdown.ts` with `renderMarkdown` / `renderMarkdownInline`.
- [ ] **Overlay calculation** — the `rgba(${overlay < 0 ? "0,0,0" : "255,255,255"}, …)` expression is duplicated in `Card.astro:112` and `CustomSection.astro:87`. Extract and tokenize.
- [ ] **Form field boilerplate** — Input/Select/Textarea/Toggle/Range each duplicate `crypto.randomUUID()` field IDs and the identical label+required-asterisk markup. Create a `FormLabel.astro` (or `FormField.astro` wrapper) and a shared ID helper.
- [ ] **String validation** — `?.trim().length > 0` vs `typeof x === "string" && x.trim() !== ""` used interchangeably (`Button.astro:82-84`, `Image.astro:28`, `Icon.astro:16`). One `isNonEmptyString()` util.
- [ ] **Component-name resolution** — `live-editing.js` and `renderBlock.astro` independently implement path→component-name logic. If they diverge, components silently fail to load in the visual editor. Extract one shared utility.

### 1c. CloudCannon drift defenses & editor UX

- [ ] **`npm run lint:cms` validation script** — the single highest-leverage near-term item. Check: every `.astro` component has matching `inputs.yml` (or inherits via `_inputs_from_glob`); no orphaned `.cloudcannon.*.yml` files; every `_component` reference in structures resolves to a real file; every key in `inputs.yml` exists in the component's destructured props (catches renames). Wire into CI.
- [ ] **Defaults audit** — `structure-value.yml` defaults vs Astro prop defaults have drifted in places (e.g. `image.rounded` defaults in Astro but not YAML; hidden `image.widths`/`sizes`). Reconcile.
- [ ] **Missing `comment:` annotations** on wrapper inputs (`button-group`, `accordion` (`singleOpen`), `modal` (`triggerText`), `split`, `carousel`). Core elements and page sections are at 100%; wrappers aren't.
- [ ] **Preview images for the section picker** — structures have icons + text only. Add screenshot thumbnails for page sections (see Phase 2 for auto-generation).
- [ ] **Document (or fix) the form-field limitation** — the 13 form components have `inputs.yml` but no `structure-value.yml`, so they can only live inside `formBlocks` arrays. If intentional, document it; if not, add the structures.
- [ ] **Form a11y/validation surface** — Input/Textarea/Select have `aria-required` but no `error`/`hint` props, `aria-invalid`, or `aria-describedby` wiring. Add them (pairs with a Form validation story later).

### 1d. Component API polish

- [ ] **Button**: `isLoading` / `disabled` states.
- [ ] **Central variant/size enums** — `src/types/` exporting `BUTTON_VARIANTS`, `SIZES` etc. as `const` arrays; today every component inlines its unions and Icon's default color is `"default"` while Button's is `"primary"`.
- [ ] **Icon.astro:34** — `name?.includes("social/")` string-matching to decide fill; make it prop- or metadata-based.
- [ ] **Image**: `decorative` prop to make the empty-alt case explicit rather than the default fallback.
- [ ] **Modal**: focus is restored on close but not trapped while open. Add a focus trap.
- [ ] **Carousel**: `pauseOnHover` for autoplay (Embla supports it).

### 1e. Docs, onboarding, safety net

- [ ] **ARCHITECTURE.md** — nothing currently explains the load-bearing machinery: `renderBlock.astro` component discovery, the YAML aggregation pipeline, editable-regions flow, `DISABLE_COMPONENT_LIBRARY`, the component-docs system (~400 files, unexplained).
- [ ] **CLAUDE.md / AGENTS.md** — the `.cursor/skills/` are Cursor-shaped; Claude Code and other agents get nothing. A root agent file pointing at the skills and stating the conventions ("every component ships .astro + inputs.yml + structure-value.yml", "run lint:cms after prop changes") pays for itself immediately. Consider mirroring skills to `.claude/skills/` or a shared location.
- [ ] **CONTRIBUTING.md** — component-addition checklist, changelog rule, `deps:sync` explanation (and add a comment in package.json for why it exists — the macOS-strips-Linux-optional-deps issue).
- [ ] **Tests** — start small: Playwright smoke tests for the interactive components (accordion opens, modal traps/restores focus, carousel advances, mobile nav toggles, theme toggle persists) + a build test that every component in the structures renders via `renderBlock` without throwing. Vitest for utils.
- [ ] **a11y in CI** — axe-core or Lighthouse CI against a built page that exercises every component (the component-docs pages are perfect for this — build with `build:with-library` in CI).
- [ ] **Scaffolding script** — `npm run new:component` generating the `.astro` + three YAML files + docs entry from templates. The create-component skill documents ~8 manual steps; a generator makes them un-forgettable and keeps convention enforced.
- [ ] **Fail loudly on `DISABLE_COMPONENT_LIBRARY`** — production builds silently include/exclude docs routes based on an env var with no validation.

---

## Phase 2 — Big long-term ideas

### 1. Single source of truth with codegen (the drift-killer)

The structural fix for the biggest systemic weakness. Define each component's schema **once** — a `component.manifest.ts` (Zod schema or typed object) per component — and generate from it:

- the TypeScript `Props` interface,
- `*.cloudcannon.inputs.yml` (labels/comments from schema descriptions),
- `*.cloudcannon.structure-value.yml` defaults,
- the docs props table in component-docs,
- runtime validation in `renderBlock` (dev-mode warnings for type mismatches — today `contentBlockSchema` is `.passthrough()` and validates nothing beyond `_component`).

Prop renames become one-line changes; the lint:cms script from Phase 1 becomes obsolete because drift is impossible. This is a big lift but it's _the_ move that makes the starter maintainable at 100+ components.

### 2. The "morph" demo: theme presets + AI rebranding

The value prop is "morphs into any brand" — prove it and productize it:

- **Ship 5–10 brand presets** (token files + fonts): corporate, playful, editorial, brutalist, luxury… Doubles as marketing and as a theming-coverage test (any hardcoded value shows up as a preset that looks broken).
- **AI rebrand skill**: give it a logo, brand guide PDF, or existing site URL → it emits `_colors.css`, theme mappings, `site-fonts.mjs`, radii/shadow choices. The Phase 1 token work is exactly what makes this tractable — the more complete the token surface, the better an agent can morph it.
- **CMS-editable design tokens**: move brand tokens into a data file (`src/data/theme.json`) rendered into CSS custom properties at build, with CloudCannon color/select inputs. Rebranding then requires zero code for the 90% case.

### 3. Visual regression matrix (and free structure previews)

Screenshot every component × theme preset × light/dark × mobile/desktop in CI (Playwright). This:

- catches visual regressions on refactors (prerequisite for the Phase 1 dedup work being safe),
- **auto-generates the CloudCannon structure preview thumbnails** from the same pipeline (Phase 1c item), so picker images never go stale,
- generates the component-docs gallery imagery.

### 4. The update-distribution story

Starters fork and drift — a site built on v1.0 never gets v1.2's fixes. Options worth exploring:

- versioned component core as an npm package (heavy; fights the "edit anything" ethos),
- a `starter update` codemod/CLI that diffs upstream component versions against a site's copies and applies non-conflicting updates,
- or at minimum: CHANGELOG discipline (already there) + per-component version headers so agents can do the migration.
  This matters more the more sites are built on it — worth a decision before the fleet grows.

### 5. Content platform features

- **Reusable/global content blocks** — define a FAQ/CTA once, reference from many pages. Today everything is copy-pasted per page.
- **i18n** — locale-scoped content dirs, locale field in schemas, CloudCannon multi-language config. Currently nothing.
- **Form submission story** — forms render but POST into the void; ship adapters (CloudCannon forms, Netlify, Formspark…) + success/error states + the validation display layer.
- **Redirects management** — `routing.json` only has the 404 rule; no redirect UI for renamed pages.
- **Draft/scheduled content** — no `status` or `publishDate` gating.
- **SEO depth** — meta description length validation in inputs, OG/Twitter overrides per page, structured-data blocks.

### 6. Component roadmap (gaps for "informational websites")

Missing components users will hit quickly: **Tabs, Breadcrumbs, Alert/Banner, Stats/numbers strip, Pricing table, Logo/clients strip, Timeline, Table, Search**, blog-adjacent (author bio, related posts, TOC). The wrapper/composition model handles most of these cleanly.

### 7. Skills-as-code

All 9 skills are hand-maintained prose sitting in working-tree edits right now — same drift problem as the YAML. Long term: generate the convention sections of skills from the codebase (or from the Phase 2 manifests), keep only the workflow narrative hand-written, and add a CI check that flags component-pattern changes without corresponding skill updates.

### 8. Internationalization of the styles themselves

- Logical properties audit (`margin-left` → `margin-inline-start`) for RTL support.
- Fluid type via `clamp()` as an opt-in alternative to the 640px staircase.
- Container queries as the default responsive mechanism for components (only ContentSelector uses them today).
- Print stylesheet.

---

## What NOT to change (protect these patterns)

- The three-file component convention and glob aggregation — it scales; fix drift with tooling, not by restructuring.
- The three-tier token hierarchy and semantic naming.
- Dark mode architecture (`is:inline` script, `data-theme`, theme-lock).
- CSS-first interactivity (Popover API modal, `<details>` accordion, `:has()`), `@layer` organization, `onPageLoad` + `setup.ts` script lifecycle.
- Bar navigation's keyboard/ARIA implementation — treat it as the reference for new interactive components.
- `site-fonts.mjs` as font single-source-of-truth.
