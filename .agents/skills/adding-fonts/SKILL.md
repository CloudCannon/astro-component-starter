---
name: adding-fonts
description: Use when adding a new font, swapping the body or heading typeface, adding a third font family (mono/display), or troubleshooting font loading/preload/network requests in the Astro component starter.
---

# Adding & changing fonts

Fonts are configured in exactly one file, `site-fonts.mjs` at the project root, which feeds both Astro's built-in Fonts API (`fonts: siteFonts` in `astro.config.mjs`) and the `<Font />` tags rendered by `src/layouts/SiteFonts.astro`. This skill is the canonical owner of fonts (`site-fonts.mjs`, self-hosting, `SiteFonts.astro`) per `.agents/skills/STYLE.md` — everywhere else links here.

## When to use

- Adding a new font, or swapping the body (`--font-body`) or heading (`--font-headings`) typeface.
- Adding a third family (e.g. a display or mono font) for a specific use.
- A font isn't loading, the wrong weight renders, or you see unexpected network requests to a font CDN.

## When not to use

| Situation                                                  | Go instead to                  |
| ---------------------------------------------------------- | ------------------------------ |
| Changing type scale/sizes (`--font-size-*`, heading sizes) | [theming](../theming/SKILL.md) |
| Defining a brand-new design token that isn't a font        | [theming](../theming/SKILL.md) |

## The one-file rule

**MUST:** change fonts only in `site-fonts.mjs`. **MUST NOT** touch `astro.config.mjs`'s `fonts` key or `SiteFonts.astro` to add/change a font.
**Why:** both already read `siteFonts` generically — `astro.config.mjs` passes the whole array to Astro's Fonts API, and `SiteFonts.astro` maps over it rendering one `<Font cssVariable={entry.cssVariable} />` per entry. Editing either file to special-case a font duplicates configuration that belongs in one place and will drift.

`siteFonts` is an array of font family entries. Fields, verified against Astro's `FontFamilySchema` and how `SiteFonts.astro` consumes them:

