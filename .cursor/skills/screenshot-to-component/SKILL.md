---
name: screenshot-to-component
description: Build a new page section component from a screenshot. Use when the user pastes a screenshot of a UI section and wants it turned into an Astro component with CloudCannon configuration.
---

# Screenshot to Component

Build a new page section component from a visual reference. This skill always creates a new component — it never reuses existing page sections. The new component composes existing building blocks (Heading, Text, Image, Button, Grid, Split, Card, etc.) to stay consistent with the design system.

## Workflow overview

1. **Analyze** the screenshot visually
2. **Scaffold** a new page section component (`.astro` + CloudCannon YAML)
3. **Register** it in CloudCannon structures (usually automatic via glob)
4. **Generate** a `pageSections` YAML entry with content extracted from the screenshot

Follow the [create-component skill](../create-component/SKILL.md) for all file conventions, naming rules, and Astro patterns. This skill adds the visual analysis layer on top.

---

## Step 1 — Visual analysis

Before writing any code, describe what you see in a structured format. This analysis drives the prop design and markup.

### Layout

Identify the overall structure:

- Single column centered
- Split / two-column (image + text)
- Grid of N cards or items
- Stacked vertical blocks
- Carousel / slider
- Combination (e.g., heading area + grid below)

### Content elements

Catalog every visible element:

- Headings — how many levels, what text
- Body text — short tagline or long paragraph
- Images — hero/banner, thumbnail, icon-sized, background
- Icons — decorative or functional
- Buttons — count, label text, primary/secondary style
- Lists — bullet, numbered, icon-prefixed
- Quotes or testimonials
- Form fields
- Embedded media (video, map)

### Repeating patterns

Look for items that repeat with the same structure:

- How many items are visible?
- What fields does each item contain (title, description, image, icon, link)?
- Are they in a grid, list, or carousel?

This determines whether you need a child `{Name}Item.astro` component and an items array prop.

### Visual treatment

Note the visual characteristics — these map to design tokens later:

- Background: solid color, image, gradient, transparent
- Padding: tight (sm), normal (lg-2xl), spacious (4xl+)
- Color scheme: light on dark, dark on light, accent/highlight
- Borders, rounded corners, shadows on cards
- Text alignment: centered, left-aligned, mixed

### Interactions

Identify dynamic behavior (accordion, tabs, modal, carousel, hover effects, etc.) and map each to a CSS-first technique. See the CSS-first convention table in the [create-component skill](../create-component/SKILL.md) for the full mapping. If an existing wrapper handles the behavior, compose it rather than reimplementing.

---

## Step 2 — Scaffold the component

Follow the [create-component skill](../create-component/SKILL.md) for all conventions. Key decisions below.

### Naming

Derive a descriptive kebab-case slug from the screenshot's purpose. Examples:

- `service-cards` — grid of service offerings
- `team-highlight` — team photos with bios
- `testimonial-carousel` — sliding testimonials
- `location-info` — map embed with address
- `pricing-table` — comparison pricing

The user may provide a name; otherwise propose one and confirm.

### Category

Place in `src/components/page-sections/{category}/{slug}/`. Choose from:

| Category      | When to use                                            |
| ------------- | ------------------------------------------------------ |
| `heroes`      | Top-of-page banner sections with prominent heading     |
| `features`    | Showcasing capabilities, services, or benefits         |
| `ctas`        | Driving a specific action (schedule, contact, sign up) |
| `people`      | Team members, testimonials, reviews                    |
| `info-blocks` | FAQ, pricing, stats, informational content             |
| `builders`    | Catch-all for sections that don't fit above            |

### Files to create

```
src/components/page-sections/{category}/{slug}/
├── {Name}.astro
├── {slug}.cloudcannon.inputs.yml
├── {slug}.cloudcannon.structure-value.yml
└── {Name}Item.astro              ← only if the section has repeating items
```

### Building the Astro component

The component must follow the page section pattern from the create-component skill. Here is a concrete example of how to translate a screenshot into a component.

**Example: A section showing 3 service cards in a grid, with a heading and subtext above.**

