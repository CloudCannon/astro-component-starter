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

## Page-level array region (layout only)

`src/layouts/Page.astro` wraps `<MainComponent sections={sections} />` in a component region (`data-editable="component" data-component="utils/main-component" data-prop-sections="pageSections"`), and `MainComponent.astro` carries the array region inside it:

```astro
<div data-editable="array" data-prop="sections" data-component-key="_component">
  <Components contentSections={sections} />
</div>
```

**MUST:** keep `data-prop="sections"` — the component's own prop, not the frontmatter key.
**Why:** paths inside a component region resolve against that component's props; the shell's `data-prop-sections="pageSections"` maps `sections` back to the file. Writing `pageSections` here resolves to `undefined` and the editor replaces the whole page with an "expected an array" error card. `renderBlock` then stamps each row with `data-editable="array-item"`.

This is wired once at the layout level — **page-section and building-block authors never write it.** The component region is what re-renders an edit through Astro SSR, cascading `useDefaultEditableBinding` to every nested `renderBlock`; it must stay in the shell, not inside `MainComponent.astro`, or each re-render nests a second copy of it. Component registration for every component is globbed in `live-editing.js` (`registerAstroComponent`). See [EditableComponent in the reference](../references/editable-regions-api.md#editablecomponent) for when a component region is the right tool.

## Mixed-type arrays

When one array holds items of **different** component types, the container declares which data field selects the renderer:

- `data-component-key="_component"` on the array container — the field naming each item's component.
- `data-id` on each item — its resolved identity (kebab component path).

In this starter every array whose items come from `renderBlock` carries it: `MainComponent.astro` and each wrapper's content arrays (`contentSections`, a Split's columns, a Card's slots). Add it to any new one; without it an insert above an item reuses that item's root element. Full attribute semantics: [complex-array attributes in the reference](../references/editable-regions-api.md#complex-array-attributes-wrapper-vs-item).
