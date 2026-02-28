---
title: Building a Page Section
contentSections: []
---

# Building a Page Section

Let's build a page section from scratch. We'll create the simplest possible component: a centered heading with supporting text. We'll make it visually editable.

Three files. That's all it takes.

## File 1: The Astro component

Create `src/components/page-sections/ctas/info-block/InfoBlock.astro`:

```astro
---
import CustomSection from '@builders/custom-section/CustomSection.astro';
import Heading from '@core-elements/heading/Heading.astro';
import Text from '@core-elements/text/Text.astro';

const { heading = '', subtext = '', _component, ...rest } = Astro.props;
---

<CustomSection maxContentWidth="md" paddingVertical="4xl" {...rest}>
  <Heading level="h2" size="lg" alignX="center" data-prop="heading" text={heading} />
  <Text alignX="center" data-prop="subtext" text={subtext} />
</CustomSection>
```

That's it. `CustomSection` handles padding and width. `Heading` and `Text` are existing building blocks. The `data-prop` attributes tell CloudCannon which prop each element edits.

## File 2: The inputs config

Create `info-block.cloudcannon.inputs.yml` in the same folder:

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

Create `info-block.cloudcannon.structure-value.yml` in the same folder:

```yaml
label: Info Block
icon: info
description: Centered section with a headline and supporting text.
value:
  _component: page-sections/ctas/info-block
  heading: Your heading here
  subtext: Add some supporting text.
preview:
  text:
    - Info Block
  subtext:
    - key: heading
  icon: info
picker_preview:
  text: Info Block
  subtext: Centered section with a headline and supporting text.
_inputs_from_glob:
  - /src/components/page-sections/ctas/info-block/info-block.cloudcannon.inputs.yml
```

The `value` block defines the defaults when an editor adds this component. The `_component` path must match where the component lives. The `_inputs_from_glob` points to your inputs file.

## Use it

That's three files:

```
src/components/page-sections/ctas/info-block/
├── InfoBlock.astro
├── info-block.cloudcannon.inputs.yml
└── info-block.cloudcannon.structure-value.yml
```

Add it to a page in code:

```yaml
pageSections:
  - _component: page-sections/ctas/info-block
    heading: Ready to get started?
    subtext: Everything you need is right here.
```

Or add it in CloudCannon by clicking "Add Page Section" and picking "Info Block" from the list.

## Going further

This was intentionally minimal. When you're ready to add more, look at the existing page sections for patterns:

- **[CTA Center](/component-library/components/page-sections/ctas/cta-center/)** adds buttons, color schemes, and background options
- **[Feature Split](/component-library/components/page-sections/features/feature-split/)** shows a two-column layout with images and conditional rendering

Each one follows the same three-file pattern, just with more props and building blocks composed together.

## Next up

Building components by hand gives you full control. For a faster way to prototype, head to [Using the Component Builder](/component-library/component-builder/) to drag-and-drop building blocks and export complete component packages.
