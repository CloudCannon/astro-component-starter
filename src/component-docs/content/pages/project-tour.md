---
title: Project Tour
contentSections: []
---

# Project Tour

Welcome to the Astro Component Starter. Before you start building, let's walk through what's here and how it all fits together. This should take about five minutes.

## What is this?

This is a **starter template** you scaffold with `npx create-astro-component-starter my-site-name`. Once generated, every file is yours. Modify components, delete what you don't need, add your own. There's no package dependency to manage for your component source code. You own the code and decide when (or if) to pull in future improvements from the core repo.

What makes this starter different from a typical Astro project is that every component is **built for visual editing** in [CloudCannon](https://cloudcannon.com/). Developers build and customize components in code. Editors manage content visually: clicking, dragging, and typing directly on the page. Same components, two interfaces.

## Run it locally

The project requires Node.js 24+ (specified in `.nvmrc`).

To create a new project:

```bash
npx create-astro-component-starter my-site-name
cd my-site-name
npm run dev
```

The CLI downloads the latest starter, configures the starter repo as `upstream`, and runs `npm install` for you.

If you're already inside an existing starter project, from the project root run:

```bash
npm run dev
```

This starts the Astro dev server with hot reloading. Open [localhost:4321](http://localhost:4321) to view your site locally.

## Design principles

**Intentionally unbranded.** The starter ships with a neutral, gray-based design on purpose. It's meant to disappear into whatever brand you bring to it. Update a few CSS variables in the theme files and the entire site shifts to match your colors, fonts, and personality.

**Built on web fundamentals.** Components use vanilla CSS and semantic HTML. JavaScript is only added when something genuinely can't be done with CSS alone. Most components have zero JS. A few use a small amount for accessibility (managing ARIA attributes) or interactive behavior (like carousels). When JS is needed, it's vanilla JavaScript, not a framework.

**Fast and accessible by default.** Every component renders to static HTML with no client-side framework overhead. Pages are lightweight, load instantly, and score well on Core Web Vitals out of the box. Accessibility is built into every component with semantic elements, ARIA attributes, keyboard navigation, and proper focus management.

## The three-file pattern

This is the foundational concept. Every component ships with three files:

```
src/components/.../button/
├── Button.astro                           # The component itself
├── button.cloudcannon.inputs.yml          # How individual editor inputs are configured
└── button.cloudcannon.structure-value.yml  # How the component is configured in CloudCannon
```

**`Button.astro`** is a standard Astro component: props, HTML, styles, and optional scripts all live together in one file.

**`button.cloudcannon.inputs.yml`** defines the editing interface. It tells CloudCannon what inputs to show for each prop: text fields, dropdowns, switches, image pickers, and more:

```yaml
text:
  type: text
  comment: The text that goes inside the button.
variant:
  type: select
  comment: The presentation of button.
  options:
    values:
      - id: primary
        name: Primary
      - id: secondary
        name: Secondary
```

**`button.cloudcannon.structure-value.yml`** defines how the component appears in CloudCannon's component picker and what defaults it starts with:

```yaml
label: Button
icon: variables
description: Clickable button for calls-to-action and navigation.
value:
  _component: building-blocks/core-elements/button
  text: My Button
  variant: primary
  size: md
```

A component isn't "done" until it has all three files. The Astro file makes it render. The CloudCannon files make it editable.

## How components are organized

Components live in `src/components/` and are grouped by purpose:

- **Building Blocks** (`building-blocks/`): Foundational UI pieces (buttons, headings, text, images, form elements, layout wrappers like grids and splits). These are the atoms you compose into larger structures.

- **Page Sections** (`page-sections/`): Full-width sections that make up a page (heroes, feature showcases, CTAs, FAQ sections, team grids). Each one is built from building blocks internally, but presents editors with a simple, flat interface.

- **Navigation** (`navigation/`): Header, footer, mobile nav, sidebar nav.

The key relationship: **building blocks** are composed into **page sections**. A `FeatureSplit` page section, for example, internally uses `CustomSection`, `Split`, `Heading`, `Text`, and `Image` building blocks, but editors just see inputs for heading, text, and image.

### What is `customSection`?

[customSection](/component-docs/components/page-sections/builders/custom-section/) is the base-level wrapper used by page sections. It controls the structural layout options shared by sections:

- Content width
- Vertical and horizontal padding
- Background styling

Every Page Section starts with a `customSection` wrapper. This gives editors a consistent layout foundation while still allowing each section to contain its own nested component structure.

Editors can also add a `customSection` directly in CloudCannon using **Add Page Section**. This gives complete freedom to build a more complex nested structure from scratch in the Visual Editor.

## How pages work

Pages are defined as Markdown files in `src/content/pages/`. Each page has a `pageSections` array in its frontmatter that lists which components to render and with what props:

```yaml
---
title: My Page
pageSections:
  - _component: page-sections/heroes/hero-center
    heading: Welcome to my site
    subtext: Built with the Astro Component Starter.
  - _component: page-sections/features/feature-split
    heading: Fast and easy
    subtext: Zero-JS by default.
    imageSource: /src/assets/images/feature.svg
---
```

The `_component` field is a path that maps to a component in `src/components/`. Astro's `renderBlock.astro` utility dynamically resolves these paths at build time. No manual imports needed.

This is the same structure CloudCannon reads and writes when editors add, remove, or reorder sections visually.

## Key directories

Here's a quick map of where things live:

| Directory               | What's there                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `src/components/`       | All 40+ components (building blocks, page sections, navigation) |
| `src/content/pages/`    | Your site's pages as Markdown with `pageSections` arrays        |
| `src/content/blog/`     | Blog posts in MDX                                               |
| `src/styles/variables/` | Design tokens: colors, fonts, spacing, widths                   |
| `src/styles/themes/`    | Light and dark theme definitions                                |
| `src/styles/base/`      | CSS reset, typography defaults, form styles                     |
| `src/data/`             | Site-wide data: navigation links, SEO config, footer content    |
| `src/component-docs/`   | These docs; can be excluded from production builds              |

## Removing components you don't need

Every component is independent. To remove one, delete its entire folder (e.g. `src/components/page-sections/heroes/hero-split/`). The build will still work — `renderBlock` only resolves components that are referenced in your page frontmatter. Just make sure no page is using the deleted component's `_component` path, and that no other component imports it directly. Navigation components (`src/components/navigation/`) are referenced in layouts, so check those imports before deleting.

## Next up

Now that you know the lay of the land, let's make some changes. Head to [Editing a Page](/component-docs/editing-a-page/) to see how quickly you can modify content, both in code and visually.
