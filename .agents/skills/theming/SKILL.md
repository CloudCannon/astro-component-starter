---
name: theming
description: Use when changing the starter's base design tokens (colors, spacing, radius, shadows, type scale, z-index), adding a token that no file declares yet, or wiring per-section light/dark via colorScheme. Start here for "what tokens exist and how do I change the default look every project inherits".
---

# Theming (design tokens)

Every visual value in the starter is a CSS custom property (design token). Components reference tokens only, so the whole look changes by editing token files — never component CSS. This skill is the canonical owner of the token system; it points at the CSS files for the actual names and values rather than copying them (a pasted table goes stale the moment a token changes).

## When to use

- Changing the base colors, spacing, radius, shadows, type scale, or z-index that every project inherits.
- Adding a token that no file declares yet.
- Wiring per-section light/dark with `colorScheme` / `lockColorScheme` / `backgroundColor`.
- Migrating a brand's base palette into the starter in place.

## When not to use

| Situation                                                     | Go instead to                                    |
| ------------------------------------------------------------- | ------------------------------------------------ |
| Changing fonts (families, weights, provider)                  | [adding-fonts](../adding-fonts/SKILL.md)         |
| Styling a new or existing component (the MUSTs for `<style>`) | [create-component](../create-component/SKILL.md) |

## The token pipeline

Two stages, the second overriding the first under equal or lower specificity:

```
variables/*.css              →  themes/_light.css + _dark.css
primitive scales & palette      semantic --color-* per theme
:where(:root) (specificity 0)   [data-theme="light|dark"]
```

- **Primitive** tokens are raw scales and palette swatches — a gray ramp, named accent light/dark pairs, spacing steps, radii. They carry no meaning ("gray-8", not "border"). Components never consume them directly.
- **Semantic** `--color-*` tokens map primitives onto roles (`--color-text`, `--color-bg-surface`, `--color-border`) and are what components actually use. They are declared twice — once per theme — so a component adapts to light/dark for free.

Aggregation and load order (`src/styles/style.css`): `_variables.css` `@import`s every `variables/*.css`; `_theme.css` `@import`s both theme files; `style.css` imports `_variables.css`, then `_theme.css`, then `_reset.css` / `_base.css` / `_utils.css`. Later import wins at equal specificity.

## Where each token group lives

Read the file for the exact names and values — do not rely on memory or a copy.

| File (`src/styles/…`)           | Scope selector         | Holds                                                                                                                                     |
| ------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `variables/_colors.css`         | `:where(:root)`        | Primitive `--gray-0…12` ramp, `--{color}-light/-dark` accent pairs, `--{red,blue,green}-*` functional shades (status/link colors)         |
| `variables/_spacing.css`        | `:where(:root)`        | `--spacing-*` (rem) and `--spacing-em-*` (em) scales                                                                                      |
| `variables/_radius.css`         | `:where(:root)`        | `--radius-*` corner scale                                                                                                                 |
| `variables/_shadows.css`        | `:where(:root)`        | `--shadow-sm/-md/-lg` elevations                                                                                                          |
| `variables/_focus.css`          | `:where(:root)`        | `--focus-ring-width` / `--focus-ring-style` (ring **color** is per-theme `--color-focus-ring`)                                            |
| `variables/_breakpoints.css`    | (comment only)         | Documentation of the canonical breakpoints (640px mobile, 768px nav) — literal px in `@media`/`@container`; custom props can't work there |
| `variables/_fonts.css`          | `:where(:root)`        | `--font-size-*` + `--font-size-heading-*` (scale down under 640px), `--font-weight-*`, `--font-mono`                                      |
| `variables/_line-heights.css`   | `:where(:root)`        | `--line-height-none/-tight/-normal/-relaxed` + `--line-height-heading-*` ramp (unitless)                                                  |
| `variables/_animations.css`     | `:where(:root)`        | `--animation-fast/-normal/-slow` durations + `--ease-out/-in-out/-smooth` easings                                                         |
| `variables/_aspects.css`        | `:where(:root)`        | `--ratio-*` aspect ratios                                                                                                                 |
| `variables/_layers.css`         | `:where(:root)`        | `--layer-*` z-index scale                                                                                                                 |
| `variables/_content-widths.css` | `:where(:root)`        | `--content-width-*` max-width steps                                                                                                       |
| `themes/_light.css`             | `[data-theme="light"]` | Semantic `--color-*` for light — brand, text, bg, border, state, status                                                                   |
| `themes/_dark.css`              | `[data-theme="dark"]`  | Semantic `--color-*` for dark — same names, dark values                                                                                   |

Font **families** (`--font-body`, `--font-headings`) are not in `_fonts.css` — Astro's `<Font />` injects them from `site-fonts.mjs`. See [adding-fonts](../adding-fonts/SKILL.md).

## The `@layer` architecture