```astro
---
import CustomSection from '@builders/custom-section/CustomSection.astro';
import Heading from '@core-elements/heading/Heading.astro';
import Text from '@core-elements/text/Text.astro';
import Grid from '@wrappers/grid/Grid.astro';
import ServiceCardItem from './ServiceCardItem.astro';

type ItemProps = Record<string, unknown>;

const {
  heading = '',
  subtext = '',
  items = [],
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
  class:list={['service-cards', className]}
  maxContentWidth="2xl"
  paddingHorizontal="lg"
  paddingVertical={paddingVertical}
  colorScheme={colorScheme}
  backgroundColor={backgroundColor}
  useDefaultEditableBinding={useDefaultEditableBinding}
  {...htmlAttributes}
>
  <Heading level="h2" size="lg" alignmentHorizontal="center" data-prop="heading">
    {heading}
  </Heading>
  <Text class="service-cards-subtext" alignmentHorizontal="center" data-prop="subtext" text={subtext} />
  <Grid
    gap="lg"
    minItemWidth="300"
    maxItemWidth="400"
    class="service-cards-grid"
    data-children-prop="items"
  >
    {
      items.map((item: ItemProps) => (
        <ServiceCardItem
          data-id="page-sections/features/service-cards/service-card-item"
          data-editable="array-item"
          {...item}
        />
      ))
    }
  </Grid>
</CustomSection>

<style is:global>
  @layer page-sections {
    .service-cards-grid {
      margin-top: var(--spacing-2xl);
    }
  }
</style>
```

### Composition rules

Always compose from existing building blocks. Never write raw HTML when a building block exists:

| Instead of             | Use                                           |
| ---------------------- | --------------------------------------------- |
| `<h2>`                 | `Heading` with `level="h2"`                   |
| `<p>` with markdown    | `Text` with `text={content}`                  |
| `<p>` plain inline     | `SimpleText` with `text={content}`            |
| `<img>`                | `Image` with `source`, `alt`, `aspectRatio`   |
| `<a>` styled as button | `Button` with `text`, `link`, `variant`       |
| `<svg>` icon           | `Icon` with `name`, `size`, `color`           |
| `<blockquote>`         | `Testimonial` with author props               |
| `<iframe>`             | `Embed` with `src`, `title`                   |
| `<div>` grid           | `Grid` / `GridItem` wrappers                  |
| `<div>` two-column     | `Split` with `slot="first"` / `slot="second"` |
| `<div>` card           | `Card` with `contentSections` or children     |
| Row of buttons         | `ButtonGroup` with `buttonSections`           |
| Expandable sections    | `Accordion` / `AccordionItem`                 |
| Sliding items          | `Carousel` / `CarouselSlide`                  |

### Editable bindings

Every text prop, image prop, and array prop needs CloudCannon editable bindings so editors can update content in the visual preview. Follow the [editable-regions skill](../editable-regions/SKILL.md) for the full reference. The key patterns for page sections:

- **Text**: `data-prop="propName"` on `Heading`, `Text`, `SimpleText`, `Button`
- **Images**: `data-prop-src="sourceProp"` + `data-prop-alt="altProp"` on `Image`
- **Arrays**: `data-children-prop="propName"` on wrapper (`Grid`, `ButtonGroup`, etc.)
- **Array items**: `data-editable="array-item"` + `data-id="{component-path}"` on each mapped child

### Translating visual characteristics to design tokens

| Visual observation             | Token to use                                          |
| ------------------------------ | ----------------------------------------------------- |
| Tight spacing between elements | `--spacing-sm` or `--spacing-md`                      |
| Normal spacing                 | `--spacing-lg` or `--spacing-xl`                      |
| Spacious section padding       | `--spacing-4xl` to `--spacing-6xl`                    |
| Small heading                  | `--font-size-heading-sm` (1.375rem)                   |
| Medium heading                 | `--font-size-heading-md` (1.75rem)                    |
| Large heading                  | `--font-size-heading-lg` (2.25rem)                    |
| Extra large / hero heading     | `--font-size-heading-xl` to `--font-size-heading-3xl` |
| Light background section       | `backgroundColor: "base"` or `"surface"`              |
| Dark background section        | `colorScheme: "dark"`, `backgroundColor: "surface"`   |
| Accent/colored background      | `backgroundColor: "accent"` or `"highlight"`          |
| Small rounded corners          | `--radius-sm` (8px)                                   |
| Medium rounded corners         | `--radius-md` (12px)                                  |
| Large rounded / pill           | `--radius-xl` to `--radius-full`                      |
| Thin border                    | `1px solid var(--color-border)`                       |
| Subtle shadow                  | `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`               |

### Global styles

Use `<style is:global>` and `@layer page-sections` for all styles. Do NOT use `:global()` — all styles are global so it is not needed:

```css
<style is:global>
  @layer page-sections {
    .my-section-heading {
      margin-bottom: var(--spacing-lg);
    }

    .my-section-grid {
      margin-top: var(--spacing-2xl);
    }
  }
</style>
```

---

## Step 3 — CloudCannon configuration

### inputs.yml

One field per prop. Follow the patterns from the create-component skill.

Common field patterns:

