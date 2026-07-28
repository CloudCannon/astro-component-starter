---
name: site-data-navigation
description: Use when editing site-wide navigation, footer, or SEO defaults — mainNav.json, footer.json, seo.json under src/data/ — or figuring out how those files reach the nav bar, mobile menu, footer, and meta tags.
---

# Site data & navigation

Three JSON files under `src/data/` drive every page's chrome: header nav, footer, and default SEO/meta. They are plain data imported by layouts — not content collections — and CloudCannon edits them through its generic "Data" collection.

## When to use

- Adding, removing, reordering, or nesting a header nav item.
- Adding a footer link column entry or a social media link.
- Updating the site name, production URL, default description, or title template.
- Tracing how `src/data/*.json` reaches `MainNav.astro` / `Footer.astro` / `BaseLayout.astro`.

## When not to use

| Situation                                                                             | Go instead to                                                                                          |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Changing how the nav bar, dropdowns, or footer _look_ (colors, spacing, hover states) | [create-component](../create-component/SKILL.md) styling rules + [theming](../theming/SKILL.md) tokens |
| Composing page body content, choosing which page sections to use                      | [page-content-authoring](../page-content-authoring/SKILL.md)                                           |
| Wiring new `data-prop` / editable bindings on a nav component                         | [editable-regions](../editable-regions/SKILL.md)                                                       |

## Data files overview