Cascade layers are declared once as an inline `<style>` in `src/layouts/BaseLayout.astro` (and mirrored in the docs' `LibraryLayout.astro`) so the order is fixed before any component style loads:

```css
@layer reset, base, components, page-sections, utils, overrides;
```

Earlier layers lose to later ones regardless of selector specificity. Components declare their styles into a layer with `<style is:global>` + `@layer …`:

| Component kind                        | Layer                  | Verified count (files) |
| ------------------------------------- | ---------------------- | ---------------------- |
| Building blocks (and most navigation) | `@layer components`    | 49                     |
| Page sections                         | `@layer page-sections` | 7                      |

**Why the split:** page-section rules land in a later layer, so a section can override a building block's default without a specificity fight. The split is a convention, not enforced — two crossovers exist: `CustomSection.astro` (a page section) styles into `@layer components`, and two navigation components (`Footer`, `MainNav`) style into `@layer page-sections`. The `<style>` MUSTs for new components live in [create-component](../create-component/SKILL.md#styling-rules) — that skill owns them.

## Components consume tokens only

The tokens-only rule for component styles is owned by [create-component's Styling rules](../create-component/SKILL.md#styling-rules). This skill owns the flip side: **if no existing token fits, add one (below) — do not inline the literal.**
**Why:** the "morph into any brand" promise depends on every value being reachable from one token file. A hardcoded value silently escapes rebranding.

## Per-section light/dark (`colorScheme`)

`CustomSection.astro` (wraps every page section) and the `Card` wrapper set `data-theme` on their own container from a `colorScheme` prop, so a single section can render dark inside a light page. Descendants then resolve semantic `--color-*` from that theme.

| Prop / attribute  | Values                                               | Effect                                                                                    |
| ----------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `colorScheme`     | `inherit` (default) / `light` / `dark`               | `inherit` sets **no** `data-theme` (uses the parent's); otherwise stamps `data-theme`     |
| `lockColorScheme` | `false` (default) / `true`                           | `true` adds `data-theme-lock`, exempting the section from the visitor's theme toggle      |
| `backgroundColor` | `none` / `base` / `surface` / `accent` / `highlight` | Renders a `bg-<value>` layer mapping to `--color-bg`, `-surface`, `-accent`, `-highlight` |

`lockColorScheme` is `CustomSection`-only (its input is `hidden: true` by default — expose it only when a project needs permanently fixed light/dark sections). `Card` exposes `colorScheme` + `backgroundColor` but not the lock.

**Document default + toggle:** the root `<html>` is `data-theme="light"` (`BaseLayout.astro`). `ThemeToggle` flips it from `localStorage` (or `prefers-color-scheme` on first load), and flips every unlocked `[data-theme]` element with it; `[data-theme-lock]` elements are excluded. Any semantic token you add must therefore be defined in **both** theme files or locked/dark sections break.

## Add or change a token

| What you're adding                                   | Where                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| A primitive value (new gray shade, accent swatch)    | The matching `variables/*.css` file                                |
| A new step on an existing scale (spacing, radius, …) | The matching `variables/*.css` file                                |
| A semantic color that differs per theme              | **Both** `themes/_light.css` and `themes/_dark.css`                |
| A whole new token category                           | New `variables/<name>.css` + add its `@import` to `_variables.css` |

**MUST:** add every new semantic `--color-*` to **both** `_light.css` and `_dark.css`.
**Why:** an undefined token in one theme leaves any `colorScheme`-switched or toggled section with no value — the property falls back to `inherit`/initial and the section visibly breaks. Nothing validates this; a missing pair only shows up when someone views that theme.

To change the base look every project inherits (a brand migration in place): edit primitive palette values in `variables/_colors.css`, remap semantic tokens in both theme files, and adjust `--radius-*` / `--shadow-*` if the brand needs it.

## Known token gaps

These are **not** tokenized yet. When a task needs one, flag the gap rather than hardcoding a literal into a component.

| Gap                        | Current state                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Breakpoints                | **Documented convention, not a gap:** canonical `640px` (mobile/stacking) and `768px` (nav/tablet), literal px by decision — custom props can't be used in `@media`, and the repo stays vanilla CSS (no PostCSS). See `variables/_breakpoints.css`. Content-driven exceptions are allowed with an inline comment (e.g. BentoBox). |
| Motion easing              | **Tokenized:** `--ease-out` / `--ease-in-out` / `--ease-smooth` in `variables/_animations.css`; every component easing literal now references them.                                                                                                                                                                               |
| Shadows on some components | `--shadow-*` scale exists (3 steps, consumed by Modal); `Toggle`'s knob keeps a deliberate state-tinted glow                                                                                                                                                                                                                      |

## Verify your work

- Run `npm run check`. Expect exit 0 — no lint, format, or type errors.
- Run `npm run dev`, then toggle the site theme and load a section with `colorScheme: dark`. Confirm the change reads correctly in **both** light and dark, and that a `lockColorScheme` section stays put when you toggle.
- Component previews need no rebuild. They are hand-authored `*.preview.mjs` recipes with their own fixed neutral style (`scripts/previews/kit.mjs`), independent of theme tokens — changing `--radius-*` or colors does not affect them.
