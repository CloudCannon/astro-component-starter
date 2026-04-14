---
name: create-component
description: Scaffold new components for the Astro + CloudCannon component library. Use when creating a new component, building block, wrapper, or page section, or when the user asks to add a UI element to the component library.
---

# Creating Components

## Component tiers

Components live in `src/components/` and are organized into three tiers:

| Tier         | Path                                    | Purpose                                                                   |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------- |
| Core element | `building-blocks/core-elements/{slug}/` | Atomic UI elements (button, heading, image, text)                         |
| Wrapper      | `building-blocks/wrappers/{slug}/`      | Containers that hold other components (accordion, card, grid)             |
| Page section | `page-sections/{category}/{slug}/`      | Full-width sections composing building blocks (hero-center, feature-grid) |

Page section categories: `builders`, `ctas`, `features`, `heroes`, `info-blocks`, `people`.

## Naming conventions

| Item              | Convention                      | Example                                      |
| ----------------- | ------------------------------- | -------------------------------------------- |
| Directory         | kebab-case                      | `hero-center`                                |
| Main component    | PascalCase matching directory   | `HeroCenter.astro`                           |
| Child component   | `{Parent}{Role}.astro`          | `AccordionItem.astro`, `CarouselSlide.astro` |
| CloudCannon files | `{slug}.cloudcannon.{type}.yml` | `hero-center.cloudcannon.inputs.yml`         |

## Required files

Every component needs:

```
{slug}/
├── {Name}.astro
├── {slug}.cloudcannon.inputs.yml
└── {slug}.cloudcannon.structure-value.yml
```

Optional additions:

- `{Name}Item.astro` — child component for wrappers/page sections with repeating items
- `{slug}.cloudcannon.snippets.yml` — for page sections usable in MDX content

## Import aliases

Use these path aliases defined in `tsconfig.json`:

```
@components/*        → src/components/*
@core-elements/*     → src/components/building-blocks/core-elements/*
@wrappers/*          → src/components/building-blocks/wrappers/*
@forms/*             → src/components/building-blocks/forms/*
@builders/*          → src/components/page-sections/builders/*
@features/*          → src/components/page-sections/features/*
@page-sections/*     → src/components/page-sections/*
@navigation/*        → src/components/navigation/*
@component-utils/*   → src/components/utils/*
```

## Workflow

### Step 1: Determine the tier

- **Core element** if it's an atomic, standalone UI piece (text, icon, media, form control)
- **Wrapper** if it contains/wraps other components (card, grid, accordion)
- **Page section** if it's a full-width section composed of building blocks (hero, CTA, feature showcase)

### Step 2: Create the directory

```
src/components/{tier-path}/{slug}/
```

### Step 3: Create the Astro component

### Step 4: Create the CloudCannon YAML files

### Step 5: Add a snippets file if it's a page section

### Step 6: Register in CloudCannon structures

### Step 7: Create component documentation examples

---

## Astro component template

### Core element / wrapper pattern

```astro
---
import Icon from '@core-elements/icon/Icon.astro';

const {
  text,
  variant = 'default',
  class: className,
  useDefaultEditableBinding = false,
  'data-prop': customDataProp,
  _component,
  ...htmlAttributes
} = Astro.props;

const effectiveDataProp = customDataProp ?? (useDefaultEditableBinding ? 'text' : null);
const textDataAttributes = effectiveDataProp
  ? { 'data-editable': 'text', 'data-prop': effectiveDataProp }
  : {};

const hasText = text?.trim().length > 0;
const hasSlotContent = Astro.slots.has('default');

if (!_component && !hasText && !hasSlotContent) return;
---

<div class:list={['my-component', className]} {...htmlAttributes}>
  <div class:list={['my-component-inner', `variant-${variant}`]}>
    <span class="my-component-text" {...textDataAttributes}>
      <slot>{text}</slot>
    </span>
  </div>
</div>

<style is:global>
  @layer components {
    .my-component {
      margin-top: var(--spacing-lg);

      > .my-component-inner {
        font-size: var(--font-size-md);
        color: var(--color-text);
      }
    }
  }
</style>
```

### Page section pattern

Page sections wrap their content in `CustomSection` and compose building blocks:

