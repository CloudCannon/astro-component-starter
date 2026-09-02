---
title: Building a Page Section
contentSections: []
---

# Building a Page Section

Let's build a page section from scratch. We'll create the simplest possible component: a centered heading with supporting text. We'll make it visually editable.

Three files. That's all it takes.

> **Shortcut:** `npm run new:component page-sections/explainers/section-intro` scaffolds all three files with the correct names, keys, and wiring, then prints the remaining steps. This guide builds them by hand so you understand what each file does — but for your second component onward, use the scaffolder.

## File 1: The Astro component

Create `src/components/page-sections/explainers/section-intro/SectionIntro.astro`:

```astro
---
import CustomSection from '@builders/custom-section/CustomSection.astro';
import Heading from '@core-elements/heading/Heading.astro';
import Text from '@core-elements/text/Text.astro';

const { heading = '', subtext = '', _component, ...htmlAttributes } = Astro.props;
---

<CustomSection
  maxContentWidth="xl"
  paddingHorizontal="lg"
  paddingVertical="4xl"
  {...htmlAttributes}
>
  <Heading level="h1" size="2xl" alignmentHorizontal="center" data-prop="heading" text={heading} />
  <Text alignmentHorizontal="center" data-prop="subtext" text={subtext} />
</CustomSection>
```

That's it. `CustomSection` handles padding and width. `Heading` and `Text` are existing building blocks. The `data-prop` attributes tell CloudCannon which prop each element edits.

## File 2: The inputs config

Create `section-intro.cloudcannon.inputs.yml` in the same folder:

```yaml
heading:
  type: text
  comment: The main headline.
subtext:
  type: text
  comment: Supporting text beneath the headline.
```

Each key matches a prop from the component. The `type` controls what kind of input editors see: `text` gives a single-line field. (Other types include `markdown`, `select`, `switch`, `url`, and `image`.)

## File 3: The structure-value config

Create `section-intro.cloudcannon.structure-value.yml` in the same folder:

```yaml
label: Section Intro
icon: info
description: Centered section with a headline and supporting text.
value:
  _component: page-sections/explainers/section-intro
  heading: Your heading here
  subtext: Add some supporting text.
preview:
  text:
    - Section Intro
  subtext:
    - key: heading
  icon: info
picker_preview:
  text: Section Intro
  subtext: Centered section with a headline and supporting text.
_inputs_from_glob:
  - /src/components/page-sections/explainers/section-intro/section-intro.cloudcannon.inputs.yml
```

The `value` block defines the defaults when an editor adds this component. The `_component` path must match where the component lives. The `_inputs_from_glob` points to your inputs file.

## Use it

That's three files:

```
src/components/page-sections/explainers/section-intro/
├── SectionIntro.astro
├── section-intro.cloudcannon.inputs.yml
└── section-intro.cloudcannon.structure-value.yml
```

Open `src/content/pages/index.md` and add the component under the `pageSections` array:

```yaml
pageSections:
  - _component: page-sections/explainers/section-intro
    heading: Ready to get started?
    subtext: Everything you need is right here.
```

Or add it in CloudCannon by clicking "Add Page Section" and picking "Section Intro" from the list.

## You already have documentation

As soon as those three files exist, this docs site generates a page for your component — check the sidebar under Explainers and you'll find Section Intro with its title, description, a full props table (types, defaults, and the `comment` text from your inputs file), and a live example rendered from your `value:` defaults. The gallery and sidebar pick it up too. Nothing to write, nothing to keep in sync: improve a `comment` or a default in the YAML and the docs update with it.

Two optional extras when you want more:

- **A preview thumbnail** for the gallery and CloudCannon picker: add a `section-intro.preview.mjs` recipe next to the component and run `npm run previews:build` (see any existing component for an example recipe).
- **Richer docs**: add `src/component-docs/content/components/page-sections/explainers/section-intro/index.md` with an `overview:` and hand-picked examples in an `examples/` folder. This is enrichment, not a requirement — the page exists either way.

`npm run check` validates all of it — prop names in the YAML against the component, example files against real props — so drift shows up in CI, not in production.

## Build it with Component Builder

Prefer building visually over hand-writing files? Use the [Component Builder](/component-docs/component-builder/) to scaffold this faster:

1. Open the Component Builder. Under the Custom Section, press the "Add to Content Sections" button. Select Heading, then repeat and select Text.
2. Both Heading and Text expose a prop called `text`, which causes a validation error at the same level. To fix this, click the Heading component to open the props sidebar and change the Exposed Name from `text` to `heading`. Do the same for Text, changing it to `subtext`. You can also expose other props if you want editors to be able to configure them.
3. Select Export Component in the top bar. Choose "Explainers" for the category and enter `section-intro` for the component name. Select "Download Zip".
4. Unzip and move the exported files into `src/components/page-sections/explainers/section-intro/`.

