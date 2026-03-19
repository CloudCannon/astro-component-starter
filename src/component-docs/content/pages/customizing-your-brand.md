---
title: Customizing Your Brand
contentSections: []
---

# Customizing Your Brand

The starter ships with a neutral, gray-based design that's meant to be replaced. The fastest way to make it yours is to edit the theme files. They control the colors that every component uses.

## Start with the theme files

Open `src/styles/themes/_light.css`. This is where you define the look of your site:

```css
[data-theme='light'] {
  --color-brand: var(--gray-12);
  --color-brand-muted: var(--gray-9);
  --color-brand-subtle: var(--gray-7);
  --color-brand-on: var(--gray-0);

  --color-text: var(--gray-10);
  --color-text-strong: var(--gray-12);
  --color-text-muted: var(--gray-8);

  --color-bg: var(--gray-0);
  --color-bg-surface: var(--gray-1);
  --color-bg-accent: #d5fdff;
  --color-bg-highlight: #fff9d6;

  --color-border: var(--gray-4);
  /* ... */
}
```

These are **semantic** color variables. They describe purpose, not specific colors. Every component in the starter references these variables, so changes here propagate everywhere automatically.

**Try it now:** Change `--color-brand` to a blue (`var(--blue-dark)`) or drop in your own hex value. Save, and watch buttons, headings, and accents shift across your entire site.

The key variables to update first:

- **`--color-brand`**: Your primary brand color (buttons, accents, emphasis)
- **`--color-bg-accent`** and **`--color-bg-highlight`**: Section background colors that add visual variety
- **`--color-link`**: Link color

The dark theme lives in `src/styles/themes/_dark.css` and uses the same variable names. Update both to keep your brand consistent across color schemes.

## How themes work inside components

Themes aren't just a global toggle. They're used **per-section** within your pages. Components like `CustomSection` and `Card` have a `colorScheme` prop that switches the theme for that section and everything inside it.

For example, on a light-themed page, you can drop in a dark section:

```yaml
- _component: page-sections/ctas/cta-center
  heading: Ready to start building?
  colorScheme: dark
  backgroundColor: surface
```

Setting `colorScheme: dark` adds `data-theme="dark"` to that section's HTML element. CSS picks up the dark theme variables, and the entire section (text, backgrounds, buttons, borders) switches to your dark palette. The next section reverts to whatever theme it specifies.

This is why both theme files are important. Even if your site is primarily light, any section can flip to dark (and back). When you customize `_dark.css`, you're defining what those contrast sections look like. Editors can toggle this per-section through the `colorScheme` input in CloudCannon.

## Changing fonts

**Families and loading:** edit `site-fonts.mjs` at the project root. That file is the single source of truth for [Astro’s Fonts config](https://docs.astro.build/en/guides/fonts/) and for which families get `<Font />` tags via `src/layouts/SiteFonts.astro`. Change `name`, `provider` (for example `fontProviders.fontsource()` or `fontProviders.local()`), `weights`, and `cssVariable` there. Keep `cssVariable` aligned with how you use tokens in CSS: defaults are `--font-body` and `--font-headings`.

**Sizes and weights:** open `src/styles/variables/_fonts.css` for the size scale (`--font-size-xs` through `--font-size-4xl`, plus the heading scale) and `--font-weight-*` tokens—not for the font family names.

## The base color palette

The theme files reference raw color values defined in `src/styles/variables/_colors.css`:

```css
:where(:root) {
  --gray-0: #fff;
  --gray-12: #000;
  --blue-light: #e8f4fd;
  --blue-dark: #3b82f6;
  /* ... */
}
```

You can update these base values, add your own brand palette, or have the theme files reference hex values directly. Whatever fits your workflow.

## Other design tokens

Additional styling tokens live in `src/styles/variables/` if you need to go deeper:

- `_spacing.css`: Spacing scale for padding, gaps, and margins
- `_content-widths.css`: Max widths for page sections
- `_radius.css`: Border radius values
- `_animations.css`: Transition timing

These are less likely to need changes early on, but they're there when you need them.

## CSS Cascade Layers

When you start customizing component styles or writing new CSS, it helps to know how the layers work.

Styles are organized into six layers, in order of precedence:

1. **`reset`**: Normalizes browser defaults
2. **`base`**: Typography, form elements, HTML element styles
3. **`components`**: Building block component styles (buttons, cards, navigation)
4. **`page-sections`**: Page section component styles (heroes, features, CTAs)
5. **`utils`**: Utility classes (e.g., `.visually-hidden`)
6. **`overrides`**: Custom overrides and page-specific styles

Later layers always win over earlier layers, **regardless of CSS specificity**. This means you don't have to fight specificity battles when customizing.

When building or modifying components, use the matching layer:

- **Building block components** → `@layer components`
- **Page section components** → `@layer page-sections`
- **Custom overrides** → `@layer overrides`

## Customizing individual components

Every component in this starter is yours to extend. The HTML, CSS, and JavaScript all live together in a single `.astro` file, so everything you need to customize is in one place.

Open any component and you'll find the markup at the top, scoped styles in a `<style>` tag, and optional interactivity in a `<script>` tag. Change the HTML structure, tweak the styles, add behavior, make it your own.

If a component is close to what you need, don't feel boxed in by the defaults. Reshape it to match your brand and product requirements.

When editing styles, keep using and extend the design tokens (like `var(--color-brand)` and spacing variables) so your changes stay consistent with the rest of the system.

## Next up

You've got the look and feel dialed in. Now let's go deeper. Head to [Building a Page Section](/component-docs/building-a-page-section/) to learn how to create your own components from scratch.
