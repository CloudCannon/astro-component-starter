---
name: theming
description: Customize the design system for brand matching. Use when changing colors, fonts, spacing, or other design tokens, extending the theme system, or migrating an existing brand into this Astro component starter.
---

# Theming & Design Tokens

All visual styling uses CSS custom properties (design tokens) defined in `src/styles/`. Components never hardcode colors, spacing, fonts, or other visual values — they reference tokens so the entire look can be changed in one place.

## Token pipeline

```
src/styles/variables/*.css     → raw palette & scale values
src/styles/themes/_light.css   → semantic mappings for light mode
src/styles/themes/_dark.css    → semantic mappings for dark mode
src/styles/_variables.css      → aggregates all variable files
src/styles/_theme.css          → aggregates both theme files
src/styles/style.css           → imports everything (entry point)
```

CSS layer order (declared in `BaseLayout.astro`):

```css
@layer reset, base, components, page-sections, utils, overrides;
```

---

## Token reference

### Spacing (`src/styles/variables/_spacing.css`)

| Token            | Value   |
| ---------------- | ------- |
| `--spacing-none` | 0       |
| `--spacing-xs`   | 0.25rem |
| `--spacing-sm`   | 0.5rem  |
| `--spacing-md`   | 1rem    |
| `--spacing-lg`   | 1.5rem  |
| `--spacing-xl`   | 2rem    |
| `--spacing-2xl`  | 3rem    |
| `--spacing-3xl`  | 4rem    |
| `--spacing-4xl`  | 5rem    |
| `--spacing-5xl`  | 6rem    |
| `--spacing-6xl`  | 7rem    |

There are also `--spacing-em-*` variants (same scale in `em` units) for font-relative spacing.

### Typography (`src/styles/variables/_fonts.css`)

**Body font sizes** (scale down on screens < 640px):

| Token             | Desktop  | Mobile   |
| ----------------- | -------- | -------- |
| `--font-size-xs`  | 0.75rem  | 0.625rem |
| `--font-size-sm`  | 0.875rem | 0.75rem  |
| `--font-size-md`  | 1rem     | 0.875rem |
| `--font-size-lg`  | 1.125rem | 1rem     |
| `--font-size-xl`  | 1.375rem | 1.125rem |
| `--font-size-2xl` | 1.625rem | 1.375rem |
| `--font-size-3xl` | 1.875rem | 1.625rem |
| `--font-size-4xl` | 2.25rem  | 1.875rem |
| `--font-size-5xl` | 2.625rem | —        |

**Heading font sizes** (scale down on screens < 640px):

| Token                     | Desktop  | Mobile   |
| ------------------------- | -------- | -------- |
| `--font-size-heading-xs`  | 1.125rem | 1rem     |
| `--font-size-heading-sm`  | 1.375rem | 1.25rem  |
| `--font-size-heading-md`  | 1.75rem  | 1.5rem   |
| `--font-size-heading-lg`  | 2.25rem  | 1.875rem |
| `--font-size-heading-xl`  | 2.875rem | 2.375rem |
| `--font-size-heading-2xl` | 3.75rem  | 3rem     |
| `--font-size-heading-3xl` | 4.625rem | 3.75rem  |
| `--font-size-heading-4xl` | 5.5rem   | 4.25rem  |
| `--font-size-heading-5xl` | 6.375rem | —        |

**Font weights:**

| Token                    | Value |
| ------------------------ | ----- |
| `--font-weight-normal`   | 400   |
| `--font-weight-semibold` | 600   |
| `--font-weight-bold`     | 700   |

**Font families** (set via `site-fonts.mjs`, see font configuration below):

| Token             | Default                    |
| ----------------- | -------------------------- |
| `--font-body`     | Inter (fontsource, local)  |
| `--font-headings` | Raleway (fontsource, local)|
| `--font-mono`     | System monospace stack     |

### Colors (`src/styles/variables/_colors.css`)

Raw palette values — not used directly in components. Components use semantic tokens from theme files.

**Gray scale:**

