# Editable-region patterns (advanced)

Less-common bindings. For the core recipe (text / image / array), stay in [SKILL.md](SKILL.md).

## Multi-field text blocks (Testimonial)

Some blocks bind several text fields at once. `Testimonial` exposes three text bindings plus an image, each as a **starter prop** that translates to its own `data-editable="text"` inner node:

| Prop you pass                  | Default when `useDefaultEditableBinding` | Emits (on its inner element)           |
| ------------------------------ | ---------------------------------------- | -------------------------------------- |
| `data-prop`                    | `text`                                   | `data-editable="text" data-prop="…"`   |
| `data-prop-author-name`        | `authorName`                             | `data-editable="text" data-prop="…"`   |
| `data-prop-author-description` | `authorDescription`                      | `data-editable="text" data-prop="…"`   |
| (internal) author image        | `authorImage` (src) / `authorName` (alt) | `data-editable="image"` on the `<img>` |

**MUST NOT:** read `data-prop-author-name` as a raw CloudCannon per-facet attribute (the way `data-prop-src`/`-alt` work on an image).
**Why:** in this starter it is a **component prop** the block funnels into a plain `data-prop` on a separate node. Each author field ends up as its own single-value `text` region — there is no `author-name` DOM attribute in the output. The generic `data-prop-*` per-facet mechanism (reference) applies to image src/alt/title, not to these.

## Card before / after content slots

`Card` renders three independent `renderBlock` arrays, each its own array region:

| Prop                        | Default prop name       |
| --------------------------- | ----------------------- |
| `data-children-prop`        | `contentSections`       |
| `data-children-prop-before` | `beforeContentSections` |
| `data-children-prop-after`  | `afterContentSections`  |

Each maps to `data-editable="array" data-prop="<name>"` on its own wrapper (`.before-content`, `.card-content`, `.after-content`). Use the before/after arrays for content that sits outside the padded card body (e.g. a full-bleed image above the text).

## Markdown body (`@content`)

To make a file's Markdown body editable (blog posts, MDX pages), wrap the rendered content and bind the reserved `@content` path directly — this is one of the few places you write `data-editable` by hand, because there is no building block for it:

```astro
<div class="post" data-editable="text" data-prop="@content">
  <Content components={mdxComponents} />
</div>
```

`@content` targets the file's body, not a frontmatter key. Model: `src/pages/blog/[...slug].astro`. See `data-type` / rich-text modes in the [reference](../references/editable-regions-api.md#editabletext).

## Page-level component region (layout only)

`src/layouts/Page.astro` wraps the whole page-sections array in a **component** region so the editor re-renders section chrome on data change:

```astro
<div
  data-editable="component"
  data-component="utils/main-component"
  data-prop-sections="pageSections"
>
  <MainComponent sections={sections} />
</div>
```

`MainComponent.astro` in turn carries the `data-editable="array" data-prop="sections" data-component-key="_component"` container that `renderBlock` fills. This is wired once at the layout level — **page-section and building-block authors do not create component regions.** Component registration lives in `live-editing.js` (globbed `registerAstroComponent` calls). See [EditableComponent in the reference](../references/editable-regions-api.md#editablecomponent).

## Mixed-type arrays

When one array holds items of **different** component types, the container declares which data field selects the renderer:

- `data-component-key="_component"` on the array container — the field naming each item's component.
- `data-id` on each item — its resolved identity (kebab component path).

In this starter `renderBlock` already resolves items by `_component`, so you rarely wire this by hand; `MainComponent.astro` is the one place it appears (`data-component-key="_component"`). Full attribute semantics: [complex-array attributes in the reference](../references/editable-regions-api.md#complex-array-attributes-wrapper-vs-item).