| File                    | Controls                                                    | Imported by                                                                                                                                |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/data/mainNav.json` | Logo, header nav links, nav CTA button                      | `src/layouts/Page.astro` (default prop) → `MainNav.astro`; also imported directly by `src/pages/[...slug].astro` and `src/pages/404.astro` |
| `src/data/footer.json`  | Footer logo, link column, socials, legal text               | Same import chain as above → `Footer.astro`                                                                                                |
| `src/data/seo.json`     | Site name/URL/description, default OG image, title template | `src/layouts/BaseLayout.astro` → `SeoHead.astro` + `StructuredData.astro`                                                                  |

`Page.astro` defaults `mainNav`/`footer` props to these JSON imports; `[...slug].astro` and `404.astro` also import and pass them explicitly. Either way, editing the JSON file is what changes the rendered output — there's no other place these values come from.

---

## Navigation (`mainNav.json`)

Real excerpt (`src/data/mainNav.json`):

```json
{
  "logoSource": "/src/assets/images/component-docs/acs-logo.svg",
  "logoAlternateSource": "/src/assets/images/component-docs/acs-logo-dark.svg",
  "logoAlt": "Astro Component Starter",
  "themeToggle": true,
  "navData": [
    { "name": "Home", "path": "/", "children": [] },
    { "name": "Why", "path": "/why/", "children": [] }
  ],
  "buttonSections": [
    {
      "_component": "building-blocks/core-elements/button",
      "text": "Search",
      "hideText": true,
      "link": "/search/",
      "iconName": "magnifying-glass",
      "iconPosition": "before",
      "variant": "ghost",
      "size": "lg"
    }
  ]
}
```

| Field                 | Type    | Notes                                                                                              |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `logoSource`          | string  | Path under `/src/assets/images/...`, rendered through the `Image` building block.                  |
| `logoAlternateSource` | string  | Optional — swapped in on theme toggle. Omit the key if there's no dark variant.                    |
| `logoAlt`             | string  | Alt text for the logo image.                                                                       |
| `themeToggle`         | boolean | Shows/hides the light/dark toggle in the nav bar.                                                  |
| `navData`             | array   | Nav item tree, up to 3 levels — see below.                                                         |
| `buttonSections`      | array   | Full component blocks (each needs `_component`), rendered via `ButtonGroup` next to the nav links. |

### Nav item shape (`navData`)

Each item: `{ "name": string, "path": string, "children": [] }`. `children` nests the same shape.

**MUST NOT** nest more than 3 levels deep (top → child → grandchild). **Why:** all three nav renderers (`src/components/navigation/{bar,mobile,side}/*.astro`) hardcode exactly 3 levels — `Bar.astro` and `Mobile.astro` via nested `createNavItemData` calls, `Side.astro` via inline `children`/`grandChild` maps — and none reads a grandchild's own `children`, so a 4th level is silently dropped, not an error.

**Internal vs external links:** `path` is a plain string, not a special union — write `/services/` for internal routes (leading slash) or `https://example.com` for external. **Why it matters here specifically:** `itemHasSplitNavLink()` (`src/components/utils/navSplitLink.ts`) treats a parent nav item as having a _real_ link only when `path` starts with `/`, `http://`, `https://`, `mailto:`, or `tel:`. A parent with `path: "#"` or `path: ""` renders as a dropdown-only toggle (whole row opens the submenu); a parent with a real `path` renders a **split row** — the text is a clickable link and a separate small chevron button opens the submenu. Decide which behavior you want before picking a placeholder vs. a real path for a parent item.

### How it renders

`MainNav.astro` (`src/components/navigation/main-nav/MainNav.astro`) receives the whole JSON as props:

- Logo, linked to `/`, via the `Image` building block.
- Desktop nav: `Bar` component (`navData`), hidden below 769px via a container query.
- `ThemeToggle`, shown only if `themeToggle: true`.
- `ButtonGroup` for `buttonSections`.
- `Mobile` component, which receives `navData` **merged with `buttonSections`** — each button becomes a synthetic flat nav item (`{ name: button.text, path: button.link ?? button.href ?? "#", children: [] }`) so it shows up in the mobile menu list too.

The nav renders inside `CustomSection`, sticky-positioned (`position: sticky; top: 0; z-index: var(--layer-2);`).

---

## Footer (`footer.json`)

Real excerpt (`src/data/footer.json`):

```json
{
  "logoSource": "/src/assets/images/component-docs/acs-logo.svg",
  "logoAlternateSource": "/src/assets/images/component-docs/acs-logo-dark.svg",
  "logoAlt": "Astro Component Starter",
  "links": [
    { "name": "Home", "path": "/" },
    { "name": "Why", "path": "/why/" },
    { "name": "Components", "path": "/component-docs/" },
    { "name": "Blog", "path": "/blog/" }
  ],
  "socials": [
    { "icon": "social/github", "link": "https://github.com" },
    { "icon": "social/x", "link": "https://x.com" },
    { "icon": "social/linkedin", "link": "https://linkedin.com" }
  ],
  "footerText": "© 2026 All rights reserved."
}
```

| Field                                            | Type   | Notes                                                                                                                                                                                                                                  |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logoSource` / `logoAlternateSource` / `logoAlt` | string | Same conventions as nav.                                                                                                                                                                                                               |
| `links`                                          | array  | Flat `{ name, path }` — **no nesting/children field**, unlike `navData`. Rendered through the same `Bar` component but items are always flat links (dropdowns only trigger when an item has `children`, which footer links never set). |
| `socials`                                        | array  | `{ icon, link, label }`. `label` (optional) overrides the auto-generated `aria-label` (`Visit our {icon-name} page`); leave it empty to keep the default.                                                                              |
| `footerText`                                     | string | Legal/copyright text, rendered as-is (plain text, not markdown).                                                                                                                                                                       |

**Social icon values:** `icon` must be one of the `social/*` ids from `cloudcannon.config.yml`'s `_select_data.icons` list, matching an SVG in `src/icons/social/` (`bluesky`, `discord`, `facebook`, `github`, `gitlab`, `gitter`, `google`, `instagram`, `linkedin`, `medium`, `pinterest`, `reddit`, `tiktok`, `twitch`, `x`, `yelp`, `youtube`). A non-`social/`-prefixed icon still renders but loses the filled-icon styling `Icon.astro` applies via `name?.includes("social/")`.

### How it renders

`Footer.astro` (`src/components/navigation/footer/Footer.astro`):

- Top row: logo (`Image`) + `links` (via `Bar`, flat list, no dropdown).
- `Divider`.
- Bottom row: `footerText` (via `Text`) + `socials` as ghost icon-only `Button`s, each `target="_blank" rel="noopener noreferrer"`.

---

## SEO (`seo.json`)

Real content of `src/data/seo.json`:

```json
{
  "_schema": "seo",
  "name": "Astro Component Starter",
  "url": "https://example.com",
  "description": "Build fast, customizable Astro sites with a modern component starter that is easy to edit and maintain.",
  "logoSource": "/src/assets/images/component-docs/acs-logo.svg",
  "titleFormat": "{title} | Astro Component Starter"
}
```

| Field         | Type   | Consumed for                                                                                                                                                                                    |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | string | `og:site_name` meta tag; `Organization` JSON-LD `name`.                                                                                                                                         |
| `url`         | string | Fallback base for resolving `logoSource` into an absolute URL (`new URL(site.logoSource, site.url)` in `StructuredData.astro`); also the fallback if `Astro.site` isn't set in `SeoHead.astro`. |
| `description` | string | Fallback `<meta name="description">` / `og:description` when a page doesn't set its own.                                                                                                        |
| `logoSource`  | string | Fallback `og:image`; also the JSON-LD `Organization.logo`.                                                                                                                                      |
| `titleFormat` | string | `<title>` template — literal substring `{title}` is replaced with the page's title.                                                                                                             |

**MUST:** keep `_schema: seo` in the file. **Why:** it's what makes CloudCannon apply the `seo` schema (`cloudcannon.config.yml` → `collections_config.data.schemas.seo`, backed by `.cloudcannon/schemas/seo.json`) instead of the generic data-file editor.

Per-page overrides (`description`, `image`, `canonical`, `noindex`, `article`) come from page frontmatter and are read in `BaseLayout.astro`/`SeoHead.astro` — they take priority over `seo.json`, which only fills gaps. The page `<title>` itself always comes from frontmatter `title`, wrapped by `titleFormat`.

---

## Checklists

### Add / remove / reorder a nav item

- Edit the `navData` array in `src/data/mainNav.json` directly (or in CloudCannon's Data → mainNav editor).
- New item: add `{ "name": "...", "path": "...", "children": [] }` at the position you want — order in the array is display order.
- Nested item: put it inside the parent's `children` array (max 3 levels total — see above).
- Reorder: move array entries; no separate "order" field exists.
- Remove: delete the array entry (and any nested `children` under it).
- If the item should trigger a dropdown but also be clickable itself, give it a real `path` (not `#`/empty) so `itemHasSplitNavLink` renders the split row.

### Add a footer link

- Add `{ "name": "...", "path": "..." }` to the `links` array in `src/data/footer.json`. No `children` — footer links are always flat.

### Update social links

- Edit the `socials` array in `src/data/footer.json`: `icon` must be a `social/<name>` id with a matching SVG in `src/icons/social/`; `link` is the full profile URL.

### Set up SEO / nav / footer for a new site

- `seo.json`: set `name`, `url` (must match `site` in `astro.config.mjs`), `description`, `titleFormat`.
- `mainNav.json`: replace `logoSource`/`logoAlternateSource`/`logoAlt` (place new logo files under `src/assets/images/`), replace `navData`, adjust or empty `buttonSections`.
- `footer.json`: replace logo fields, `links`, `socials`, `footerText`.

---

## CloudCannon editing

Verified against `cloudcannon.config.yml`:

- The `data` collection (`collections_config.data`) globs `src/data/**/*.json`, `disable_url: true`, `icon: database`, `_enabled_editors: [data]` — grouped under the "Data" heading in `collection_groups`.
- Only `seo.json` has an explicit schema (`schemas.seo`, backed by `.cloudcannon/schemas/seo.json`), matched by its `_schema: seo` key; it also gets field-level comments from `collections_config.data.schemas.seo._inputs`.
- `mainNav.json` and `footer.json` have no dedicated schema — CloudCannon renders them with the collection's generic `_inputs` (`logoSource`/`logoAlternateSource`/`image` typed as `image` fields with upload path `src/assets/images`) plus **global structures matched by field name**: `.cloudcannon/structures/navData.cloudcannon.structures.yml`, `links.cloudcannon.structures.yml`, and `socials.cloudcannon.structures.yml`, all loaded via the root `_structures_from_glob: [/.cloudcannon/structures/*.cloudcannon.structures.yml]`. CloudCannon applies a structure automatically to any array field named `navData`, `links`, or `socials` in any collection — this is why the data file needs no per-field YAML of its own.
- These three structure files are the single source of truth for the nav-item / footer-link / social-link input shapes (name/path text+url fields, icon `select` sourced from `_select_data.icons`). If you rename a field in `mainNav.json`/`footer.json`, update the matching structure file or the editor UI will show the old field name.

**Separate and easy to confuse:** `MainNav.astro`, `Bar.astro`, `Mobile.astro`, `Footer.astro`, and `Side.astro` are each _also_ directories with their own `<kebab>.cloudcannon.inputs.yml` (e.g. `main-nav.cloudcannon.inputs.yml`) defining their own inline `navItemLevel1/2/3` structures. Those register the components for use as standalone page-section blocks (`_component: navigation/main-nav`, `_component: navigation/bar`, ...) — unrelated to how `mainNav.json`/`footer.json` are edited as data. No page content in `src/content/` currently inserts them this way. `Side.astro` in particular is not wired to `src/data/*.json` at all — it's used only by `src/component-docs/layouts/SidebarNavLayout.astro` with its own `src/component-docs/data/nav.json`.

## Verify your work

- Run `npm run check`. Expect exit 0 — no lint/format/type errors, no skills drift.
- Run `npm run dev`, load any page, and confirm the header nav / mobile menu / footer reflect your JSON change (dropdown behavior if you changed nesting, split-row behavior if you changed a parent `path`).
- If you edited `seo.json`, view source (or the dev tools Elements panel `<head>`) and confirm `<title>`, `og:*` meta tags, and the `application/ld+json` script reflect the new values.
- In the CloudCannon Visual Editor, open Data → mainNav / footer / seo and confirm each field/array renders with the expected labels — an unlabeled raw JSON field usually means a structure file's key no longer matches the data field name.