```astro
---
import CustomSection from '@builders/custom-section/CustomSection.astro';
import Heading from '@core-elements/heading/Heading.astro';
import Text from '@core-elements/text/Text.astro';
import ButtonGroup from '@wrappers/button-group/ButtonGroup.astro';

const {
  heading = '',
  subtext = '',
  buttonSections = [],
  colorScheme = 'inherit',
  backgroundColor,
  paddingVertical = '4xl',
  class: className,
  useDefaultEditableBinding = false,
  _component,
  ...htmlAttributes
} = Astro.props;
---

<CustomSection
  class:list={['my-section', className]}
  maxContentWidth="2xl"
  paddingHorizontal="lg"
  paddingVertical={paddingVertical}
  colorScheme={colorScheme}
  backgroundColor={backgroundColor}
  useDefaultEditableBinding={useDefaultEditableBinding}
  {...htmlAttributes}
>
  <Heading level="h2" size="lg" alignmentHorizontal="center" data-prop="heading" text={heading} />
  <Text alignmentHorizontal="center" data-prop="subtext" text={subtext} />
  <ButtonGroup
    class="buttonSections"
    buttonSections={buttonSections}
    alignmentHorizontal="center"
    data-children-prop="buttonSections"
  />
</CustomSection>

<style is:global>
  @layer page-sections {
  }
</style>
```

### Wrapper with child items pattern

Parent iterates over an `items` array and renders child components:

```astro
---
import ChildItem from './ChildItem.astro';

type ItemProps = Record<string, unknown>;

const {
  items,
  class: className,
  useDefaultEditableBinding = false,
  'data-children-prop': childrenDataProp,
  _component,
  ...htmlAttributes
} = Astro.props;

const effectiveChildrenProp = childrenDataProp ?? (useDefaultEditableBinding ? 'items' : null);
const arrayDataAttributes = effectiveChildrenProp
  ? { 'data-editable': 'array', 'data-prop': effectiveChildrenProp }
  : {};

const hasItems = items?.length > 0;
const hasSlotContent = Astro.slots.has('default');

if (!_component && !hasItems && !hasSlotContent) return;
---

<div class:list={['my-wrapper', className]} {...htmlAttributes}>
  <div {...arrayDataAttributes}>
    <slot>
      {
        items?.map((item: ItemProps) => (
          <ChildItem
            useDefaultEditableBinding={!!effectiveChildrenProp}
            data-editable="array-item"
            data-id="{tier-path}/{slug}/child-item"
            {...item}
          />
        ))
      }
    </slot>
  </div>
</div>
```

## Key Astro conventions

- **Compose existing components**: Prefer using existing building blocks (Button, Heading, Text, Icon, Image, Card, Grid, ButtonGroup, etc.) over writing custom HTML with manual styling. This keeps behavior and styling consistent across the library.
- **CSS-first**: Core interactions must work without JavaScript. Use native HTML and CSS mechanisms first, then layer JS as progressive enhancement only for things that are not possible with CSS alone. The table below maps common interactions to the correct technique:

| Interaction              | Technique                                                              | Example in codebase                    |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------- |
| Modal / popup / dropdown | Popover API (`popover="auto"`, `popovertarget`)                        | `Modal.astro`                          |
| Expand / collapse        | `<details>` / `<summary>` with optional `name` for single-open         | `AccordionItem.astro`                  |
| Tabs / content switcher  | Hidden radio inputs + `:checked` sibling selectors + `:has()` fallback | `ContentSelector.astro`                |
| Enter/exit animations    | `@starting-style` + `allow-discrete` transitions                       | `Modal.astro` popover transitions      |
| Conditional visibility   | `:has()` selector or checkbox/radio toggle                             | `ContentSelector.astro`, `Image.astro` |
| Hover / focus effects    | `:hover`, `:focus-visible`, `:focus-within` pseudo-classes             | Card hover states                      |
| Scroll-driven layouts    | `scroll-snap-type` / `scroll-snap-align`                               | —                                      |
| Responsive layout shifts | Container queries (`container-type: inline-size`, `@container`)        | `FeatureSplit.astro`                   |

- **Client-side JavaScript**: When CSS alone can't handle the interaction and you need JS, use a `<script>` tag with the `onPageLoad` utility. This ensures the init function runs on first load and on Astro page navigations, while preventing duplicate runs for the same URL:

```astro
<script>
  import { onPageLoad } from '@component-utils/onPageLoad';

  onPageLoad(() => {
    const elements = document.querySelectorAll('.my-component');
    if (!elements.length) return;

    elements.forEach((el) => {
      // Progressive enhancement logic here
    });
  });
</script>
```

Always query for elements inside the callback, guard with an early return if none are found, and keep the script minimal — it should enhance, not replace, the CSS-first behavior.