| Field              | Meaning                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`             | The font family name. For `fontProviders.fontsource()` it **must match the Fontsource catalog name exactly** (case-sensitive); for `fontProviders.local()` it's an arbitrary label.                                                                                                                           |
| `cssVariable`      | Which design-system CSS custom property this entry fills — currently `--font-body` or `--font-headings` (add a new one, e.g. `--font-display`, for a third family). `Font.astro` looks this up via `componentDataByCssVariable`; a typo throws a build-time `FontFamilyNotFound` error, not a silent failure. |
| `provider`         | `fontProviders.fontsource()` (preferred) or `fontProviders.local()` (proprietary files) — see below.                                                                                                                                                                                                          |
| `weights`          | Discrete weights (`[400, 600, 700]`) or a variable-font range string (`["100 900"]`).                                                                                                                                                                                                                         |
| `styles`           | e.g. `["normal"]`, `["normal", "italic"]`.                                                                                                                                                                                                                                                                    |
| `subsets`          | Character subsets to fetch, e.g. `["latin"]` — keeps the self-hosted files small. Only meaningful for remote-catalog providers (fontsource/google/etc.), not `local()`.                                                                                                                                       |
| `options.variants` | `local()` only — see [Proprietary/local fonts](#proprietary-fonts-fontproviderslocal).                                                                                                                                                                                                                        |

Astro computes an optimized, metric-matched fallback stack automatically and bakes it into the `--font-body`/`--font-headings` custom property value — do not hand-write a fallback stack in CSS (see `optimizedFallbacks`/`fallbacks` options in Astro's font reference if you need to override it).

## Swap the body or heading font

1. **Install the Fontsource package** (browse names at [fontsource.org](https://fontsource.org/)):
   ```bash
   npm install @fontsource/<font-name>
   ```
2. **Then run `npm run deps:sync`** (never a bare `npm install` after — it breaks the Linux CI lockfile; see `CLAUDE.md`).
3. **Edit the matching entry** in `site-fonts.mjs` — keep `cssVariable` as `--font-body` or `--font-headings`, change `name` to the new font's exact catalog name, and set `weights`/`styles` to what the new font ships:
   ```js
   {
     name: "Open Sans",
     cssVariable: "--font-body",
     provider: fontProviders.fontsource(),
     weights: [400, 600, 700],
     styles: ["normal"],
     subsets: ["latin"],
   },
   ```
4. **Uninstall the old package** (optional cleanup): `npm uninstall @fontsource/<old-font>`, then `npm run deps:sync` again.

Nothing else changes — `astro.config.mjs` and `SiteFonts.astro` already read `siteFonts` generically, and every component already consumes `var(--font-body)` / `var(--font-headings)` from `src/styles/base/_typography.css`.

## Add a third family (mono, display, etc.)

1. Install the package and sync deps as above.
2. Add a new entry with a **new** `cssVariable` (do not reuse `--font-body`/`--font-headings`):
   ```js
   {
     name: "JetBrains Mono",
     cssVariable: "--font-mono",
     provider: fontProviders.fontsource(),
     weights: [400, 700],
     styles: ["normal"],
     subsets: ["latin"],
   },
   ```
3. Declare (or override) the token in `src/styles/variables/_fonts.css` if it isn't there yet, and consume it as `var(--font-mono)` from CSS. `--font-mono` currently exists there as a hand-written system-font stack (no self-hosted file); pointing it at a `siteFonts` entry instead replaces that stack.

## Proprietary fonts: `fontProviders.local()`

Use this only for a font not published on Fontsource (e.g. a licensed brand typeface). Prefer Fontsource whenever the font is available there.

1. **Place `.woff2` files under `src/assets/fonts/`** (the directory exists, currently empty). **MUST NOT** put font files in `public/` — Astro's own guidance: files there get duplicated into the build output.
2. Configure with explicit variants:
   ```js
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
   ```
   For a variable font, use one variant with a weight range instead of one variant per weight:
   ```js
   { weight: "100 900", style: "normal", src: ["./src/assets/fonts/BrandSans-Variable.woff2"] }
   ```

## Required weights

`src/styles/variables/_fonts.css` defines three weight tokens consumed across components: `--font-weight-normal`, `--font-weight-semibold`, and `--font-weight-bold`. Any font you register — via either provider — must cover the weights those tokens map to (read the file for the current values), or be a variable font spanning the range. Token values are owned by [theming](../theming/SKILL.md) — do not rely on this skill for them.

## What NOT to do

| MUST NOT                                                       | Why                                                                                                                                                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a Google Fonts (or any) `<link>`/`@import` tag to a layout | Bypasses `site-fonts.mjs` entirely; the site currently makes zero external font requests — a `<link>` reintroduces one and nothing reads its weights/subsets.                                                        |
| Hand-write an `@font-face` rule in CSS                         | `Font.astro` already emits the `@font-face` + custom-property CSS for every `siteFonts` entry (`data.css` in `node_modules/astro/components/Font.astro`); a hand-written rule duplicates or fights it.               |
| Hardcode `font-family: …` in a component's `<style>`           | Every component styles text with `var(--font-body)` / `var(--font-headings)` / `var(--font-mono)`; a hardcoded family can't be swapped by editing `site-fonts.mjs` and silently opts that component out of rebrands. |

## How font loading works

`SiteFonts.astro` renders one `<Font cssVariable={entry.cssVariable} />` per `siteFonts` entry. Each `<Font />` emits an inline `<style>` with the computed `@font-face` rules and the `--font-*` custom property (including the auto-generated fallback stack), plus `<link rel="preload">` tags only for entries it's told to preload — this starter's `SiteFonts.astro` doesn't pass a `preload` prop, so no preload links are emitted by default; font files load as CSS discovers them.

Astro downloads/generates font files during dev and build and self-hosts them — dev serves from `.astro/fonts/`, production build output is `dist/_astro/fonts/*.woff2`. No runtime requests to Google, Fontsource's CDN, or any other font service.

## Troubleshooting

| Problem                                            | Fix                                                                                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Build throws `FontFamilyNotFound`                  | `cssVariable` in `site-fonts.mjs` doesn't match what a consumer requests — check `SiteFonts.astro` and any `var(--font-*)` usage for a typo. |
| Font not loading / build fetch fails               | `name` doesn't match the Fontsource catalog name exactly (case-sensitive).                                                                   |
| Weight looks wrong                                 | `weights` doesn't include the weight in use — check against the [required weights](#required-weights) table.                                 |
| Stale cached fonts after changing `site-fonts.mjs` | Delete the `.astro/` directory at the project root (gitignored, regenerated on next `dev`/`build`).                                          |

## Verify your work

- Run `npm run check` — expect exit 0 (lint, format, `astro check`, previews and skills drift all clean).
- Run `npm run dev`, open the site, and inspect the rendered body/heading text — confirm the intended typeface is applied.
- Open the browser Network tab and confirm font requests resolve to local `/_astro/fonts/*` (or `.astro/fonts/` sourced) `.woff2` paths — **not** any external host (`fonts.googleapis.com`, `fonts.gstatic.com`, a CDN).
- If you edited `package.json` (installed/removed a `@fontsource/*` package), confirm you ran `npm run deps:sync`, not a bare `npm install`.