```yaml
heading:
  type: text
  comment: Main heading for the section.
subtext:
  type: markdown
  comment: Supporting text beneath the heading.
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
imageSource:
  type: image
  comment: Section image.
  options:
    paths:
      uploads: src/assets/images
      static: ''
    resize_style: contain
    width: 1920
    height: 1280
imageAlt:
  type: text
  comment: Alt text describing the image.
items:
  type: array
  comment: Items displayed in the section.
  options:
    structures: _structures.{slug}Items
colorScheme:
  type: select
  comment: Color scheme for the section.
  options:
    values:
      - id: inherit
        name: Inherit
      - id: light
        name: Light
      - id: dark
        name: Dark
backgroundColor:
  type: select
  comment: Background color for the section.
  options:
    values:
      - id: none
        name: None
      - id: base
        name: Base
      - id: surface
        name: Surface
      - id: accent
        name: Accent
      - id: highlight
        name: Highlight
paddingVertical:
  type: select
  comment: Vertical padding for the section.
  options:
    values:
      - id: none
        name: None
      - id: sm
        name: Small
      - id: md
        name: Medium
      - id: lg
        name: Large
      - id: xl
        name: Extra Large
      - id: 2xl
        name: 2xl
      - id: 3xl
        name: 3xl
      - id: 4xl
        name: 4xl
      - id: 5xl
        name: 5xl
      - id: 6xl
        name: 6xl
```

### structure-value.yml

```yaml
label: Section Name
icon: material_icon_name
description: One-line description of the section.
value:
  _component: page-sections/{category}/{slug}
  heading: Default heading text
  subtext: Default subtext placeholder.
  items: []
  colorScheme: inherit
  backgroundColor: base
preview:
  text:
    - Section Name
  subtext:
    - key: heading
  icon: material_icon_name
picker_preview:
  text: Section Name
  subtext: One-line description of the section.
_inputs_from_glob:
  - /src/components/page-sections/{category}/{slug}/{slug}.cloudcannon.inputs.yml
```

If the component has repeating items, add `_structures` with inline `_inputs`:

```yaml
_structures:
  {slug}Items:
    values:
      - label: Item
        icon: widgets
        value:
          title: Item title
          description: Item description placeholder.
        preview:
          text:
            - key: title
            - Item
          subtext:
            - key: description
        _inputs:
          title:
            type: text
            comment: Item title.
          description:
            type: markdown
            comment: Item description.
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
```

### Registration

Page sections are auto-included in the `pageSections` structure via glob:

```yaml
# .cloudcannon/structures/pageSections.cloudcannon.structures.yml
pageSections:
  id_key: _component
  style: modal
  values_from_glob:
    - /src/components/page-sections/**/*.cloudcannon.structure-value.yml
```

No manual registration is needed for new page sections. Verify the glob pattern matches your file path.

---

## Step 4 — Generate content YAML

After the component is scaffolded, produce a ready-to-use `pageSections` entry populated with content from the screenshot.

### Format

Follows the pattern in `src/content/pages/index.md`:

```yaml
- _component: page-sections/{category}/{slug}
  heading: Exact heading text from screenshot
  subtext: >-
    Exact body text from the screenshot. Use block scalar
    for multi-line content.
  imageSource: /src/assets/images/placeholder.jpg
  imageAlt: Descriptive alt text based on what the image shows
  items:
    - title: First item title from screenshot
      description: First item description from screenshot
    - title: Second item title from screenshot
      description: Second item description from screenshot
  colorScheme: inherit
  backgroundColor: base
```

### Rules

- Extract all visible text from the screenshot as prop values.
- Use `/src/assets/images/placeholder.jpg` for images — the user replaces these later.
- Use `>-` block scalar for multi-line text values.
- Set `colorScheme` and `backgroundColor` based on the screenshot's visual treatment:
  - White/light background → `colorScheme: inherit`, `backgroundColor: base`
  - Light gray background → `colorScheme: inherit`, `backgroundColor: surface`
  - Dark background → `colorScheme: dark`, `backgroundColor: surface`
  - Colored accent background → `backgroundColor: accent` or `highlight`
- Set `paddingVertical` based on spacing density:
  - Tight → `lg` or `xl`
  - Normal → `3xl` or `4xl`
  - Spacious → `5xl` or `6xl`

---

## Step 5 — Multi-section pages

When the screenshot shows multiple sections (a full page or long scroll):

1. **Segment** — identify each distinct section boundary. Boundaries are usually marked by background color changes, large vertical spacing, or horizontal dividers.
2. **Name** — give each section a descriptive slug. Use a consistent prefix if they belong to the same site (e.g., `dental-hero`, `dental-services`, `dental-testimonials`).
3. **Scaffold** — create a component for each section following Steps 2-3 above.
4. **Assemble** — output a complete `pageSections` array covering the full page, with one entry per section.