- **Standard props**: Always destructure `_component`, `class: className`, `useDefaultEditableBinding`, `"data-prop"` (text) or `"data-children-prop"` (arrays), and `...htmlAttributes`.
- **Root element rules**: Spread `{...htmlAttributes}` on the root element so `renderBlock.astro` can pass through `data-editable="array-item"` and `data-id`. Never put a `data-editable` attribute on the root element — it would conflict with the one injected by `renderBlock`. Never use `display: contents` on the root element as it breaks editable array-item regions.
- **Early return guard**: `if (!_component && !hasContent) return;` — prevents empty rendering when used programmatically. When `_component` is set (placed via CloudCannon), always render so the editor can interact.
- **Editable bindings**: Follow the [editable-regions skill](../editable-regions/SKILL.md) for all editable region patterns. In short: pass `data-prop` on text building blocks, `data-children-prop` on array wrappers, `data-prop-src`/`data-prop-alt` on images, and `data-editable="array-item"` + `data-id` on mapped child items.
- **Global styles**: All component styles use `<style is:global>`. Use `@layer components` for building blocks, `@layer page-sections` for page sections. Use CSS custom properties for all values. Use `class:list` for conditional classes. Do NOT use `:global()` — it is not needed since all styles are global.

## CloudCannon structures registration

Components must be registered in the appropriate structure files in `.cloudcannon/structures/` so they appear as options in the CloudCannon editor. Each structure file defines which components are available in a given context.

### Structure files

| File                | Context                              | Typical contents                               |
| ------------------- | ------------------------------------ | ---------------------------------------------- |
| `containerSections` | Custom sections (main content areas) | All wrappers + core elements                   |
| `splitSections`     | Inside split layouts                 | All wrappers + core elements                   |
| `gridItemSections`  | Inside grid items                    | Card, accordion, modal + core elements         |
| `cardSections`      | Inside cards                         | Button group, accordion, modal + core elements |
| `accordionSections` | Inside accordion items               | Button group, modal + core elements            |
| `pageSections`      | Top-level page sections              | Glob: all page-section structure-values        |
| `modalSections`     | Inside modals                        | Button group, accordion + core elements        |
| `buttonSections`    | Button groups                        | Button only                                    |

### How to register

Add the component's `structure-value.yml` path to the `values_from_glob` array in each relevant structure file. Look at existing entries for the pattern.

- **Wrappers**: Add to `containerSections`, `splitSections`, `gridItemSections`, `cardSections`, and `accordionSections`
- **Core elements**: Already included via glob (`/src/components/building-blocks/core-elements/**/*.cloudcannon.structure-value.yml`) in most structures
- **Page sections**: Already included via glob in `pageSections`

### Components with content arrays

If the component accepts a `contentSections` array referencing `_structures.{name}Sections`, create a matching structure file at `.cloudcannon/structures/{name}Sections.cloudcannon.structures.yml`. Use `modalSections.cloudcannon.structures.yml` or `cardSections.cloudcannon.structures.yml` as a reference for what components to include.

---

## CloudCannon inputs.yml template

Each prop gets a field definition with `type` and `comment`. Field types: `text`, `textarea`, `markdown`, `select`, `switch`, `array`, `image`, `url`, `number`, `object`.

```yaml
text:
  type: text
  comment: The main text content.
variant:
  type: select
  comment: Visual style variant.
  options:
    values:
      - id: default
        name: Default
      - id: accent
        name: Accent
items:
  type: array
  comment: Items to display.
  options:
    structures: _structures.myItems
enabled:
  type: switch
  comment: Whether to show the component.
description:
  type: markdown
  comment: Rich text description.
  options:
    blockquote: false
    bold: true
    format:
    italic: true
    link: true
    strike: false
    subscript: true
    superscript: true
    underline: false
    bulletedlist: false
    numberedlist: false
source:
  type: image
  comment: Image source.
  options:
    paths:
      uploads: src/assets/images
      static: ''
    resize_style: contain
    width: 1920
    height: 1280
link:
  type: url
  comment: URL to link to.
iconName:
  type: select
  comment: Icon to display.
  options:
    values: _select_data.icons
    preview:
      text:
        - key: name
      image:
        - template: src/icons/{id}.svg
```

Use `hidden: true` for always-hidden fields, or `hidden: "!someField"` for conditional visibility. For reusable select options (colorScheme, backgroundColor, spacing), refer to existing components like `card.cloudcannon.inputs.yml`.

---

## CloudCannon structure-value.yml template

```yaml
label: My Component
icon: widgets
description: Short description of what the component does.
value:
  _component: {tier-path}/{slug}
  text: Default text
  variant: default
preview:
  text:
    - My Component
  subtext:
    - key: text
  icon: widgets
picker_preview:
  text: My Component
  subtext: Short description of what the component does.
_inputs_from_glob:
  - /src/components/{tier-path}/{slug}/{slug}.cloudcannon.inputs.yml
```

