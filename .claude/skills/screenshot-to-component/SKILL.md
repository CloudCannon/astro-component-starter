---
name: screenshot-to-component
description: Use when the user pastes a screenshot or design mockup of a page section and wants it turned into a new Astro + CloudCannon component. Covers reading the design, mapping it onto existing building blocks, and iterating against the dev server.
---

# Screenshot to component

Turn a screenshot of a page section into a new component under `src/components/page-sections/`. The job is a translation, not an invention: read the design, map each visual element onto an existing building block, and compose them with tokens. Only the layout glue is new.

## When to use

- The user pastes an image of a UI section (hero, feature grid, testimonial band, pricing, CTA) and wants a working component.
- You are recreating a section of an existing site from a screenshot during a migration.

## When not to use

- An existing page section already matches — reuse it instead. Check the catalog in the [page-content-authoring skill](../page-content-authoring/SKILL.md) first.
- The user wants a full page assembled from sections that already exist — that is page-content-authoring, not this skill.
- The screenshot is a single atomic element (one button, one icon) — that is a core element; see [create-component](../create-component/SKILL.md).

## What this skill owns vs. links out

| Topic                                               | Where it lives                                               |
| --------------------------------------------------- | ------------------------------------------------------------ |
| Reading a screenshot, prop-vs-hardcoded decisions   | **Here.**                                                    |
| `.astro` + YAML file conventions, structures, glob  | [create-component](../create-component/SKILL.md)             |
| What building blocks exist and their props          | [page-content-authoring](../page-content-authoring/SKILL.md) |
| `data-prop` / `data-children-prop` / image bindings | [editable-regions](../editable-regions/SKILL.md)             |
| Design tokens (spacing, color, radius, type scale)  | [theming](../theming/SKILL.md)                               |

**MUST NOT:** paste a building-block prop list, a token table, or a YAML template into this skill. Link to the owner. **Why:** those change; a pasted copy silently goes stale and misleads the next agent.

## Workflow

### 1. Read the screenshot into a structured spec

Before writing code, write down what you see. This drives the prop design.

- **Layout** — single centered column, split (image + text), grid of N items, stacked blocks, carousel, or a heading area above a repeating group.
- **Elements** — headings (how many levels), body text, images (hero / thumbnail / icon / background), icons, buttons (count, labels, primary vs secondary), lists, quotes, form fields, embeds.
- **Repeating group** — is there a set of items with identical structure? Count them and list each item's fields (title, description, image, icon, link). A repeating group means a child `{Name}Item.astro` + an array prop.
- **Visual treatment** — background (solid / image / gradient / accent), spacing density (tight / normal / spacious), light-on-dark vs dark-on-light, borders / rounding / shadows, text alignment.
- **Interaction** — accordion, tabs, modal, carousel, hover. Each maps to a CSS-first technique or an existing wrapper — see the CSS-first table in create-component's [component-templates.md](../create-component/component-templates.md#composition-and-css-first-rules). Compose the wrapper; do not reimplement its behavior.

### 2. Map elements onto existing building blocks

**MUST:** compose from existing building blocks; never hand-write markup a building block already renders. **Why:** the starter's styling, theming, and editable bindings live in the building blocks — bespoke HTML skips all of it and drifts from the design system.

Use this to translate what you see. For the authoritative prop list of each block, read the [page-content-authoring catalog](../page-content-authoring/SKILL.md).

| In the screenshot           | Building block to compose     |
| --------------------------- | ----------------------------- |
| Any heading                 | `Heading` (`@core-elements`)  |
| Rich / multi-line body text | `Text`                        |
| Short label / eyebrow       | `SimpleText`                  |
| Photo or illustration       | `Image`                       |
| Icon                        | `Icon`                        |
| Link styled as a button     | `Button`                      |
| Row of buttons              | `ButtonGroup` (`@wrappers`)   |
| Quote with attribution      | `Testimonial`                 |
| Bulleted / numbered list    | `List`                        |
| Grid of equal cards         | `Grid` + a `{Name}Item` child |
| Two-column image + text     | `Split`                       |
| Bordered content box        | `Card`                        |
| Expand / collapse rows      | `Accordion`                   |
| Sliding items               | `Carousel` / `ImageCarousel`  |
| Tabbed content              | `ContentSelector`             |
| Embedded video / map        | `Video` / `Embed`             |

The section itself always wraps in `CustomSection` (`@builders/custom-section/CustomSection.astro`) — it provides `maxContentWidth`, `paddingHorizontal`/`paddingVertical`, `colorScheme`, `backgroundColor`, `background`, and `label`. Page section wrappers forward `label` as `sectionLabel`.

### 3. Decide prop vs. hardcoded

Every editor-facing string, image, or repeating group is a **prop** with a CloudCannon input. Structural and stylistic choices are **hardcoded** in the `.astro`.

