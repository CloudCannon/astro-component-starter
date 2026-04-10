---
name: adding-fonts
description: Add or change fonts in the Astro component starter using local @fontsource packages. Use when adding a new font, changing the body or heading font, switching font providers, or troubleshooting font loading.
---

# Adding & Changing Fonts

Fonts are configured in a single file: `site-fonts.mjs` at the project root. This file feeds both Astro's built-in Fonts API (`astro.config.mjs`) and the layout's `<Font />` tags (`src/layouts/SiteFonts.astro`).

The project uses two CSS variable slots that the entire design system references:

| Variable          | Purpose  |
| ----------------- | -------- |
| `--font-body`     | Body text, UI elements |
| `--font-headings` | Headings (h1–h6) |

Components never hardcode font families — they use these variables, so changing fonts here changes everything.

## Preferred approach: @fontsource packages

**Always prefer fontsource over Google Fonts or other remote providers.** Fontsource packages bundle the font files locally in `node_modules`, so builds don't depend on external services and fonts are self-hosted automatically.

### Changing an existing font

1. **Install the new fontsource package:**

```bash
npm install @fontsource/<font-name>
```

Browse available fonts at [fontsource.org](https://fontsource.org/).

2. **Update `site-fonts.mjs`:**

```js
import { fontProviders } from "astro/config";

export const siteFonts = [
  {
    name: "Open Sans",             // must match the fontsource catalog name
    cssVariable: "--font-body",    // keep this — the CSS references it
    provider: fontProviders.fontsource(),
    weights: [400, 600, 700],      // must include weights used in _fonts.css
    styles: ["normal"],
  },
  {
    name: "Montserrat",
    cssVariable: "--font-headings",
    provider: fontProviders.fontsource(),
    weights: [400, 600, 700],
    styles: ["normal"],
  },
];
```

3. **Remove the old fontsource package** (optional cleanup):

```bash
npm uninstall @fontsource/<old-font>
```

No other files need to change — `astro.config.mjs` and `SiteFonts.astro` read from `site-fonts.mjs` automatically.

### Adding a third font

If you need a font beyond body and headings (e.g. a monospace or display font):

1. Install the package: `npm install @fontsource/<font-name>`

2. Add a new entry to `site-fonts.mjs` with a new CSS variable name:

```js
{
  name: "JetBrains Mono",
  cssVariable: "--font-mono",
  provider: fontProviders.fontsource(),
  weights: [400, 700],
  styles: ["normal"],
},
```

3. Use the variable in CSS or override the existing `--font-mono` token in `src/styles/variables/_fonts.css`.

## Alternative: raw local font files

For fonts not available on Fontsource (e.g. a proprietary brand font), use `fontProviders.local()` with the font files on disk.

1. **Place `.woff2` files in `src/assets/fonts/`.**

2. **Configure with `fontProviders.local()`:**

```js
import { fontProviders } from "astro/config";

export const siteFonts = [
  {
    name: "BrandSans",
    cssVariable: "--font-body",
    provider: fontProviders.local(),
    options: {
      variants: [
        { weight: 400, style: "normal", src: ["./src/assets/fonts/BrandSans-Regular.woff2"] },
        { weight: 600, style: "normal", src: ["./src/assets/fonts/BrandSans-SemiBold.woff2"] },
        { weight: 700, style: "normal", src: ["./src/assets/fonts/BrandSans-Bold.woff2"] },
      ],
    },
  },
];
```

For variable fonts, specify a weight range instead of individual weights:

```js
{
  name: "BrandSans",
  cssVariable: "--font-body",
  provider: fontProviders.local(),
  options: {
    variants: [
      { weight: "100 900", style: "normal", src: ["./src/assets/fonts/BrandSans-Variable.woff2"] },
    ],
  },
},
```

## Required weights

The design system (`src/styles/variables/_fonts.css`) defines three weight tokens. Any font you add must include at least these weights (or be a variable font covering the range):

| Token                      | Weight |
| -------------------------- | ------ |
| `--font-weight-normal`     | 400    |
| `--font-weight-semibold`   | 600    |
| `--font-weight-bold`       | 700    |

## How font loading works

`SiteFonts.astro` iterates over `siteFonts` and renders Astro's `<Font />` component for each entry, which handles preloading and CSS variable injection:

```astro
{siteFonts.map((entry) => <Font cssVariable={entry.cssVariable} />)}
```

Astro downloads/caches font files during build and outputs them to `_astro/fonts/`, self-hosting them in production. No external requests at runtime.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Font not loading | Verify `name` matches the fontsource catalog exactly (case-sensitive) |
| Weights look wrong | Ensure `weights` array includes 400, 600, 700 |
| CSS variable not applied | Check `cssVariable` matches `--font-body` or `--font-headings` |
| Stale cached fonts | Delete `.astro/fonts/` (dev) or `node_modules/.astro/fonts/` (build) |
