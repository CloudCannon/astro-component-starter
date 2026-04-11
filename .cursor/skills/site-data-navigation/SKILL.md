---
name: site-data-navigation
description: Configure site-wide data including navigation, footer, and SEO. Use when setting up or editing mainNav.json, footer.json, seo.json, or understanding how navigation components consume data.
---

# Site Data & Navigation

Site-wide data (navigation, footer, SEO) lives in JSON files under `src/data/`. These are imported directly in layouts and components, and are editable through CloudCannon's data collection.

## Data files overview

| File                    | Purpose           | Consumed by                      |
| ----------------------- | ----------------- | -------------------------------- |
| `src/data/mainNav.json` | Header navigation | `MainNav.astro` via `Page.astro` |
| `src/data/footer.json`  | Footer content    | `Footer.astro` via `Page.astro`  |
| `src/data/seo.json`     | SEO defaults      | `BaseLayout.astro`               |

---

## Navigation (`src/data/mainNav.json`)

### Structure

```json
{
  "logoSource": "/images/logo.svg",
  "logoAlt": "Logo",
  "navData": [
    {
      "name": "Home",
      "path": "/",
      "children": []
    },
    {
      "name": "Services",
      "path": "/services/",
      "children": [
        {
          "name": "Consulting",
          "path": "/services/consulting/",
          "children": []
        },
        {
          "name": "Development",
          "path": "/services/development/",
          "children": []
        }
      ]
    }
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

### Fields

| Field            | Type   | Purpose                                              |
| ---------------- | ------ | ---------------------------------------------------- |
| `logoSource`     | string | Path to logo image (static `/images/` or asset path) |
| `logoAlt`        | string | Alt text for logo                                    |
| `navData`        | array  | Navigation items (up to 3 levels deep)               |
| `buttonSections` | array  | Action buttons in the nav bar (e.g., search, CTA)    |

### Navigation item shape

Each item in `navData` has:

| Field      | Type   | Purpose                                      |
| ---------- | ------ | -------------------------------------------- |
| `name`     | string | Display text                                 |
| `path`     | string | URL path (use trailing slash)                |
| `children` | array  | Child nav items (same shape, up to 3 levels) |

Three nesting levels are supported. CloudCannon provides structure definitions for each level (`navItemLevel1`, `navItemLevel2`, `navItemLevel3`) in the nav component's inputs file.

### How it renders

`MainNav.astro` receives the full JSON as props via `Page.astro`. It renders:

- Logo as a linked image
- Desktop nav using the `Bar` component with `navData`
- Action buttons using `ButtonGroup` with `buttonSections`
- Mobile nav using the `Mobile` component (merges `buttonSections` into `navData` as synthetic items)

The nav is sticky-positioned at the top of the page with `z-index: var(--layer-2)`.

---

## Footer (`src/data/footer.json`)

### Structure

```json
{
  "logoSource": "/images/logo.svg",
  "logoAlt": "Logo",
  "links": [
    {
      "name": "Home",
      "path": "/"
    },
    {
      "name": "About",
      "path": "/about/"
    },
    {
      "name": "Blog",
      "path": "/blog/"
    }
  ],
  "socials": [
    {
      "icon": "social/github",
      "link": "https://github.com/your-org"
    },
    {
      "icon": "social/x",
      "link": "https://x.com/your-handle"
    },
    {
      "icon": "social/linkedin",
      "link": "https://linkedin.com/company/your-company"
    }
  ],
  "footerText": "© 2026 Your Company. All rights reserved."
}
```

### Fields

| Field        | Type   | Purpose                 |
| ------------ | ------ | ----------------------- |
| `logoSource` | string | Path to footer logo     |
| `logoAlt`    | string | Alt text for logo       |
| `links`      | array  | Footer navigation links |
| `socials`    | array  | Social media icon links |
| `footerText` | string | Copyright / legal text  |

### Link item shape

| Field  | Type   | Purpose      |
| ------ | ------ | ------------ |
| `name` | string | Display text |
| `path` | string | URL path     |

### Social item shape

| Field  | Type   | Purpose                                        |
| ------ | ------ | ---------------------------------------------- |
| `icon` | string | Icon name from icon set (use `social/` prefix) |
| `link` | string | Full URL to social profile                     |

### Available social icons

Icons live in `src/icons/social/`. Common options:

- `social/github`
- `social/x`
- `social/linkedin`
- `social/facebook`
- `social/instagram`
- `social/youtube`

Check `src/icons/social/` for the full list of available SVGs.

### How it renders

`Footer.astro` renders:

- Top row: logo + navigation links (via `Bar` component)
- Divider
- Bottom row: footer text + social icon buttons (ghost variant, icon-only)

---

## SEO (`src/data/seo.json`)

### Structure

```json
{
  "name": "Your Site Name",
  "url": "https://yourdomain.com",
  "description": "Default meta description for pages without one.",
  "logoSource": "/images/logo.svg",
  "titleFormat": "{title} | Your Site Name"
}
```

### Fields

| Field           | Type   | Purpose                                                   |
| --------------- | ------ | --------------------------------------------------------- |
| `name`          | string | Site name (used in structured data)                       |
| `url`           | string | Production URL (used in structured data, canonical links) |
| `description`   | string | Fallback meta description                                 |
| `logoSource`    | string | Fallback OG image                                         |
| `titleFormat`   | string | Title template — `{title}` is replaced with page title    |
### How it's consumed

`BaseLayout.astro` imports `seo.json` and uses it for:

- `<title>` tag via the title format template
- OpenGraph meta tags (title, description, image)
- Canonical link (page URL or override from frontmatter)
- `StructuredData.astro` — renders JSON-LD `Organization` schema

Per-page overrides come from page frontmatter (`description`, `image`, `canonical`). The page title is always from frontmatter; SEO data provides the wrapping format.

---

## Data flow diagram

```
src/data/mainNav.json ─┐
                       ├→ src/pages/[...slug].astro (imports both)