| Screenshot detail                          | Prop or hardcoded                           |
| ------------------------------------------ | ------------------------------------------- |
| Heading / body / label text                | Prop (`text` / `markdown` input)            |
| Images the editor will swap                | Prop (`image` input + alt prop)             |
| A repeating set of items                   | Prop (`array` input → child structure)      |
| Button label + link                        | Prop (inside a `buttonSections` array)      |
| Background color / color scheme            | Prop (`select`) so editors can retheme      |
| Section vertical padding                   | Prop (`select`) when density varies per use |
| Grid column count, gap, item min-width     | Hardcoded on the `Grid` in the `.astro`     |
| Alignment, layer order, decorative spacing | Hardcoded in the `<style>` block            |

**Common miss:** hardcoding text that an editor would obviously want to change. If it is words or a picture, it is almost always a prop.

### 4. Scaffold the component

Follow [create-component](../create-component/SKILL.md) for the directory layout, the `.astro` template, the co-located `<kebab>.cloudcannon.inputs.yml` + `<kebab>.cloudcannon.structure-value.yml`, the optional `<kebab>.cloudcannon.snippets.yml`, and structures registration (page sections are auto-collected by glob into `pageSections` — no manual registration). Category selection also lives there.

Reference implementation for a heading-over-grid section: read `src/components/page-sections/features/feature-grid/FeatureGrid.astro` and its sibling YAML. It is the canonical shape — a `CustomSection` wrapping `SimpleText` / `Heading` / `Text` and a `Grid` that maps an array prop to `FeatureItem` children. Mirror it rather than inventing a new structure.

Key rules that bite:

- **`_component` is the kebab-case directory path** under `src/components/` (e.g. `page-sections/features/service-cards`). It must match the directory exactly, or `renderBlock.astro` logs "Component not found" and the section vanishes.
- **Props are camelCase** and must match the `.astro` destructure exactly — the same name appears in the destructure, `inputs.yml`, and `structure-value.yml` defaults.
- **Styling rules** (layer choice, tokens-only, no `:global()`) are owned by [create-component's Styling rules](../create-component/SKILL.md#styling-rules); token names come from [theming](../theming/SKILL.md).

### 5. Wire editable bindings

Editors change content in the visual preview, so text, image, and array props need bindings. Follow [editable-regions](../editable-regions/SKILL.md) for the attribute reference. In short: `data-prop` on text blocks, `data-prop-src`/`data-prop-alt` on `Image`, `data-children-prop` on the array wrapper, and `data-editable="array-item"` + `data-id="{component-path}"` on each mapped child.

### 6. Fill defaults and produce a content entry

Extract the visible text from the screenshot into the `structure-value.yml` defaults and into a ready-to-paste `pageSections` entry. Match the shape in `src/content/pages/index.md`.

**MUST:** use `/src/assets/images/placeholder.jpg` for every image the editor will replace. **Why:** it is the one committed placeholder asset (`src/assets/images/placeholder.jpg`); referencing a screenshot-derived path that does not exist breaks the image import at build time.

```yaml
- _component: page-sections/features/service-cards
  heading: Exact heading text from the screenshot
  subtext: >-
    Exact body copy from the screenshot; block scalar for multi-line.
  imageSource: /src/assets/images/placeholder.jpg
  imageAlt: Descriptive alt text for what the image shows
  items:
    - title: First item title from the screenshot
      description: First item description from the screenshot
  colorScheme: inherit
  backgroundColor: base
```

Map the visual treatment onto `colorScheme` / `backgroundColor` / `paddingVertical` values rather than guessing: light background → `colorScheme: inherit`, `backgroundColor: base` (or `surface` for light gray); dark band → `colorScheme: dark`; accent band → `backgroundColor: accent` or `highlight`. Denser spacing → smaller `paddingVertical`; airier → larger.

### 7. Iterate against the dev server

Run `npm run dev`, place the section (or open the page that uses it), and compare side by side with the screenshot. Adjust spacing tokens, grid min-width, and alignment until it matches. Confirm it also renders in the CloudCannon Visual Editor and that fields live-update.

## Multi-section screenshots

When the image is a whole page or a long scroll:

1. **Segment** at background-color changes, large vertical gaps, or dividers — each becomes one section component.
2. **Name** with a shared prefix if they belong to one site (e.g. `dental-hero`, `dental-services`).
3. **Scaffold** each section via steps 1–6.
4. **Assemble** one `pageSections` array covering the page, in order.

## Verify your work

| Command                       | What to look for                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run check`               | Exit 0 — no lint/type errors, no skills drift.                                                     |
| `npm run previews:build`      | A new SVG appears in `public/component-previews/` for the new section, no build errors.            |
| `npm run dev` + Visual Editor | Section matches the screenshot; no "Component not found" console warning; field edits live-update. |
