---
name: editable-regions
description: Use when wiring inline visual editing on a component so CloudCannon knows which prop an on-canvas element maps to — the useDefaultEditableBinding opt-in, custom data-prop / data-prop-src / data-prop-alt / data-children-prop, and array-item wiring. Start here for "make this text/image/list editable in the Visual Editor" or "field won't update when I edit it".
---

# Editable regions

Editable regions connect an on-canvas element to the frontmatter prop that produced it, so an editor clicking it updates the right data. In this starter you almost never write raw `data-editable="…"` — you pass higher-level props on the **building block** and it emits the raw attribute for you.

This skill owns the starter's editable-binding attribute tables (per `.agents/skills/STYLE.md`). For the underlying CloudCannon API — region lifecycle, the JS API, quirks — see [../references/editable-regions-api.md](../references/editable-regions-api.md). Read the raw attributes there to understand behaviour; write the building-block props documented here in practice.

## When to use

- Making a heading, body, label, image, or repeating list editable inline in the Visual Editor.
- Overriding a component's default binding, or renaming which prop an element writes to.
- A field renders but does not update when you edit it in the editor (see [Debugging](#debugging-a-binding-that-does-not-update)).

## When not to use

| Situation                                                       | Go instead to                                                                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Building a brand-new component (`.astro` + YAML + registration) | [create-component](../create-component/SKILL.md)                                                                                            |
| A section not appearing / picker or render pipeline broken      | [debug-cloudcannon](../debug-cloudcannon/SKILL.md)                                                                                          |
| Understanding the raw region types, JS API, or lifecycle        | [../references/editable-regions-api.md](../references/editable-regions-api.md)                                                              |
| Interactive JS that must also run in the editor                 | [create-component/component-templates.md](../create-component/component-templates.md#interactive-components-js-that-must-run-in-the-editor) |

## Contents

| File                       | Covers                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [patterns.md](patterns.md) | Multi-field text (`data-prop-author-*`), Card before/after slots, `@content` markdown body, page-level component region, mixed-type arrays |

## The core rule: pass props, not raw attributes

**MUST NOT:** put `data-editable` on a component's **root** element.
**Why:** `renderBlock.astro` injects `data-editable="array-item"` on the root of every placed block — a hand-written `data-editable` collides with it. Building blocks always emit their region attribute on an **inner** node (`.heading-text`, `.text-inner`, the `<img>`), never the root.

**MUST NOT:** use `display: contents` on a component root.
**Why:** it removes the root box the array-item region binds to, so the item drops out of the editor.

Editable web components (`<editable-text>`, `<editable-image>`, …) are **banned** — always standard HTML elements with `data-*` attributes. See the banned-elements callout in [../references/editable-regions-api.md](../references/editable-regions-api.md#custom-element-equivalents--banned-in-this-starter).

## What you pass → what the DOM gets

Building blocks translate these props internally. Prop paths are **camelCase**, matching the component's `.astro` destructure exactly.

| Prop you pass on the building block                    | Attribute it emits on its inner node                                         | Region |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- | ------ |
| `data-prop="heading"`                                  | `data-editable="text" data-prop="heading"`                                   | text   |
| `data-prop-src="imageSource" data-prop-alt="imageAlt"` | `data-editable="image" data-prop-src="imageSource" data-prop-alt="imageAlt"` | image  |
| `data-children-prop="items"`                           | `data-editable="array" data-prop="items"`                                    | array  |

The `data-prop` / `data-children-prop` value **must** match a real prop on the component whose frontmatter you are editing, or CloudCannon writes to a key that does not exist and the edit silently no-ops.

## `useDefaultEditableBinding` — the opt-in switch

Every building block accepts `useDefaultEditableBinding` (boolean, default `false`). When `true` **and** no explicit `data-prop` / `data-children-prop` is passed, the block binds to its **own default prop name** (table below). An explicit `data-prop` always wins over the default.

**Cascade:** `renderBlock.astro` renders placed blocks with `useDefaultEditableBinding={true}` (its own default is `true`), so any component dropped into a page — or into a `contentSections` / `buttonSections` array — binds to its defaults automatically. **You only write `data-prop` / `data-children-prop` when a page-section wrapper composes a block directly** and you need a specific (or renamed) prop.

```astro
<!-- Uses the block's default ("text") because renderBlock set the flag -->
<Heading />

<!-- Custom override: bind this heading to the section's `heading` prop -->
<Heading level="h2" data-prop="heading" text={heading} />
```

### Default binding prop names

| Building block                                            | Default prop(s) when `useDefaultEditableBinding` is on                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Heading`, `Text`, `SimpleText`, `Button`, `ListItem`     | `text`                                                                                                 |
| `Testimonial`                                             | `text` + `authorName` + `authorDescription` (see [patterns.md](patterns.md))                           |
| `Image`                                                   | `source` (src) / `alt` (alt)                                                                           |
| `Grid`, `Accordion`, `Steps`, `List`, `DefinitionList`    | `items`                                                                                                |
| `Timeline`                                                | `entries`                                                                                              |
| `ButtonGroup`                                             | `buttonSections`                                                                                       |
| `Carousel`                                                | `slides`                                                                                               |
| `Card`                                                    | `contentSections` (+ `beforeContentSections` / `afterContentSections`, see [patterns.md](patterns.md)) |
| `GridItem`, `AccordionItem`, `CarouselSlide`, `StepsItem` | `contentSections`                                                                                      |
| `TimelineItem`                                            | `date` / `title` / `body`                                                                              |

Verify a default against the source before relying on it — each block computes `const effectiveDataProp = customDataProp ?? (useDefaultEditableBinding ? "<name>" : null)` in its frontmatter, where `customDataProp` is the passed `data-prop` (or `data-children-prop`) value.

## Wire inline editing on an existing component

Work inside a page-section wrapper that composes building blocks (model: `src/components/page-sections/explainers/feature-grid/FeatureGrid.astro`).

### Text

Put `data-prop` on the text block, pointing at the section prop:

```astro
<SimpleText data-prop="eyebrow" text={eyebrow} />
<Heading level="h2" data-prop="heading" text={heading} />
<Text data-prop="subtext" text={subtext} />
```

### Image

Pass **both** src and alt bindings:

```astro
<Image source={imageSource} alt={imageAlt} data-prop-src="imageSource" data-prop-alt="imageAlt" />
```

**MUST:** pass `data-prop-src` and `data-prop-alt` together when the prop names differ from the `source` / `alt` defaults.
**Why:** passing only `data-prop-src` still makes the image editable, but alt falls back to the default key `alt`; if the data uses `imageAlt`, CloudCannon writes alt text to a nonexistent field. (`isEditable` is true if _either_ is set.)

### Array (repeating items)

Two shapes, depending on how children are rendered.

**A. Children rendered through `renderBlock`** (structured arrays: `buttonSections`, `contentSections`, accordion/carousel/card content). Only the wrapper needs the prop — `renderBlock` stamps `data-editable="array-item"` + `data-id={block._component}` on each row:

```astro
<ButtonGroup buttonSections={buttonSections} data-children-prop="buttonSections" />
```

**B. Fixed child component mapped manually** (a page section iterating its own `{Name}Item`). The wrapper owns the array container; you mark each child yourself:

```astro
<Grid gap="lg" minItemWidth="360" data-children-prop="features">
  {
    features.map((feature) => (
      <FeatureItem
        data-editable="array-item"
        data-id="page-sections/explainers/feature-grid/feature-item"
        {...feature}
      />
    ))
  }
</Grid>
```

## Array-item wiring rules

| Attribute                           | Goes on             | Value                                                                                                                                                                                            |
| ----------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-editable="array"` `data-prop` | array **container** | Emitted by the wrapper from `data-children-prop` — you do not write it directly.                                                                                                                 |
| `data-editable="array-item"`        | each **item** root  | Injected by `renderBlock` for placed blocks; **written by hand** for manually mapped children.                                                                                                   |
| `data-id`                           | each **item** root  | The item's own **kebab component path** (`.astro` PascalCase collapsed to kebab, same format as `_component`), e.g. `.../accordion/accordion-item`. `renderBlock` sets it to `block._component`. |

**MUST NOT:** put `data-editable="array-item"` on the array container, or `data-editable="array"` on an item — the editor needs the container/item split to CRUD rows.

For mixed-type arrays (items of different components in one list), the container also needs `data-component-key` — this is rare in the starter because `renderBlock` resolves by `_component`. See [patterns.md](patterns.md#mixed-type-arrays) and the [complex-array attributes in the reference](../references/editable-regions-api.md#complex-array-attributes-wrapper-vs-item).

## Debugging a binding that does not update

Follow the [debug-cloudcannon playbook](../debug-cloudcannon/SKILL.md) for the full pipeline. Binding-specific first checks:

| Symptom                                      | Likely cause                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Element not editable at all                  | No `data-prop` and `useDefaultEditableBinding` is false — nothing bound.                             |
| Edit does nothing / writes nowhere           | `data-prop` value does not match a real frontmatter key (typo, wrong case — it is camelCase).        |
| Image edits src but not alt (or vice versa)  | Only one of `data-prop-src` / `data-prop-alt` passed; the other fell back to a wrong default.        |
| Whole item vanishes from the array editor    | `data-editable` or `display: contents` on the component root, colliding with the array-item region.  |
| Item edits but reorder/add/remove misbehaves | Missing or wrong `data-id` on the mapped child, or `data-editable="array"` and `array-item` swapped. |

## Verify your work

| Command                       | What to look for                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`               | Exit 0 — no lint/type errors, no skills drift.                                                                                          |
| `npm run dev` + Visual Editor | The element is selectable; editing it live-updates the field; array items add/remove/reorder; no "Component not found" console warning. |
