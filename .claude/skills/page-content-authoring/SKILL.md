---
name: page-content-authoring
description: Use when assembling a page from components that already exist — writing or editing the `pageSections` array in a `src/content/pages/*.md` file, choosing which section to use for a content need, or looking up what page sections and building blocks the library ships. The catalog of every component and its props lives here.
---

# Page content authoring

Build a page by listing existing components in the `pageSections` frontmatter of a Markdown file under `src/content/pages/`. No `.astro` or CSS is written — each entry names a component by its `_component` path and sets its props. This skill owns the [component catalog](component-catalog.md): what sections and building blocks exist, and when to use each.

## When to use

- Creating a new page or editing an existing one under `src/content/pages/`.
- Populating or reordering the `pageSections` array.
- Deciding which shipped section fits a content need (hero, features, CTA, FAQ, team, testimonial).
- Looking up a component's `_component` path or its content props.

## When not to use

| Situation                                           | Go instead to                                                  |
| --------------------------------------------------- | -------------------------------------------------------------- |
| No existing section fits — you must build a new one | [create-component](../create-component/SKILL.md)               |
| Recreating a section from a screenshot / mockup     | [screenshot-to-component](../screenshot-to-component/SKILL.md) |
| Writing a blog post (`.mdx` body content)           | [blog-mdx-content](../blog-mdx-content/SKILL.md)               |
| Editing nav, footer, or social data                 | [site-data-navigation](../site-data-navigation/SKILL.md)       |

## Contents

| File                                         | Covers                                                                           |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| [component-catalog.md](component-catalog.md) | Every page section and building block: `_component` path, when to use, key props |

## Where page content lives

Pages are Markdown files under `src/content/pages/`. The file's path becomes the URL; almost all content lives in frontmatter, not the body.

| File path                                  | URL                     |
| ------------------------------------------ | ----------------------- |
| `src/content/pages/index.md`               | `/`                     |
| `src/content/pages/about.md`               | `/about/`               |
| `src/content/pages/services/consulting.md` | `/services/consulting/` |

`blog` is excluded from this catch-all route — it has its own route (`src/pages/[...slug].astro` filters it out).

The `pages` collection schema is defined in `src/content.config.ts`:

| Field          | Type     | Required | Purpose                            |
| -------------- | -------- | -------- | ---------------------------------- |
| `title`        | string   | yes      | Page title (feeds `<title>` / SEO) |
| `pageSections` | array    | yes      | Ordered section blocks to render   |
| `description`  | string   | no       | Meta description                   |
| `keywords`     | string[] | no       | Meta keywords                      |
| `image`        | string   | no       | OG image path                      |
| `canonical`    | string   | no       | Canonical URL override             |

`_schema: default` appears at the top of shipped pages — it is a CloudCannon editor key, not part of the Astro schema (the Zod schema ignores unknown keys). Keep it for editor compatibility.

## The `pageSections` array

Each item is one section. **MUST:** every item has a `_component` key set to the component's kebab-case directory path under `src/components/` (e.g. `page-sections/heroes/hero-center`). Remaining keys are the component's **camelCase** props, matching the `.astro` destructure exactly. Nested content (buttons, form fields, repeating items) is itself an array of `_component` blocks.

Working example (trimmed from `src/content/pages/index.md`):

```yaml
---
_schema: default
title: Home
description: One-line meta description.
pageSections:
  - _component: page-sections/heroes/hero-center
    eyebrow:
    heading: The headline for the page
    subtext: >-
      Supporting paragraph. Use a >- block scalar for multi-line text.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Explore Components
        link: /component-docs/
        variant: primary
        size: md
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/feature-grid
    eyebrow: Principles
    heading: Built for real-world web projects
    subtext: No trends. No noise. Just reliability.
    features:
      - title: Web fundamentals
        description: Semantic HTML. Lean CSS. JavaScript only when needed.
        iconName: cube
        iconColor: blue
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/conversion/cta-center
    heading: Ready to start building?
    subtext: Browse the complete component library.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Explore Components
        link: /component-docs/
        variant: primary
        size: md
    colorScheme: dark
    backgroundColor: surface
---
```

### Standard section props (every page section)

Every page section wraps `CustomSection` and accepts the same shell props on top of its content props: `sectionLabel`, `maxContentWidth`, `paddingHorizontal`, `paddingVertical`, `colorScheme`, `backgroundColor`, `background`. Their option values and behavior are documented once in [create-component's component-templates.md](../create-component/component-templates.md#standard-props-every-component) — do not guess them. The catalog lists only each section's **content** props.

In short: `colorScheme` sets the section's theme; `backgroundColor` paints its background from the active theme. Option values live in the create-component reference above; what the color tokens resolve to is owned by the [theming skill](../theming/SKILL.md).

## Pick a section for a content need

| Content need                          | Section (`_component`)                               |
| ------------------------------------- | ---------------------------------------------------- |
| Page intro / banner                   | `page-sections/heroes/hero-center` or `hero-split`   |
| Grid of features with icons           | `page-sections/explainers/feature-grid`              |
| One feature explained beside an image | `page-sections/explainers/feature-split`             |
| Swipeable feature highlights          | `page-sections/explainers/feature-slider`            |
| Closing call to action                | `page-sections/conversion/cta-center` or `cta-split` |
| Contact / lead-capture form           | `page-sections/conversion/cta-form`                  |
| Questions and answers                 | `page-sections/explainers/faq-section`               |
| Staff / people                        | `page-sections/collections/team-grid`                |
| A single customer quote               | `page-sections/proof/testimonial-section`            |
| Anything else — free composition      | `page-sections/builders/custom-section`              |

See [component-catalog.md](component-catalog.md) for each section's props and the full building-block list.

## Placeholder images

**MUST:** use `/src/assets/images/placeholder.jpg` for any image without real artwork yet.
**Why:** it is the one committed placeholder asset; a path that does not exist breaks the image import at build time. Image paths use the `/src/assets/images/...` form.

## YAML rules that bite

- Use `>-` block scalar for multi-line text (strips the trailing newline).
- Empty array: `buttonSections: []`. Empty string: `eyebrow: ''` or `eyebrow:`.
- Booleans are unquoted `true` / `false`.
- Every nested item under an array prop needs its own `_component`.

## Section not rendering

The dev-server console logs `Component not found: <_component>. Available components: [...]`. Almost always a `_component` path typo — compare yours against the printed list. Full debugging playbook: [debug-cloudcannon](../debug-cloudcannon/SKILL.md).

## Verify your work

| Command                       | What to look for                                                        |
| ----------------------------- | ----------------------------------------------------------------------- |
| `npm run check`               | Exit 0 — schema validates, no lint/type errors.                         |
| `npm run dev`                 | The page renders; no "Component not found" console warning.             |
| `npm run dev` + Visual Editor | Sections appear and field edits live-update in the CloudCannon preview. |
