---
title: Building a Page Section
contentSections: []
---

# Building a Page Section

Let's build a page section from scratch: a centred heading with supporting text that editors can change in CloudCannon's visual editor. Then we'll style it, look at how the visual editing works, and decide how much control to give editors.

> **Shortcut:** `npm run new:component page-sections/explainers/section-intro` creates the component and its two CloudCannon files with the right names, paths and section settings, then lists what's left to do. This guide builds the files by hand so you see what each one does. From your second component on, use the shortcut.

## The four files

A component is a folder of four files. Ours lives in `src/components/page-sections/explainers/section-intro/`.

### 1. The Astro component

`SectionIntro.astro`:

```astro
---
import CustomSection from '@builders/custom-section/CustomSection.astro';
import Heading from '@core-elements/heading/Heading.astro';
import Text from '@core-elements/text/Text.astro';

const { heading = '', subtext = '', class: className, _component, ...htmlAttributes } = Astro.props;
---

<CustomSection
  class:list={['section-intro', className]}
  maxContentWidth="xl"
  paddingHorizontal="lg"
  paddingVertical="4xl"
  {...htmlAttributes}
>
  <Heading level="h2" size="2xl" alignmentHorizontal="center" data-prop="heading" text={heading} />
  <Text alignmentHorizontal="center" data-prop="subtext" text={subtext} />
</CustomSection>
```

`CustomSection` handles width, padding and background. `Heading` and `Text` are existing building blocks. The `data-prop` attributes tell CloudCannon which prop each element edits.

### 2. The inputs

`section-intro.cloudcannon.inputs.yml` sets the field editors see for each prop:

```yaml
heading:
  type: text
  comment: The main headline.
subtext:
  type: text
  comment: Supporting text beneath the headline.
```

Each key matches a prop in the component. `text` is a single-line field; other types include `markdown`, `select`, `switch`, `url` and `image`. The `comment` shows under the field in the editor and in these docs.

### 3. The structure value

`section-intro.cloudcannon.structure-value.yml` sets how the component appears in the **Add Page Section** menu and the content it starts with:

```yaml
label: Section Intro
icon: info
description: Centred section with a headline and supporting text.
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
  subtext: Centred section with a headline and supporting text.
_inputs_from_glob:
  - /src/components/page-sections/explainers/section-intro/section-intro.cloudcannon.inputs.yml
groups:
  - heading: Content
    inputs:
      - heading
      - subtext
```