The `_component` path must match the component's location under `src/components/` using kebab-case segments (e.g., `building-blocks/core-elements/button`, `page-sections/heroes/hero-center`). The `renderBlock.astro` utility resolves components by this path.

### With child item structures

For wrappers with repeating items, add `_structures` to the structure-value file. Each structure entry defines a `label`, `icon`, `value` (default props), `preview`, and `_inputs` (inline field definitions for the child). See `accordion.cloudcannon.structure-value.yml` or `feature-grid.cloudcannon.structure-value.yml` for full examples.

---

## CloudCannon snippets.yml

Only needed for page sections insertable in MDX content. Uses `template: mdx_component` with `definitions.component_name` (PascalCase) and `named_args` mapping editor keys to types. String fields use `remove_empty: true`; array fields omit it; booleans use `type: boolean`. See `cta-center.cloudcannon.snippets.yml` or `feature-grid.cloudcannon.snippets.yml` for full examples.

---

## Design tokens

All styling uses CSS custom properties defined in `src/styles/variables/`. Never hardcode colors, spacing, fonts, etc. Key prefixes: `--spacing-{xs..6xl}`, `--font-size-{xs..5xl}`, `--font-weight-{normal,semibold,bold}`, `--color-{text,bg,border,...}`, `--radius-{none,xs..full}`, `--content-width-{xs..3xl}`, `--layer-{0..8}`, `--animation-{fast,normal,slow}`, `--ratio-{square,landscape,...}`. Use semantic color tokens (`--color-text`, `--color-bg-surface`) rather than palette values so themes apply correctly. Read the files in `src/styles/variables/` and `src/styles/themes/` for full values.

## Component documentation examples

Every component should have documentation in `src/component-docs/content/components/`. The path mirrors the component path (e.g., `building-blocks/wrappers/modal/`).

### Required files

```
src/component-docs/content/components/{tier-path}/{slug}/
├── index.md              # Component overview and example index
└── examples/
    ├── primary.md        # Default example (always required), doesn't need to be referenced in index.md
    ├── {prop}-{value}.md # One per notable prop variation
    └── {feature}.md      # One per notable feature
```

### index.md template

```yaml
---
title: My Component
overview: 'Short description of the component and how it is used.'
slots:
  - title: default
    description: The main content area.
    fallback_for: contentSections
    child_component:
examples:
  - slugs:
      - variant-a
      - variant-b
  - title: 'Sizes'
    slugs:
      - size-sm
      - size-md
      - size-lg
---
```

Key fields:

- `title` — component display name
- `overview` — brief description, supports markdown links to other component doc pages
- `slots` — list of slot names with `description` and `fallback_for` (the prop name the slot falls back to)
- `examples` — groups of example slugs to display together; optional `title` and `size` per group

### examples/primary.md template

```yaml
---
title: 'Primary My Component'
spacing: 'all'
blocks:
  _component: '{tier-path}/{slug}'
  text: 'Example content'
  variant: 'default'
---
```

Key fields:

- `title` — display name for this example
- `spacing` — layout hint for the docs viewer (`'all'` for padding, `null` for none)
- `blocks` — the component rendered as a live example; `_component` is the same path used in `structure-value.yml`, and all other keys are component props

### Example naming conventions

- `primary.md` — the default/basic example (always create this)
- `{prop}-{value}.md` — for prop variations (e.g., `size-sm.md`, `variant-ghost.md`, `padding-lg.md`)
- `{feature}.md` — for notable features (e.g., `icons.md`, `link.md`, `rounded.md`, `border.md`)

### Nested content in examples

For wrappers and page sections, nest child blocks using their `_component` paths:

```yaml
blocks:
  _component: 'building-blocks/wrappers/card'
  border: true
  paddingHorizontal: sm
  paddingVertical: sm
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Card heading
      level: h3
    - _component: building-blocks/core-elements/text
      text: Card body text.
```

---

## CustomSection props reference

Page sections wrap content in `CustomSection` from `@builders/custom-section/CustomSection.astro`. Key props: `maxContentWidth` (`xs`..`3xl`), `paddingHorizontal`/`paddingVertical` (`xs`..`6xl`, default `4xl`), `colorScheme` (`inherit`/`light`/`dark`), `backgroundColor` (`none`/`base`/`surface`/`accent`/`highlight`), `background` (object: `type` `none`/`image`/`video`, shared positioning, plus image or video fields), `label` (string, also used as anchor ID), `useDefaultEditableBinding` (boolean). Note: `rounded` is only available on `CustomSection` directly, not forwarded by page section wrappers.