src/data/footer.json  ─┘         │
                                 ↓
                        src/layouts/Page.astro
                           │           │
                           ↓           ↓
                     MainNav.astro  Footer.astro

src/data/seo.json ──→ src/layouts/BaseLayout.astro
                           │           │
                           ↓           ↓
                     <SEO> tags   StructuredData.astro
```

---

## CloudCannon editing

### Data collection

The `data` collection in `cloudcannon.config.yml` makes all JSON files editable:

```yaml
data:
  path: src/data
  glob:
    - '**/*.json'
  icon: database
  _enabled_editors:
    - data
```

Editors see a "Data" section in CloudCannon with entries for `mainNav`, `footer`, and `seo`.

### Structure definitions

CloudCannon uses structure files in `.cloudcannon/structures/` to define the shape of array items:

| Structure file                       | Used for                    |
| ------------------------------------ | --------------------------- |
| `navData.cloudcannon.structures.yml` | Navigation items (3 levels) |
| `links.cloudcannon.structures.yml`   | Footer links                |
| `socials.cloudcannon.structures.yml` | Social media links          |

These are loaded globally via `_structures_from_glob` in `cloudcannon.config.yml`.

The nav component also defines its own inline structures in `main-nav.cloudcannon.inputs.yml` for the same nav item levels — these provide CloudCannon with field types and comments for the editing UI.

---

## Setting up for a new site

### Step 1: Update SEO data

Edit `src/data/seo.json`:

- Set `name` to the site name
- Set `url` to the production URL
- Set `description` to the default meta description
- Set `titleFormat` to include the site name

Also update `site` in `astro.config.mjs` to match the production URL.

### Step 2: Update navigation

Edit `src/data/mainNav.json`:

- Replace `logoSource` with the site's logo path (place the SVG in `public/images/`)
- Set `logoAlt`
- Replace `navData` with the site's navigation structure
- Update `buttonSections` (or set to `[]` to remove nav buttons)

### Step 3: Update footer

Edit `src/data/footer.json`:

- Replace `logoSource` and `logoAlt`
- Replace `links` with footer navigation
- Replace `socials` with actual social media links
- Update `footerText` with copyright text

### Step 4: Add logo files

Place logo files in `public/images/` for static serving, or in `src/assets/images/` if you want Astro image optimization. The nav and footer reference these via `logoSource`.
