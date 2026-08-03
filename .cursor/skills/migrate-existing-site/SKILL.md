---
name: migrate-existing-site
description: Use when converting an existing website's pages, content, branding, and structure into this Astro + CloudCannon component starter — an end-to-end, multi-phase migration.
---

# Migrate an existing site

Orchestration workflow for turning an existing website into this starter. Almost every phase delegates to an owner skill — this skill's job is the **order** of phases, each phase's **deliverable**, and the migration-specific judgment calls no owner skill makes (inventory checklist, reuse-over-rebuild bias, asset handling).

## When to use

- Recreating an existing site's pages, branding, and content structure in this starter, from a live URL, screenshots, or exported HTML.

## When not to use

- Building one new page section from a screenshot with no other migration context — go straight to [screenshot-to-component](../screenshot-to-component/SKILL.md).
- Only rebranding (colors/fonts) with no content migration — [theming](../theming/SKILL.md) alone.
- Only adding/editing blog posts or pages in an already-migrated site — [blog-mdx-content](../blog-mdx-content/SKILL.md) or [page-content-authoring](../page-content-authoring/SKILL.md).

## Phases

Work top to bottom. Each phase's deliverable is an input to the next — do not skip ahead to building pages before the brand and component gaps are settled.

| #   | Phase                               | Owner skill                                                                                          | Deliverable                                                          |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Inventory the source site           | Here (below)                                                                                         | Written inventory: pages, sections, nav/footer, brand, content types |
| 2   | Brand first                         | [theming](../theming/SKILL.md), [adding-fonts](../adding-fonts/SKILL.md)                             | Token edits + fonts configured                                       |
| 3   | Map sections to existing components | [page-content-authoring](../page-content-authoring/SKILL.md) catalog                                 | A source-section → `_component` mapping, with gaps flagged           |
| 4   | Build the gap components            | [screenshot-to-component](../screenshot-to-component/SKILL.md)                                       | New page-section directories for every flagged gap                   |
| 5   | Recreate pages                      | [page-content-authoring](../page-content-authoring/SKILL.md)                                         | `.md` files in `src/content/pages/` with full `pageSections`         |
| 6   | Nav / footer / SEO data             | [site-data-navigation](../site-data-navigation/SKILL.md)                                             | `mainNav.json`, `footer.json`, `seo.json` updated                    |
| 7   | Blog/article content (skip if none) | [blog-mdx-content](../blog-mdx-content/SKILL.md)                                                     | `.mdx` files in `src/content/blog/`                                  |
| 8   | Verify in CloudCannon               | [editable-regions](../editable-regions/SKILL.md), [debug-cloudcannon](../debug-cloudcannon/SKILL.md) | Every section renders and is editable                                |

**Why brand before sections:** a section built against the wrong tokens has to be re-checked once the palette/radii/shadows land. Locking the brand first means every component built in phase 4 is already correct.

---

## Phase 1: Inventory the source site

Load each page of the source site (browser, fetch, or provided screenshots) and record:

