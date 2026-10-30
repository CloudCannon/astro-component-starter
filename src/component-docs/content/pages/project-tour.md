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

You need Node.js 24 or later. The `.nvmrc` pins `24.18.0`, the version CI uses, so `nvm use` picks it up.

To create a new project:

```bash
npx create-astro-component-starter my-site-name
cd my-site-name
npm run dev
```

The CLI clones the latest starter, keeps the starter repo as a git remote named `upstream`, and runs `npm install` for you.

`npm run dev` starts the Astro dev server with hot reloading. Open [localhost:4321](http://localhost:4321) to view your site.

Before you call any change finished, run the gate:

```bash
npm run check
```

It runs every lint, type check and consistency check in the project, including the ones that catch editor problems a normal build won't show. `npm run check:quick` runs the three fastest, most useful ones while you work.

## Design principles

**Intentionally unbranded.** The starter ships with a neutral, gray-based design on purpose. It's meant to disappear into whatever brand you bring to it. Update a few CSS variables in the theme files and the entire site shifts to match your colors, fonts, and personality.

**Built on web fundamentals.** Components use vanilla CSS and semantic HTML. JavaScript is only added when something genuinely can't be done with CSS alone. Most components have zero JS. A few use a small amount for accessibility (managing ARIA attributes) or interactive behavior (like carousels). When JS is needed, it's vanilla JavaScript, not a framework.

**Fast and accessible by default.** Every component renders to static HTML with no client-side framework overhead. Pages are lightweight, load instantly, and score well on Core Web Vitals out of the box. Accessibility is built into every component with semantic elements, ARIA attributes, keyboard navigation, and proper focus management.

## What a component is made of

This is the foundational concept. Every component is a folder holding the component, two CloudCannon files, and a preview recipe:

```
src/components/.../button/
├── Button.astro                            # The component itself
├── button.cloudcannon.inputs.yml           # How each editor input is configured
├── button.cloudcannon.structure-value.yml  # How the component appears and starts in CloudCannon
└── button.preview.mjs                      # Draws its thumbnail for the Add menu
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

**`button.preview.mjs`** is a small recipe that `npm run previews:build` turns into the thumbnail editors see in the Add menu (`public/component-previews/`). Recipes are meant to be written by an AI agent: you describe the component, the agent draws it.

A component isn't "done" until all four are in place. The Astro file makes it render, the CloudCannon files make it editable, and the preview makes it recognisable. `npm run check` fails if any of them is missing or out of step with the others.

The same files power these docs: every component's documentation page (title, description, props table, live example) is generated from them at build time. Add a component and it appears in the sidebar, gallery, and docs automatically — there's no separate documentation to write or keep in sync.

## How components are organized

Components live in `src/components/` and are grouped by purpose:

- **Building Blocks** (`building-blocks/`): Foundational UI pieces (buttons, headings, text, images, form elements, layout wrappers like grids and splits). These are the atoms you combine into larger structures.

- **Page Sections** (`page-sections/`): Full-width sections that make up a page, grouped by the job they do: heroes, explainers, proof, conversion, collections, and builders. Each one is built from building blocks internally, but presents editors with a simple, flat interface.

- **Navigation** (`navigation/`): Header, footer, mobile nav, sidebar nav, and site-wide consent controls.

The key relationship: **building blocks** combine into **page sections**. A `FeatureSplit` page section, for example, internally uses `CustomSection`, `Split`, `Heading`, `Text`, and `Image` building blocks, but editors just see inputs for heading, text, and image.

### What is `customSection`?

[customSection](/component-docs/components/page-sections/builders/custom-section/) is the base-level wrapper used by page sections. It controls the structural layout options shared by sections:

- Content width
- Vertical and horizontal padding
- Background styling and color scheme

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
  - _component: page-sections/explainers/feature-split
    heading: Fast and easy
    subtext: Zero-JS by default.
    imageSource: /src/assets/images/placeholder.jpg
---
```

The `_component` field is a path that maps to a component in `src/components/`. Astro's `renderBlock.astro` utility dynamically resolves these paths at build time. No manual imports needed.

This is the same structure CloudCannon reads and writes when editors add, remove, or reorder sections visually.

## Key directories

Here's a quick map of where things live:

| Directory               | What's there                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `src/components/`       | All 85 components (26 page sections, 51 building blocks, 8 navigation)                  |
| `src/content/pages/`    | Your site's pages as Markdown with `pageSections` arrays                                |
| `src/content/blog/`     | Blog posts in MDX                                                                       |
| `src/styles/variables/` | Design tokens: colors, fonts, spacing, widths                                           |
| `src/styles/themes/`    | Light and dark theme definitions                                                        |
| `src/styles/base/`      | CSS reset, typography defaults, form styles                                             |
| `src/data/`             | Site-wide data: navigation, footer, SEO, privacy, and analytics                         |
| `.cloudcannon/`         | Shared editor config: structures, input groups, datasets, schemas                       |
| `.agents/`              | Instructions and playbooks for AI coding agents                                         |
| `src/component-docs/`   | These docs. `npm run build` leaves them out; `npm run build:with-library` includes them |

## Working with an AI agent

The starter is written to be worked on by AI coding agents as well as people. `AGENTS.md` and `CLAUDE.md` describe the project and its rules, and `.agents/skills/` holds step-by-step playbooks for common jobs: creating a component, turning a screenshot into one, migrating an existing site, retheming, and debugging the visual editor. Ask your agent to use the matching skill, and to run `npm run check` before it calls the work done.

## Removing components you don't need

Every component is independent. To remove one, first search `src/content/` for its `_component` path (for example `page-sections/proof/logo-cloud`) and remove or replace every use. Then delete:

- its folder in `src/components/`
- its thumbnail in `public/component-previews/`
- its docs folder in `src/component-docs/content/components/`, if it has one

Navigation components are referenced in layouts, so check those imports before deleting. `npm run check` then tells you about anything left behind.

## Pulling in updates

The project keeps the starter as a git remote named `upstream`. To bring in improvements later, read the new entries in the starter's `CHANGELOG.md` first (especially anything marked **Heads-up**), then:

```bash
git fetch upstream
git merge upstream/main
```

## Next up

Now that you know the lay of the land, let's make some changes. Head to [Editing a Page](/component-docs/editing-a-page/) to see how quickly you can modify content, both in code and visually.