`value` holds the defaults when an editor adds the section, and its `_component` must match the folder path. `_inputs_from_glob` points at the inputs file. `groups` sorts the fields in the sidebar; once a section has groups, every prop in `value` must be in one. `icon` is a [Material Symbols](https://fonts.google.com/icons) name in snake_case.

### 4. The preview thumbnail

`section-intro.preview.mjs` draws the thumbnail editors see in the Add menu and the component gallery. Recipes are meant to be written by an AI agent rather than by hand: ask your agent to use the create-component skill, which has it read your component and the preview kit's rules and draw a matching thumbnail. A recipe looks like this:

```js
import { preview, band, bar } from '../../../../../scripts/previews/kit.mjs';

const B = band(560);

export default preview({
  width: B.w,
  draw: [bar(410, 330, 460, 'heading'), bar(B.left, 378, 560, 'body')],
});
```

`npm run previews:build` turns it into an SVG and wires it into the structure value. `npm run check` fails until the recipe and its SVG exist. To tweak one yourself, the header of `scripts/previews/kit.mjs` explains the shapes and sizes.

## Use it

Add the section to a page's `pageSections` array:

```yaml
pageSections:
  - _component: page-sections/explainers/section-intro
    heading: Ready to get started?
    subtext: Everything you need is right here.
```

Or, in CloudCannon, click **Add Page Section** and pick **Section Intro**.

Its documentation already exists too. Check the sidebar under Explainers: Section Intro has a page with its description, a props table built from your inputs file, and a live example from your `value` defaults. To add an overview and hand-picked examples, create `src/component-docs/content/components/page-sections/explainers/section-intro/index.md`.

Run `npm run check` before you call it done. It compares the YAML with the component's props, checks the preview, and validates the CloudCannon files against CloudCannon's own schemas.

## Styling a component

Put a component's CSS in a global style block, wrapped in its cascade layer:

```astro
<style is:global>
  @layer page-sections {
    .section-intro {
      text-wrap: balance;
    }
  }
</style>
```

Use `@layer page-sections` in a page section and `@layer components` in a building block. Don't use Astro's scoped `<style>`: scoped CSS sits outside every layer, so it would beat the layered rules it's meant to fit in with.

The site declares seven layers. A later layer wins over an earlier one whatever the selector specificity:

1. `reset`: a minimal CSS reset
2. `base`: typography and element defaults
3. `pagefind`: search styles
4. `components`: building blocks
5. `page-sections`: page sections
6. `utils`: utilities, including the spacing between blocks
7. `overrides`: empty, for site-specific fixes that must win

Use tokens for every colour, size, radius and shadow (`var(--color-text-muted)`, `var(--spacing-md)`). `npm run lint:css-vars` fails on a token name that doesn't exist, and `npm run lint:css-literals` on a raw value where a token already fits. For a number only this component uses, name it as a custom property on the component's root (`--section-intro-gap: 3rem`) rather than reaching for a token.

## How visual editing works

The visual editor needs to know which data produced each element on the page. Editable regions supply that: `data-*` attributes that say "this element is this prop". See [CloudCannon's editable regions documentation](https://cloudcannon.com/documentation/developer-articles/what-are-editable-regions/) for the full picture. In this starter, the building blocks write those attributes for you; you tell them which prop to use.

**Text.** Pass `data-prop` to `Heading` or `Text`:

```astro
<Heading level="h2" data-prop="heading" text={heading} />
```

On its own, a `Heading` inside your section isn't editable. `data-prop="heading"` makes it editable and binds it to your section's `heading` prop. Blocks that editors add directly to a page or to a content area bind to their own `text` prop automatically.

**Images.** Bind the source and the alt text:

```astro
<Image source={imageSource} alt={imageAlt} data-prop-src="imageSource" data-prop-alt="imageAlt" />
```

Clicking the image opens CloudCannon's picker and writes the chosen file to `imageSource`.

**Arrays.** Wrappers like `ButtonGroup`, `Grid` and `Accordion` take `data-children-prop`, which lets editors add, remove and reorder items on the page:

```astro
<ButtonGroup buttonSections={buttonSections} data-children-prop="buttonSections" />
```

[CTA Center](/component-docs/components/page-sections/conversion/cta-center/) uses all of these:

```astro
<CustomSection
  maxContentWidth={maxContentWidth}
  paddingVertical={paddingVertical}
  {...htmlAttributes}
>
  <Heading
    level={headingLevel}
    size="xl"
    alignmentHorizontal="center"
    data-prop="heading"
    text={heading}
  />
  <Text alignmentHorizontal="center" data-prop="subtext" text={subtext} />
  <ButtonGroup
    buttonSections={buttonSections}
    alignmentHorizontal="center"
    data-children-prop="buttonSections"
  />
</CustomSection>
```

Three things to know before your component gets more involved:

- **Keep prop-driven attributes off the root element.** When a prop changes, the editor keeps the component's outer element and replaces only what's inside it, so a class or `data-*` attribute on the root that depends on a prop goes stale. Put it on a direct child and style the root with `:has()`. `npm run lint:roots` catches this.
- **Scripts need a setup module.** Inline `<script>`s don't run in the editor. Put the setup code in a `setup.ts` next to the component and register it in `editor-live-sync.js`, as the carousel does. `npm run lint:cms` fails on a script that isn't registered.
- **Test it in the editor.** `npm run editor` serves CloudCannon's real Visual Editor on your machine against the last build.

## How much control editors get

Section Intro is a **structured** component. You decide the layout and editors fill in the content. That's one end of a range.

**Structured components** suit sections that should always look the same, such as CTAs, heroes, pricing and testimonials. CTA Center always has a centred heading above its text and buttons. Editors can change the words, the buttons and the heading level, but not the layout.

**[Custom Section](/component-docs/components/page-sections/builders/custom-section/)** is the other end. Added directly as a page section, it has a `contentSections` array where editors place any building block they like:

```yaml
- _component: page-sections/builders/custom-section
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Build it your way
      level: h2
    - _component: building-blocks/wrappers/split
      # ...a two-column layout with whatever goes inside
  maxContentWidth: 2xl
```

It's the right tool for one-off layouts and for trying a design before you turn it into a structured component. The cost is consistency: every Custom Section can look different.

**In between**, a section has a fixed frame with a flexible area inside. [FAQ Section](/component-docs/components/page-sections/explainers/faq-section/) always has a heading above an accordion, and each answer is a `contentSections` array:

```yaml
- _component: page-sections/explainers/faq-section
  heading: Frequently asked questions
  items:
    - title: How does this work?
      contentSections:
        - _component: building-blocks/core-elements/text
          text: Editors add content blocks inside each answer.
```

An answer takes content blocks such as text, images, lists and code blocks, but not layouts like grids or splits. The project decides which blocks fit where; see the nesting rules in the create-component skill (`.agents/skills/create-component/cloudcannon-yaml.md`).

Most sites use all three.

## Making a building block

A building block (rather than a page section) has one more job: joining the automatic spacing between blocks. `npm run new:component building-blocks/core-elements/my-block` sets that up for you. It marks the root `stackable`, adds a **Space Before** field, and puts the `data-space-before` attribute on a direct child of the root. Without it, your block gets no space above it.

## Next up

Head to [Editing the Blog](/component-docs/editing-the-blog/) to see how posts work and how to put components inside them.