| Token       | Value   |
| ----------- | ------- |
| `--gray-0`  | #fff    |
| `--gray-1`  | #eaeaea |
| `--gray-2`  | #d4d4d4 |
| `--gray-3`  | #bfbfbf |
| `--gray-4`  | #aaa    |
| `--gray-5`  | #949494 |
| `--gray-6`  | #7f7f7f |
| `--gray-7`  | #6a6a6a |
| `--gray-8`  | #555    |
| `--gray-9`  | #404040 |
| `--gray-10` | #2a2a2a |
| `--gray-11` | #151515 |
| `--gray-12` | #000    |

**Accent colors:**

| Color  | Light variant              | Dark variant              |
| ------ | -------------------------- | ------------------------- |
| Blue   | `--blue-light` (#e8f4fd)   | `--blue-dark` (#3b82f6)   |
| Green  | `--green-light` (#e8fce9)  | `--green-dark` (#10b981)  |
| Yellow | `--yellow-light` (#fef9e7) | `--yellow-dark` (#fbbf24) |
| Orange | `--orange-light` (#fef3e7) | `--orange-dark` (#f97316) |
| Red    | `--red-light` (#fee8e8)    | `--red-dark` (#ef4444)    |
| Purple | `--purple-light` (#f3e8ff) | `--purple-dark` (#a855f7) |
| Pink   | `--pink-light` (#fde8f2)   | `--pink-dark` (#ec4899)   |
| Cyan   | `--cyan-light` (#e8fffe)   | `--cyan-dark` (#06b6d4)   |

### Border radius (`src/styles/variables/_radius.css`)

| Token           | Value  |
| --------------- | ------ |
| `--radius-none` | 0      |
| `--radius-xs`   | 4px    |
| `--radius-sm`   | 8px    |
| `--radius-md`   | 12px   |
| `--radius-lg`   | 16px   |
| `--radius-xl`   | 24px   |
| `--radius-2xl`  | 32px   |
| `--radius-3xl`  | 48px   |
| `--radius-4xl`  | 64px   |
| `--radius-full` | 9999px |

### Content widths (`src/styles/variables/_content-widths.css`)

| Token                 | Value  |
| --------------------- | ------ |
| `--content-width-xs`  | 350px  |
| `--content-width-sm`  | 480px  |
| `--content-width-md`  | 640px  |
| `--content-width-lg`  | 768px  |
| `--content-width-xl`  | 1024px |
| `--content-width-2xl` | 1280px |
| `--content-width-3xl` | 1536px |

### Animations (`src/styles/variables/_animations.css`)

| Token                | Value |
| -------------------- | ----- |
| `--animation-fast`   | 100ms |
| `--animation-normal` | 200ms |
| `--animation-slow`   | 500ms |

### Aspect ratios (`src/styles/variables/_aspects.css`)

| Token                      | Value  |
| -------------------------- | ------ |
| `--ratio-square`           | 1 / 1  |
| `--ratio-landscape`        | 4 / 3  |
| `--ratio-portrait`         | 3 / 4  |
| `--ratio-widescreen`       | 16 / 9 |
| `--ratio-horizontal-strip` | 16 / 5 |

### Z-index layers (`src/styles/variables/_layers.css`)

| Token       | Value | Use                           |
| ----------- | ----- | ----------------------------- |
| `--layer-0` | 0     | Default                       |
| `--layer-1` | 10    | Raised content                |
| `--layer-2` | 20    | Sticky headers                |
| `--layer-3` | 30    | Dropdowns, modals             |
| `--layer-4` | 40    | Sticky headers, notifications |
| `--layer-5` | 50    | Popovers, tooltips            |
| `--layer-6` | 60    | Overlays                      |
| `--layer-7` | 100   | High priority                 |
| `--layer-8` | 1000  | Critical UI                   |

---

## Theme system

The theme files map raw palette values to semantic tokens. Components use semantic tokens so they adapt automatically when the theme changes.

### Light theme (`src/styles/themes/_light.css`)

```css
[data-theme='light'] {
  color-scheme: light;

  --color-brand: var(--gray-12);
  --color-brand-muted: var(--gray-9);
  --color-brand-subtle: var(--gray-7);
  --color-brand-on: var(--gray-0);

  --color-text: var(--gray-10);
  --color-text-strong: var(--gray-12);
  --color-text-muted: var(--gray-8);
  --color-text-on-muted: var(--gray-12);
  --color-text-on-brand: var(--gray-0);
  --color-text-inverse: var(--gray-0);
  --color-link: blue;
  --color-link-hover: darkblue;

  --color-bg: var(--gray-0);
  --color-bg-surface: var(--gray-1);
  --color-bg-muted: var(--gray-2);
  --color-bg-accent: #d5fdff;
  --color-bg-highlight: #fff9d6;
  --color-bg-brand: var(--color-brand);
  --color-bg-brand-muted: var(--color-brand-muted);
  --color-bg-inverse: var(--gray-12);

  --color-border: var(--gray-4);
  --color-border-inputs: var(--gray-7);
  --color-border-strong: var(--gray-10);
  --color-border-subtle: var(--gray-1);

  --color-state-hover: rgba(0, 0, 0, 0.04);
  --color-state-active: rgba(0, 0, 0, 0.08);
  --color-overlay: rgba(0, 0, 0, 0.5);

  --color-focus-ring: rgba(0, 87, 255, 0.4);
  --color-error: #f00;
}
```

### Dark theme (`src/styles/themes/_dark.css`)

```css
[data-theme='dark'] {
  color-scheme: dark;

  --color-brand: var(--gray-0);
  --color-brand-muted: var(--gray-3);
  --color-brand-subtle: var(--gray-5);
  --color-brand-on: var(--gray-12);

  --color-text: var(--gray-1);
  --color-text-strong: var(--gray-0);
  --color-text-muted: var(--gray-0);
  --color-text-on-muted: var(--gray-0);
  --color-text-on-brand: var(--gray-12);
  --color-text-inverse: var(--gray-12);
  --color-link: #60a5fa;
  --color-link-hover: #93c5fd;

  --color-bg: var(--gray-12);
  --color-bg-surface: var(--gray-11);
  --color-bg-muted: var(--gray-10);
  --color-bg-accent: rgb(35, 54, 98);
  --color-bg-highlight: rgb(94, 65, 28);
  --color-bg-brand: var(--color-brand);
  --color-bg-brand-muted: var(--color-brand-muted);
  --color-bg-inverse: var(--gray-1);

  --color-border: var(--gray-8);
  --color-border-strong: var(--gray-4);
  --color-border-subtle: var(--gray-8);

  --color-state-hover: rgba(255, 255, 255, 0.04);
  --color-state-active: rgba(255, 255, 255, 0.08);
  --color-overlay: rgba(0, 0, 0, 0.7);

  --color-focus-ring: rgba(0, 122, 255, 0.4);
}
```

### How colorScheme works in components

`CustomSection.astro` (which wraps every page section) sets `data-theme` on its inner container based on the `colorScheme` prop:

```astro
<div
  class:list={['outer-content', rounded && 'rounded']}
  data-theme={colorScheme && colorScheme !== 'inherit' ? colorScheme : undefined}
>
</div>
```

When `colorScheme` is `"dark"`, all descendant elements resolve semantic tokens from `[data-theme="dark"]`. When `"inherit"`, no `data-theme` is set and the section uses whatever theme the parent provides (the document root is `data-theme="light"` by default, set in `BaseLayout.astro`).

The `backgroundColor` prop works in tandem — it renders a background div with a class like `bg-surface` that maps to `background-color: var(--color-bg-surface)`, which resolves differently depending on the active theme.

---

## Extending the theme system

When a brand needs variables that don't exist yet, extend the system rather than hardcoding values in components.

### Rule: always add to both theme files

**Every new semantic variable must be added to both `_light.css` AND `_dark.css`.** Never add a variable to one without the other — components that use `colorScheme: dark` will break if the variable is undefined in that theme.

### Where to add new values

| What you're adding                                 | Where to put it                                                 |
| -------------------------------------------------- | --------------------------------------------------------------- |
| Raw palette color (hex value shared across themes) | `src/styles/variables/_colors.css`                              |
| Semantic color that changes per theme              | Both `src/styles/themes/_light.css` and `_dark.css`             |
| New spacing/radius/width value                     | Appropriate file in `src/styles/variables/`                     |
| Entirely new token category                        | New file in `src/styles/variables/`, import in `_variables.css` |

### Example: adding a brand accent color

1. Add raw palette values to `_colors.css`:

```css
--brand-primary: #2563eb;
--brand-primary-light: #dbeafe;
--brand-primary-dark: #1e40af;
```

2. Add semantic mappings to `_light.css`:

```css
--color-bg-accent: var(--brand-primary-light);
--color-link: var(--brand-primary);
--color-link-hover: var(--brand-primary-dark);
```

3. Add corresponding mappings to `_dark.css`:

```css
--color-bg-accent: var(--brand-primary-dark);
--color-link: #60a5fa;
--color-link-hover: #93c5fd;
```

### Example: adding a new semantic token

If a component needs a token that doesn't exist yet (e.g., `--color-bg-card-hover`):

1. Add to `_light.css`:

```css
--color-bg-card-hover: var(--gray-1);
```

2. Add to `_dark.css`:

```css
--color-bg-card-hover: var(--gray-10);
```

3. Use in the component:

```css
.card:hover {
  background-color: var(--color-bg-card-hover);
}
```

### When to extend existing files vs create new ones

- **Extend existing**: adding a new spacing value, a new gray shade, a new radius step — put it in the appropriate existing file.
- **New file**: adding an entirely new concept (e.g., `_shadows.css`, `_motion.css`) — create the file in `src/styles/variables/` and add an `@import` to `src/styles/_variables.css`.

---

## Font configuration

Fonts are managed in `site-fonts.mjs` at the project root. This file is consumed by both Astro's font system (`astro.config.mjs`) and the layout (`SiteFonts.astro`). Fonts use `@fontsource` packages for local copies — no external font services at runtime.

For detailed instructions on adding or changing fonts, see the **adding-fonts** skill (`SKILL.md` in `.cursor/skills/adding-fonts/`).

### Quick summary

- Edit `site-fonts.mjs` to change font families, weights, or provider.
- Install `@fontsource/<font-name>` for new fonts. Use `fontProviders.fontsource()` as the provider.
- Keep `cssVariable` values aligned with `--font-body` and `--font-headings`.
- Weights must include 400, 600, 700 (or a variable font covering that range).
- For proprietary fonts not on Fontsource, use `fontProviders.local()` with `.woff2` files in `src/assets/fonts/`.

---

## Brand migration workflow

Step-by-step process for applying a new brand to the component starter.

### 1. Set brand colors

Edit `src/styles/variables/_colors.css` to replace or add palette values:

```css
/* Replace accent colors with brand colors */
--brand-primary: #your-primary-hex;
--brand-primary-light: #lighter-variant;
--brand-primary-dark: #darker-variant;
--brand-secondary: #your-secondary-hex;
```

### 2. Update semantic mappings (both themes)

Edit `src/styles/themes/_light.css` — map brand colors to semantic tokens:

```css
--color-brand: var(--brand-primary);
--color-bg-accent: var(--brand-primary-light);
--color-link: var(--brand-primary);
--color-link-hover: var(--brand-primary-dark);
```

Edit `src/styles/themes/_dark.css` — use appropriate dark-mode variants:

```css
--color-brand: var(--brand-primary-light);
--color-bg-accent: var(--brand-primary-dark);
--color-link: var(--brand-primary-light);
--color-link-hover: var(--brand-primary);
```

### 3. Set brand fonts

Install `@fontsource/<font-name>` packages and edit `site-fonts.mjs` with the brand's font families using `fontProviders.fontsource()`. For proprietary fonts, use `fontProviders.local()` with `.woff2` files. See the **adding-fonts** skill for full details.

### 4. Adjust spacing and radius (optional)

If the brand has specific spacing or radius requirements, edit the corresponding files in `src/styles/variables/`. The existing scales work for most brands.

### 5. Update gray scale (optional)

For brands with warm or cool grays, replace the neutral gray scale in `_colors.css` with tinted values. All semantic tokens reference these, so the change cascades everywhere.