| Capture                                                     | Detail                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages                                                       | Every route/URL, and what it's for (home, about, pricing, contact, blog index...)                                                                                                                                                                                             |
| Nav                                                         | Logo, menu items + links, dropdown/children, CTA button(s)                                                                                                                                                                                                                    |
| Footer                                                      | Link columns, social icons + URLs, copyright text                                                                                                                                                                                                                             |
| Brand — colors                                              | Background, text, brand/accent, link, border colors (dev tools' computed styles or a color picker)                                                                                                                                                                            |
| Brand — shape                                               | Border radius (sharp/soft/pill), shadow depth (flat/subtle/heavy)                                                                                                                                                                                                             |
| Brand — fonts                                               | Body and heading typeface names, weights used, provider (Google Fonts, self-hosted, system)                                                                                                                                                                                   |
| Content types                                               | Is there a blog? Tags/categories? Pagination? Any other repeating content collection?                                                                                                                                                                                         |
| Per-section (for every distinct visual block on every page) | Layout type (centered / split / grid of cards / accordion / slider / custom), exact heading + body text, image URLs + what they depict, button labels + link targets + primary-vs-secondary, background treatment (light/dark/colored/image), repeating-item count and fields |

Segment sections at background-color changes, large vertical gaps, or dividers — each becomes one row. This is the same segmentation rule [screenshot-to-component](../screenshot-to-component/SKILL.md#multi-section-screenshots) uses when the reference is one long screenshot; do it once here for the whole site rather than re-deriving it per page.

**Done-check:** every page has a list of ordered sections, each with a layout type and its text/image/button content noted — enough to fill in `pageSections` later without going back to the source site.

## Phase 2: Brand first

Feed the phase-1 brand capture into [theming](../theming/SKILL.md)'s token files — primitive palette values in `variables/_colors.css`, then the semantic remap in both theme files. Fonts always go through [adding-fonts](../adding-fonts/SKILL.md), since the token files never carry a font.

**Done-check:** `npm run dev` shows the source site's palette, radii, and shadows in both light and dark, and the source site's fonts render for body and headings.

## Phase 3: Map sections to existing components

For each inventoried section, match it to an existing page section before considering a new one. Use the [page-content-authoring catalog](../page-content-authoring/SKILL.md) for the authoritative prop list of each candidate — this table is only for pattern-matching, not props.

| Source section pattern                          | Likely component                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| Centered heading + subtext + buttons            | `page-sections/heroes/hero-center`                                                    |
| Text + image side by side (hero position)       | `page-sections/heroes/hero-split`                                                     |
| Grid of items with icons/titles                 | `page-sections/features/feature-grid`                                                 |
| Text + image alternating, one feature at a time | `page-sections/features/feature-split`                                                |
| Sliding/carousel cards                          | `page-sections/features/feature-slider`                                               |
| Centered heading + buttons, no image            | `page-sections/ctas/cta-center`                                                       |
| Text + image + buttons                          | `page-sections/ctas/cta-split`                                                        |
| Contact form + image                            | `page-sections/ctas/cta-form`                                                         |
| Accordion of Q&A                                | `page-sections/info-blocks/faq-section`                                               |
| Grid of people/avatars                          | `page-sections/people/team-grid`                                                      |
| Quote with attribution                          | `page-sections/people/testimonial-section`                                            |
| Anything else                                   | `page-sections/builders/custom-section` composing building blocks, or a new component |

### Reuse-over-rebuild bias

**MUST:** prefer an existing component adjusted by props over a new component, and prefer `custom-section` composing existing building blocks over a bespoke new page section.
**Why:** every new component is a maintenance surface (YAML, previews) the starter carries forever; most "unique" source sections are a familiar layout with different copy, image position, or color.

| If the source section...                                                                                       | Then...                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Matches an existing component's layout, differing only in color/background/reverse/alignment                   | Reuse it, set props accordingly                                                                                                                  |
| Doesn't match any single component, but its elements (heading, text, cards, grid) all exist as building blocks | Compose it with `custom-section` — see the catalog entry in [page-content-authoring](../page-content-authoring/SKILL.md) for its full prop shape |
| Has a layout or interaction genuinely absent from both the page-section and building-block catalogs            | Flag as a gap for phase 4                                                                                                                        |

**Deliverable:** a table of source section → `_component` (existing or "NEW: `<proposed-slug>`"), covering every section from phase 1.

## Phase 4: Build the gap components

For every section flagged "NEW" in phase 3, follow [screenshot-to-component](../screenshot-to-component/SKILL.md) (it covers segmenting a multi-section reference and scaffolding each one), which delegates to [create-component](../create-component/SKILL.md) for the file layout.

**Shared naming prefix:** when a migration produces several new, site-specific components, give them a common kebab-case prefix so they read as one group in the component picker (e.g. `dental-hero`, `dental-services`) — screenshot-to-component's [multi-section guidance](../screenshot-to-component/SKILL.md#multi-section-screenshots) already states this; apply it across the whole site, not just one screenshot.

**Done-check:** each new component has a `*.preview.mjs` recipe, `npm run previews:build` compiles them with no errors, and each appears in the Visual Editor's Add menu.

## Phase 5: Recreate pages

Create one `.md` file per source page in `src/content/pages/` (file path determines the URL — routing is `src/pages/[...slug].astro` reading the `pages` content collection by slug; there is no separate redirects config in this starter, so map old URLs directly onto the new slug structure rather than expecting redirect rules to carry them). Fill `pageSections` using the phase-3 mapping and phase-1 content, per [page-content-authoring](../page-content-authoring/SKILL.md)'s file format and prop reference.

Content rules specific to migration:

| Rule             | Detail                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Text             | Copy verbatim from the source; use `>-` block scalars for multiline values                                                                                                                                                                                   |
| Links            | Rewrite to the new site's slug structure (`/about/`, not `https://oldsite.com/about`)                                                                                                                                                                        |
| Buttons          | Map to the closest `variant` (`primary`, `secondary`, `tertiary`, `ghost`)                                                                                                                                                                                   |
| Images           | Point at `/src/assets/images/placeholder.jpg` until phase-1 images are downloaded and placed (see Assets below); alt text is written once, from the source image, and does not need revisiting                                                               |
| Visual treatment | Translate the source section's background into `colorScheme` + `backgroundColor`: light bg → `inherit` / `base`; light-gray bg → `inherit` / `surface`; dark bg with light text → `dark` / `surface`; brand-colored bg → `inherit` / `accent` or `highlight` |

**Page order:** build home first (most sections, sets the pattern for the rest), then key landing pages, then about/team, then contact, then blog last (most labor-intensive — phase 7).

**Done-check:** `npm run dev` renders every recreated page with no console "Component not found" warnings and no placeholder text left over from a page that's supposed to be finished.

## Phase 6: Nav / footer / SEO data

Follow [site-data-navigation](../site-data-navigation/SKILL.md) to populate `src/data/mainNav.json`, `src/data/footer.json`, and `src/data/seo.json` from the phase-1 nav/footer capture, and update `site` in `astro.config.mjs` to the production URL. Logo files (light + dark variant) go in `src/assets/images/` and are referenced from all three data files via `logoSource` / `logoAlternateSource`.

**Done-check:** header and footer render the migrated nav/logo/socials on every page; `seo.json`'s title/description show correctly in a page's `<title>`.

## Phase 7: Blog/article content

Skip this phase if the source site has no blog. Otherwise follow [blog-mdx-content](../blog-mdx-content/SKILL.md) to convert each post to `.mdx` in `src/content/blog/`, converting HTML body content to Markdown and downloading post images per Assets below.

**Done-check:** the blog index and each post render; tags/pagination (if used) work.

## Phase 8: Verify in CloudCannon

Confirm every migrated section is editable per [editable-regions](../editable-regions/SKILL.md) — this matters most for phase-4 new components, since reused components already have bindings wired. Use [debug-cloudcannon](../debug-cloudcannon/SKILL.md) for anything that doesn't render, doesn't appear in the picker, or doesn't live-update.

**Done-check:** open every migrated page in the Visual Editor; every text/image/array field is clickable and edits reflect live, with no "Component not found" warnings.

---

## Assets

Download every source image into `src/assets/images/` (Astro optimizes images from this path), organizing into subdirectories when the site has many (`src/assets/images/team/`, `src/assets/images/blog/`). Use `/src/assets/images/placeholder.jpg` as a stand-in during phases 5–7 and swap in the real path once downloaded — write the real alt text immediately even against the placeholder, so nothing needs a second pass.

## Verify your work

- Run `npm run check` — expect exit 0, no lint/type errors, no skills drift.
- If phase 4 added any page-builder component, author each a `*.preview.mjs` recipe and run `npm run previews:build` — new SVGs appear with no build errors.
- Run `npm run dev`, click through every migrated page, and open each in the CloudCannon Visual Editor per phase 8's done-check.