After that, add the section in CloudCannon from "Add Page Section" just like any hand-built component.

This is a good way to scaffold a new component. From there, you can add your own HTML, styles, and scripts to customize it further.

## Choosing how much control editors get

The SectionIntro above is a **structured component** — it has a fixed layout with specific props. That's one end of a spectrum. At the other end is giving editors complete freedom to build their own layouts. Most real projects use a mix of both, and there's a useful middle ground too.

### Structured components: developer controls the layout

This is the pattern you just built. The developer decides the layout, picks the building blocks, and chooses which props to expose. Editors fill in the content but can't change the structure.

CTA Center is a good example:

```astro
<CustomSection maxContentWidth="lg" paddingVertical={paddingVertical} {...htmlAttributes}>
  <Heading level="h2" size="xl" alignmentHorizontal="center" data-prop="heading" text={heading} />
  <Text alignmentHorizontal="center" data-prop="subtext" text={subtext} />
  <ButtonGroup
    buttonSections={buttonSections}
    alignmentHorizontal="center"
    data-children-prop="buttonSections"
  />
</CustomSection>
```

The heading is always centered, always `h2`, always above the subtext. Editors can change the text and add buttons, but the layout is locked. This is the right choice when you want consistency — a CTA should always look like a CTA.

### Custom Section: editor builds everything

At the other end of the spectrum is `CustomSection` used directly as a page section. Instead of a fixed layout, it exposes a `contentSections` array where editors can add any building block they want — text, images, grids, accordions, carousels, forms, and more.

```yaml
- _component: page-sections/builders/custom-section
  label: My custom layout
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Build it your way
      level: h2
      size: lg
    - _component: building-blocks/wrappers/split
      # ... two-column layout with whatever they put inside
  maxContentWidth: 2xl
  paddingVertical: md
  colorScheme: inherit
  backgroundColor: base
```

There's no predefined structure. Editors have full access to all available building blocks and combine them freely. This is powerful for one-off layouts, landing pages, or teams with design-savvy editors who want maximum flexibility.

The trade-off is less consistency. Every instance of a Custom Section can look completely different, and editors need to understand the building blocks well enough to combine them effectively.

### The middle ground: structure with flexible content areas

Many components land between these extremes. They have a fixed outer structure — a heading, some wrapper layout — but contain an array where editors can add components.

FAQ Section is a good example. The developer defines the overall section with a heading and an accordion wrapper. Each accordion item has a title (structured) and a `contentSections` array (flexible):

```yaml
- _component: page-sections/explainers/faq-section
  heading: Frequently asked questions
  items:
    - title: How does this work?
      contentSections:
        - _component: building-blocks/core-elements/text
          text: Editors can add any content they want inside each FAQ item.
```

The section always looks like an FAQ — heading on top, accordion below, consistent spacing. But inside each accordion item, editors can add whatever blocks they need. They're not limited to plain text; they could drop in images, code blocks, or nested grids if the content calls for it.

### Which approach to use

There's no single right answer. Most projects use all three:

- **Structured components** for sections that should always look consistent — CTAs, heroes, pricing tables, testimonials. The developer makes the design decisions once and editors stay within those guardrails.
- **Custom Section** for pages where editors need full creative control, or as a quick way to prototype layouts before committing to a structured component.
- **Hybrid components** for sections that need a recognizable structure but flexible content within it — FAQs, tabbed content, forms.

## Going further

You can push this much further, allowing editors to control any prop or setting you'd like. The existing page sections show how:

- **[CTA Center](/component-docs/components/page-sections/conversion/cta-center/)** adds buttons, color schemes, and background options
- **[FAQ Section](/component-docs/components/page-sections/explainers/faq-section/)** uses accordion items with expand/collapse behavior

Each follows the same three-file pattern, just with more props and building blocks combined.

If you add your own _building block_ (rather than a page section), make it join the flow spacing system — that's how blocks space themselves against their siblings without hand-managed margins. Mark the root `stackable`, emit `data-space-before` on a direct child of the root (never on the root itself — the visual editor's re-render keeps root attributes, so the control would go stale), and pull in the shared `space-before.yml` input. `npm run new:component` scaffolds all of this; skip it and your block gets no space in flowing content and no **Space above** field in the editor.

## Next up

Your component is already visually editable — editors can click on the heading and subtext to edit them inline. Head to [How Visual Editing Works](/component-docs/visually-edit-components/) to understand the mechanism and learn how to handle images and arrays too.
