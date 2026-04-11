---
name: editable-regions
description: Deep reference for CloudCannon editable regions in this Astro component library. Use when wiring visual editing bindings on components, understanding how data-prop / data-children-prop / data-prop-src / data-prop-alt work, or debugging why a field isn't editable in the Visual Editor.
---

# Editable Regions

Editable regions connect visible elements on the page to the structured data that produced them. Without them, CloudCannon can render a page preview but cannot know which piece of data to update when an editor clicks something. Editable regions close that gap by marking HTML elements with `data-*` attributes that say "this element represents this prop."

CloudCannon reference docs: [What are Editable Regions?](https://cloudcannon.com/documentation/developer-articles/what-are-editable-regions/) and [Editable Regions reference](https://cloudcannon.com/documentation/developer-reference/editable-regions/).

There are five types of editable region: **text**, **image**, **source**, **array** (with **array-item**), and **component**.

---

## How this codebase simplifies editable regions

Building block components (`Heading`, `Text`, `Image`, `Grid`, `ButtonGroup`, etc.) handle the raw `data-editable` attribute internally. Page sections never write `data-editable="text"` or `data-editable="array"` themselves — they pass higher-level props that the building blocks translate:

| What you pass on the building block                    | What the building block renders in the DOM                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `data-prop="heading"`                                  | `data-editable="text" data-prop="heading"`                                   |
| `data-children-prop="items"`                           | `data-editable="array" data-prop="items"`                                    |
| `data-prop-src="imageSource" data-prop-alt="imageAlt"` | `data-editable="image" data-prop-src="imageSource" data-prop-alt="imageAlt"` |

### The `useDefaultEditableBinding` prop

Every building block accepts `useDefaultEditableBinding` (boolean, default `false`). When `true` and no explicit `data-prop` / `data-children-prop` is passed, the component falls back to its own default prop name:

| Component                                             | Default prop name                |
| ----------------------------------------------------- | -------------------------------- |
| `Heading`, `Text`, `SimpleText`, `Button`, `ListItem` | `"text"`                         |
| `Image`                                               | `"source"` (src) / `"alt"` (alt) |
| `Grid`                                                | `"items"`                        |
| `ButtonGroup`                                         | `"buttonSections"`               |
| `Accordion`                                           | `"items"`                        |
| `Carousel`                                            | `"slides"`                       |
| `Card`                                                | `"contentSections"`              |
| `GridItem`, `AccordionItem`, `CarouselSlide`          | `"contentSections"`              |

This prop cascades: `renderBlock.astro` sets `useDefaultEditableBinding={true}` on every block it renders, so all nested building blocks automatically bind to their default prop names without the page section author doing anything extra.

### `renderBlock.astro`

`renderBlock.astro` dynamically renders an array of content blocks. It auto-stamps each rendered block with `data-editable="array-item"` and `data-id={block._component}`. The **caller's container element** owns `data-editable="array"` — `renderBlock` never adds it.

```astro
<Component
  data-editable={useDefaultEditableBinding ? 'array-item' : undefined}
  data-id={block._component}
  {...block}
  useDefaultEditableBinding={useDefaultEditableBinding}
/>
```

---

## Text editable regions

Make any text field editable by passing `data-prop` on a text building block.

### Pattern

```astro
<Heading level="h2" size="lg" alignmentHorizontal="center" data-prop="heading" text={heading} />
<Text alignmentHorizontal="center" data-prop="subtext" text={subtext} />
<SimpleText data-prop="eyebrow" text={eyebrow} />
```

The `data-prop` value must match a prop name on the parent component (which maps to a front matter key). When an editor clicks the element, CloudCannon updates that key.

### How it works internally

Text building blocks destructure `"data-prop": customDataProp` and compute:

```js
const effectiveDataProp = customDataProp ?? (useDefaultEditableBinding ? 'text' : null);
const textDataAttributes = effectiveDataProp
  ? { 'data-editable': 'text', 'data-prop': effectiveDataProp }
  : {};
```

The attributes are spread onto the inner text element (e.g., `.heading-text`), not the outer wrapper. This means the editable region targets exactly the right DOM node.

### `data-type` — controlling rich text level

The `data-type` attribute controls which formatting options are available:

| Value   | Behavior                                                              |
| ------- | --------------------------------------------------------------------- |
| `span`  | Plain text only (default for most inputs)                             |
| `text`  | Paragraph-level rich text                                             |
| `block` | Multi-paragraph rich text (default for `@content` and source regions) |

### Multi-field text bindings

Some components bind multiple text fields using `data-prop-*` variants. For example, `Testimonial` uses:

```astro
<span data-editable="text" data-prop="text" ...>{text}</span>
<span data-editable="text" data-prop-author-name="authorName" ...>{authorName}</span>
<span data-editable="text" data-prop-author-description="authorDescription" ...
  >{authorDescription}</span
>
```

The `data-prop-*` pattern renames the key when passing to CloudCannon: `data-prop-author-name="authorName"` tells CloudCannon the DOM attribute `author-name` maps to the `authorName` data key.

### Markdown body content

To make the Markdown body of a file editable:

```astro
<div data-editable="text" data-prop="@content">
  <slot />
</div>
```

`@content` is a special value that targets the file's Markdown content rather than a front matter key.

---

## Image editable regions

Make an image editable by passing `data-prop-src` and `data-prop-alt` on the `Image` building block.

### Pattern

```astro
<Image source={imageSource} alt={imageAlt} data-prop-src="imageSource" data-prop-alt="imageAlt" />
```

When an editor clicks the image, CloudCannon opens a file picker. The selected file writes back to `imageSource` and the alt text to `imageAlt`.

### How it works internally

`Image.astro` detects whether any editable prop was passed:

```js
const isEditable =
  useDefaultEditableBinding || customDataPropSrc != null || customDataPropAlt != null;
const dataAttributes = isEditable
  ? {
      'data-editable': 'image',
      'data-prop-src': customDataPropSrc || 'source',
      'data-prop-alt': customDataPropAlt || 'alt',
    }
  : {};
```

When `useDefaultEditableBinding` is `true` and no explicit props are passed, it defaults to `"source"` and `"alt"`.

---

## Array editable regions

Arrays allow editors to add, remove, and reorder items in the Visual Editor.

### Container pattern

Pass `data-children-prop` on a wrapper building block:

```astro
<ButtonGroup buttonSections={buttonSections} alignmentHorizontal="center" data-children-prop="buttonSections" />

<Grid gap="lg" minItemWidth="360" class="feature-grid" data-children-prop="features">
  {
    features.map((feature) => (
      <FeatureItem
        data-editable="array-item"
        data-id="page-sections/features/feature-grid/feature-item"
        {...feature}
      />
    ))
  }
</Grid>
```

The wrapper translates `data-children-prop` into the DOM attributes:

```js
const effectiveChildrenProp = childrenDataProp ?? (useDefaultEditableBinding ? 'items' : null);
const arrayDataAttributes = effectiveChildrenProp
  ? { 'data-editable': 'array', 'data-prop': effectiveChildrenProp }
  : {};
```

### `data-direction`

Controls drag-and-drop indicator direction in the Visual Editor:

| Value            | Behavior                     |
| ---------------- | ---------------------------- |
| `column`         | Vertical ascending (default) |
| `row`            | Horizontal ascending         |
| `column-reverse` | Vertical descending          |
| `row-reverse`    | Horizontal descending        |

`Grid` sets `data-direction="row"` automatically.

### Array item marking — two approaches

**1. Manual mapping** (page sections with custom child components):

When you iterate over an array in a page section and render child components, mark each child with `data-editable="array-item"` and `data-id`:

```astro
{
  features.map((feature) => (
    <FeatureItem
      data-editable="array-item"
      data-id="page-sections/features/feature-grid/feature-item"
      {...feature}
    />
  ))
}
```

`data-id` is the child component's path under `src/components/`, using the same format as `_component` in structure-value files.

**2. Via `renderBlock.astro`** (for structured content arrays like `contentSections` or `buttonSections`):

When a wrapper renders its children through `renderBlock.astro`, array-item attributes are added automatically. The wrapper only needs `data-children-prop` on its container — `renderBlock` handles the rest.

### Complex arrays with mixed component types

When array items don't share the same structure, add identification attributes so CloudCannon can match each item to its component:

On the **array container**:

- `data-id-key="_name"` — tells CloudCannon which key holds the unique ID
- `data-component-key="_name"` — tells CloudCannon which key holds the component name

On each **array item**:

- `data-id={block._name}` — the unique ID value
- `data-component={block._name}` — the component name for registration lookup

```astro
<section
  data-editable="array"
  data-prop="contentBlocks"
  data-id-key="_name"
  data-component-key="_name"
>
  {
    contentBlocks.map((block) => {
      const Component = components[block._name];
      return (
        <div data-editable="array-item" data-id={block._name} data-component={block._name}>
          <Component {...block} />
        </div>
      );
    })
  }
</section>
```

This pattern is not commonly needed in this codebase because `renderBlock.astro` handles component resolution via `_component`, but it's available for advanced use cases.

---

## Component editable regions

Component editable regions allow CloudCannon to re-render registered components in the Visual Editor when their data changes.

### Pattern

This codebase uses a component editable region at the page level in `Page.astro`:

```astro
<div
  data-editable="component"
  data-component="utils/main-component"
  data-prop-sections="pageSections"
>
  <MainComponent sections={sections} />
</div>
```

- `data-component` references the registered component name
- `data-prop-sections` maps the `sections` DOM property to the `pageSections` front matter key

Component registration is handled by `@cloudcannon/editable-regions/astro` (configured in `astro.config.mjs`).

### When to use

Component editable regions are a layout-level concern. Page section authors do not typically create these — they are wired in layout files (`Page.astro`) where the full page structure is assembled.

---

## Source editable regions

Source editable regions allow inline editing of raw HTML content in the Visual Editor.

### Pattern

```astro
<main data-editable="source" data-path="/src/pages/index.astro" data-key="main">
  <h1>Hello!</h1>
  <p>Content here.</p>
</main>
```

Required attributes:

- `data-editable="source"` — declares the region type
- `data-path` — the file path to edit
- `data-key` — unique identifier for this region within the file (required when multiple source regions exist in one file)

### When to use

Source editable regions are for editing raw HTML directly, not structured data. This codebase does not use them — all editing is through structured front matter props with text, image, and array bindings. They are documented here for completeness.

---

## Quick reference

| I want to...                                   | Pattern                                                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Edit a heading or text field                   | `data-prop="propName"` on `Heading`, `Text`, `SimpleText`, or `Button`                                                           |
| Edit an image                                  | `data-prop-src="srcProp"` + `data-prop-alt="altProp"` on `Image`                                                                 |
| Edit a row of buttons                          | `data-children-prop="buttonSections"` on `ButtonGroup`                                                                           |
| Edit a grid of items                           | `data-children-prop="propName"` on `Grid`, then `data-editable="array-item"` + `data-id="{component-path}"` on each mapped child |
| Edit accordion/carousel items                  | `data-children-prop="propName"` on `Accordion` or `Carousel` (items rendered via `renderBlock`)                                  |
| Edit nested content in a card                  | `data-children-prop="contentSections"` on `Card` (items rendered via `renderBlock`)                                              |
| Edit the Markdown body                         | `data-editable="text"` + `data-prop="@content"` on a wrapper around `<slot />`                                                   |
| Make all defaults bind automatically           | Set `useDefaultEditableBinding={true}` — all child building blocks use their default prop names                                  |
| Prevent editable binding                       | Set `useDefaultEditableBinding={false}` or omit `data-prop` / `data-children-prop`                                               |
| Ignore `data-editable` for non-CloudCannon use | Add `data-cloudcannon-ignore` to the element                                                                                     |

### Do not use editable web components

CloudCannon documents web components (`<editable-text>`, `<editable-image>`, etc.) as alternatives to `data-editable` attributes. Do not use them in this codebase — always use standard HTML elements with `data-*` attributes instead.