---

## Building block reference

Quick lookup of all building blocks available for composition.

### Core elements

Import via `@core-elements/{slug}/{Name}.astro`.

| Component        | Renders                              | Key props                                                                                                                  |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `Heading`        | Semantic heading (h1-h6)             | `text`, `level` (h1-h6), `size` (xs-5xl), `alignmentHorizontal` (start/center/end)                                                      |
| `Text`           | Body paragraph, supports markdown    | `text`, `alignmentHorizontal`                                                                                                           |
| `SimpleText`     | Plain inline text (eyebrows, labels) | `text`, `alignmentHorizontal`                                                                                                           |
| `Image`          | Responsive optimized image           | `source`, `alt`, `aspectRatio` (square/landscape/portrait/wide/none), `rounded`                                            |
| `Icon`           | SVG icon from icon set               | `name`, `size` (xs-4xl), `color` (default/blue/green/yellow/orange/red/purple/pink/cyan), `background`                     |
| `Button`         | Link or button                       | `text`, `link`, `variant` (primary/secondary/tertiary/ghost), `size` (sm/md/lg), `iconName`, `iconPosition` (before/after) |
| `List`           | Ordered/unordered list               | `items[]`, `ordered`, `iconName`                                                                                           |
| `DefinitionList` | Term + definition pairs              | `items[]` (term, definition)                                                                                               |
| `Testimonial`    | Blockquote with author               | `text`, `authorName`, `authorDescription`, `authorImage`, `alignmentHorizontal`                                                         |
| `Embed`          | iframe embed                         | `src`, `title`, `aspectRatio`                                                                                              |
| `Video`          | YouTube/Vimeo lite embed             | `videoId`, `provider` (youtube/vimeo)                                                                                      |
| `Counter`        | Animated number counter              | `value`, `suffix`, `label`                                                                                                 |
| `Divider`        | Horizontal rule                      | —                                                                                                                          |
| `Spacer`         | Vertical whitespace                  | `size` (xs-6xl)                                                                                                            |

### Wrappers

Import via `@wrappers/{slug}/{Name}.astro`.

| Component                                  | Renders             | Key props                                                                                                                                         |
| ------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Grid` / `GridItem`                        | Responsive CSS grid | `minItemWidth`, `maxItemWidth`, `gap` (sm-3xl), `items[]`                                                                                         |
| `Split`                                    | Two-column layout   | `reverse`, `distributionMode` (equal/fixed-flexible/flexible-fixed), `alignmentVertical` (start/center/end), `fixedWidth`, `minSplitWidth`, `gap` |
| `Card`                                     | Content container   | `contentSections[]`, `border`, `rounded`, `link`, `paddingHorizontal`, `paddingVertical`, `backgroundColor`, `colorScheme`                        |
| `BentoBox` / `BentoBoxItem`                | Spanning grid       | `columns`, `minRowHeight`, `gap`, `items[]`                                                                                                       |
| `Accordion` / `AccordionItem`              | Expandable panels   | `items[]`, `openFirst`, `singleOpen`                                                                                                              |
| `Carousel` / `CarouselSlide`               | Sliding content     | `slides[]`, `autoPlay`, `autoScroll`, `loop`, `showArrows`, `showIndicators`, `slideWidthPercent`, `minSlideWidth`                                |
| `ButtonGroup`                              | Button row/column   | `buttonSections[]`, `direction` (row/column), `alignmentHorizontal` (start/center/end)                                                                         |
| `Modal`                                    | Popover dialog      | `triggerText`, `triggerVariant`, `size`, `contentSections[]`                                                                                      |
| `ContentSelector` / `ContentSelectorPanel` | Tabbed content      | `items[]`, `navigationPosition`                                                                                                                   |

### CustomSection (page section wrapper)

Import via `@builders/custom-section/CustomSection.astro`. Every page section wraps its content in this.

| Prop                | Values                                 | Default |
| ------------------- | -------------------------------------- | ------- |
| `maxContentWidth`   | xs, sm, md, lg, xl, 2xl, 3xl           | —       |
| `paddingHorizontal` | xs through 6xl                         | —       |
| `paddingVertical`   | xs through 6xl                         | 4xl     |
| `colorScheme`       | inherit, light, dark                   | inherit |
| `backgroundColor`   | none, base, surface, accent, highlight | —       |
| `background`        | object: `type` (`none`/`image`/`video`), positioning, image or video fields | —       |
| `label`             | string (also used as anchor ID)        | —       |
