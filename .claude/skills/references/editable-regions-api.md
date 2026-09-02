<!--
Vendored from CloudCannon/agent-skills @ b70076b102b0f1e20d05c4e3328d822f2298e115
Upstream paths:
  - skills/cloudcannon-visual-editing/editable-regions.md
  - skills/cloudcannon-visual-editing/editable-regions-internals.md
Adapted for this starter (astro-component-starter) — resync by diffing against upstream.
"In this starter:" callouts mark where generic CloudCannon guidance is overridden here.
See .agents/skills/STYLE.md § "This starter overrides generic CloudCannon docs".
-->

# Editable Regions — Generic API Reference

Generic reference for `@cloudcannon/editable-regions` — the client-side system that makes DOM elements interactive inside CloudCannon's Visual Editor. This file is the vendored, SSG-agnostic API. For how **this repo** wires bindings (which building blocks translate which attributes), see the `editable-regions` skill — it owns the starter-specific tables and links here for the underlying API.

> **In this starter:** Page sections almost never write `data-editable` directly. Building blocks (`Heading`, `Text`, `Image`, `Grid`, `ButtonGroup`, …) accept higher-level props — `data-prop`, `data-children-prop`, `data-prop-src`/`data-prop-alt` — and translate them to the raw `data-editable="…"` attributes documented below. `data-children-prop="items"` becomes `data-editable="array" data-prop="items"` on the rendered element. Read the raw attributes here to understand behaviour; write the building-block props in practice. The `editable-regions` skill owns that translation table.

## Region Types

### Primitive vs component regions

| Kind          | Types                                            | Behaviour                                                                                                         | Use when                                                                                                                    |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Primitive** | `text`, `image`, `array`, `array-item`, `source` | Updates its own slice of the live DOM directly. No registered renderer needed.                                    | Inline on-canvas editing of a single value or list.                                                                         |
| **Component** | `component`, `snippet` (extends component)       | Re-renders from structured data so the whole template slice stays in sync — text, images, styles, derived markup. | The section has conditional elements, style/class bindings, or computed content. Nest primitives inside for inline editing. |

**Precedence:** a primitive that binds a `data-prop` to a subtree wins for that subtree's live value — updates follow frontmatter through the region and override any component-level transform. With no primitive on that markup, the component re-render owns value derivation. Typical split: an `array` region for CRUD plus nested `text`/`image` primitives on the fields you want on-canvas.

### EditableText

On-canvas text editor (ProseMirror-based). The `data-type` attribute selects the editing mode:

- `data-type="span"` — plain text, no formatting toolbar
- `data-type="text"` — paragraph-level rich text (bold, links, superscript)
- `data-type="block"` — multi-paragraph rich text (lists, quote blocks, headings)

When `data-type` is omitted, CloudCannon defaults to `block`/`text` for Source Editable Regions, `data-prop="@content"`, or Rich Text Inputs, and `span` for everything else.

### EditableImage

Image editing via CloudCannon's data panel. The region **host** is either (1) an `<img>` with `data-editable="image"` and path attributes on that same element, or (2) a non-`img` host (`<div data-editable="image">`, layout wrapper, etc.) that contains a descendant `<img>`. The resolved `<img>` is what gets live `src` / `alt` / `title` updates — each facet can be bound independently via `data-prop-src`, `data-prop-alt`, `data-prop-title`, or together via `data-prop` (for object image fields).

> **In this starter:** the `<editable-image>` custom-element host is **banned** (see the web-components callout below). Use a plain HTML element (`<img data-editable="image">` or a `<div data-editable="image">` wrapper). The `Image` building block already emits the right attributes from `data-prop-src` / `data-prop-alt`.

### EditableComponent

Re-renders a component when its data changes so the rendered slice updates holistically from that data. Requires a renderer registered through your SSG's `@cloudcannon/editable-regions` integration. Diffs new HTML into the live DOM rather than replacing wholesale, preserving focused editors and live state.

> **In this starter:** the Astro integration is `registerAstroComponent(key, Component)`. The registered `key` is the component's kebab-case directory path (e.g. `navigation/footer`), which is also the `_component` discriminator value — **not** `_type`. See the `create-component` skill for where registration lives.

### EditableArray & EditableArrayItem

On the page, manages ordered lists with full CRUD (add, remove, reorder) and drag-and-drop. Array items on their own don't re-render contents — adding `data-component` to an array item element enables component re-rendering alongside the CRUD controls. For complex arrays, the array wrapper needs `data-component-key` and optionally `data-id-key` to declare which data fields identify each item's type and stable identity (see [Complex array attributes](#complex-array-attributes-wrapper-vs-item)).

> **In this starter:** the array wrapper (`data-editable="array"`) is owned by the **caller's container element**. `renderBlock.astro` stamps each rendered block with `data-editable="array-item"` and `data-id={block._component}` — it never adds the `array` wrapper itself. The `data-component-key` is `_component`. Confirm in `src/components/utils/renderBlock.astro` and `src/components/utils/MainComponent.astro` (which carries `data-editable="array" data-prop="pageSections"` — the frontmatter key, not its own `sections` prop).

### EditableSource

Edits raw HTML source files rather than frontmatter. Uses `data-path` (file path) and `data-key` (unique identifier) instead of `data-prop`. Reads/writes the full source file via the CloudCannon file API.

### EditableSnippet

Extends `EditableComponent` for editing snippets within rich text content. Manages its own data locally and dispatches `snippet-change` events.

---

## When to Use a Component Editable Region

Primitive editables update their own DOM slice but can't re-render the surrounding template. Wrap a section in a component when it has any of the signals below — without a component region, data-driven changes to conditional or computed markup don't reflect live.

| Signal                   | Example                                                      |
| ------------------------ | ------------------------------------------------------------ |
| Conditional elements     | A button that appears/disappears based on a boolean          |
| Style or class bindings  | Alternating background colours, layout order driven by index |
| Computed/derived content | A badge or label that changes based on another field         |

**When in doubt, prefer a component.** Cost: one registration call + a wrapper element. Benefit: every data-driven change live-updates.

---

## Quick Attribute Reference

| Attribute                 | Values                                                        | Purpose                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-editable`           | `text`, `image`, `array`, `array-item`, `component`, `source` | Declares the region type                                                                                                                                                                                                         |
| `data-prop`               | Path string                                                   | Data path for the editable value. `@content` is the reserved token for the file's markdown body — frontmatter is reached via normal field paths, so the body has no path other than `@content`                                   |
| `data-prop-*`             | Path string                                                   | Per-attribute binding: the suffix after `data-prop-` names the attribute/logical field being edited; path rules match `data-prop`. On **image** regions the usual cases are `data-prop-src`, `data-prop-alt`, `data-prop-title`. |
| `data-type`               | `span`, `text`, `block`                                       | Text editor mode. `span` = plain (no toolbar); `text` = paragraph rich text; `block` = multi-paragraph rich text. Omitted → `block`/`text` for Source regions, `@content`, Rich Text Inputs; `span` otherwise                    |
| `data-component`          | Component key                                                 | Component identifier for re-rendering lookup                                                                                                                                                                                     |
| `data-id-key`             | Key name                                                      | On the **array wrapper**: which data field uniquely identifies each item. Defaults to `data-component-key` value when omitted (Dec 2025)                                                                                         |
| `data-component-key`      | Key name                                                      | On the **array wrapper**: which data field identifies the component type for each item                                                                                                                                           |
| `data-id`                 | ID value                                                      | On each **array item**: the resolved identity value for this specific item. Defaults to `data-component` when omitted                                                                                                            |
| `data-path`               | File path                                                     | Source file path (for `EditableSource`)                                                                                                                                                                                          |
| `data-key`                | Unique key                                                    | Identifier within a source file                                                                                                                                                                                                  |
| `data-defer-mount`        | _(presence)_                                                  | Lazy initialization — editor mounts on first click                                                                                                                                                                               |
| `data-cloudcannon-ignore` | _(presence)_                                                  | Exclude element from scanning                                                                                                                                                                                                    |

**Use `data-prop-*`** when the main `data-prop` value would be the wrong shape (string path for `src` while `alt` lives in another field) or when only one facet of a composite value should be wired to data.
**Use `data-prop`** when the stored value is already one object the editor understands.

> **In this starter:** paths use **camelCase** field names matching the component's `.astro` destructure (`data-prop="logoSource"`, not `data-prop="logo_source"`). And you rarely write these attributes directly — building blocks take `data-children-prop` (→ `array`), `data-prop` (→ `text`), and `data-prop-src`/`data-prop-alt` (→ `image`). The `editable-regions` skill owns that mapping table.

### Complex array attributes (wrapper vs item)

These attributes wire **complex** arrays (e.g. page builders) so the Visual Editor can add, reorder, and re-render rows.

- **`data-component-key`** (on the **array wrapper**): Name of the field **in each array item's data object** whose value selects **which client-rendered component** handles that row. The editor uses it when the array is empty or when inserting a new row.
- **`data-id-key`** (on the **array wrapper**): Name of the field used as a **stable identity** for matching DOM nodes to data items across reorder/add/remove. Often the same field as `data-component-key`; when omitted, defaults to the same value (Dec 2025).
- **`data-component`** (on each **array item**): The **resolved** component key for that row. Must match the string registered for that renderer in your SSG's editable-regions setup.
- **`data-id`** (on each **array item**): The **resolved** stable id for that row, taken from the field named by `data-id-key`. When omitted, defaults to `data-component` (Dec 2025).

CloudCannon uses **`data-id` / `data-id-key`**, not a separate `data-component-id` attribute.

> **In this starter:** `data-component-key` is **`_component`** (see `.cloudcannon/structures/*.cloudcannon.structures.yml`, many of which set `id_key: _component`). The resolved `data-id` on each row is stamped by `renderBlock.astro` as `data-id={block._component}`. Upstream examples using `_type` → map to `_component` here.

### Custom Element Equivalents — BANNED in this starter

Upstream documents custom-element hosts as equivalent to `data-editable` attributes:

| Custom Element          | Equivalent                         |
| ----------------------- | ---------------------------------- |
| `<editable-text>`       | `<span data-editable="text">`      |
| `<editable-image>`      | `<div data-editable="image">`      |
| `<editable-component>`  | `<div data-editable="component">`  |
| `<editable-array-item>` | `<div data-editable="array-item">` |
| `<editable-source>`     | `<div data-editable="source">`     |

> **In this starter:** these custom elements are **banned**. Upstream prefers them for wrapper-only hosts; this repo does not. Always use standard HTML elements with `data-*` attributes. The `editable-regions` skill states this explicitly. Reason: consistency with the building-block abstraction and avoiding custom-element hydration edge cases in the Astro build.

---

## Internals & JavaScript API

**Only reach for this section when debugging unexpected Visual Editor behaviour.** The region types and attribute reference above cover normal wiring.

### Lifecycle Trace: A Text Editable Region

Trace a single text editable from HTML to live editing.

**1. HTML**

```html
<p data-editable="text" data-prop="title">Welcome to my site</p>
```

**2. Hydration** — the integration runs `hydrateDataEditableRegions(document.body)` and sets up a `MutationObserver` to catch future DOM changes. The hydration function finds `[data-editable]` elements, maps the type string to a class, and calls `.connect()`. (Custom elements would hydrate via `connectedCallback()` — but those are banned here.)

**3. Connection** — `connect()` waits for the CloudCannon API via `apiLoadedPromise`, then calls `setupListeners()`: walks up the DOM to find a parent editable, parses `data-prop="title"` against `CloudCannon.currentFile()`, binds the file object's `change`/`delete` events, and listens for `cloudcannon-api` CustomEvents on the element.

**4. Mounting** — when initial data arrives, `pushValue()` resolves the path against the file's frontmatter and calls `mount()`. `EditableText.mount()` creates a ProseMirror editor via `CloudCannon.createTextEditableRegion()`.

**5. Data Down (CloudCannon → Page)**

```
CloudCannon API fires "change" → pushValue() → EditableText.update() → editor.setContent(newValue)
```

`shouldUpdate()` checks the editor isn't focused (avoid clobbering typing) and the value actually changed.

**6. Data Up (Page → CloudCannon)**

User types → `onChange` → `dispatchSet()` → bubbling `cloudcannon-api` CustomEvent → `executeApiCall()` → `file.data.set({ slug: "title", value })`.

### Core Internals

- **Hydration engine** — two mechanisms: data-attribute scanning (`helpers/hydrate-editable-regions.ts`) and Web Components. Both share a `MutationObserver` watching the whole document. Custom types register via `addCustomEditableRegion()`.
- **Editable base class** (`nodes/editable.ts`) — lifecycle (`connect`, `disconnect`, `mount`, `update`), path parsing (`parseSource` for `@collections`, `@file`, `@data` prefixes), value resolution (`lookupPathAndContext`), API dispatch (`executeApiCall`), event handling (`handleApiEvent`).
- **Bubbling event bus** — mutations flow upward via `cloudcannon-api` CustomEvents (`bubbles: true`); each parent editable prepends its path segment, so deeply nested editables never need their full path.
- **Parent-child listener tree** — editables mirror the DOM tree; children register on their nearest parent editable. If the parent hasn't hydrated, listeners queue in `__pendingEditableListeners` and replay on connect.

### CloudCannon JavaScript API

**Detecting the Visual Editor** ([docs](https://cloudcannon.com/documentation/developer-articles/detecting-your-site-is-loaded-in-the-visual-editor/)):

| Mechanism                        | Context           | Use for                                                                           |
| -------------------------------- | ----------------- | --------------------------------------------------------------------------------- |
| `.cms-editor-active` on `<body>` | CSS               | Overriding styles (animations, visibility). Most reliable for initial page load   |
| `window.inEditorMode`            | Runtime JS        | Inline `<script>` logic, conditional imports                                      |
| `import.meta.env.ENV_CLIENT`     | Build-time (Vite) | Astro component template expressions (only in the editable-regions client bundle) |

**Connecting**

```javascript
document.addEventListener('cloudcannon:load', () => {
  const api = window.CloudCannonAPI.useVersion('v1', true);
});
```

**Core methods**

| Method                             | Returns           | Description                                   |
| ---------------------------------- | ----------------- | --------------------------------------------- |
| `currentFile()`                    | `File`            | Handle for the page currently being edited    |
| `file(path)`                       | `File`            | Handle for a specific file by path            |
| `collection(key)`                  | `Collection`      | Handle for a collection                       |
| `dataset(key)`                     | `Dataset`         | Handle for a dataset defined in `data_config` |
| `getPreviewUrl(url, inputConfig?)` | `string`          | Resolve a preview URL for DAM/asset files     |
| `uploadFile(file, inputConfig?)`   | `Promise<string>` | Upload a file, returns the URL                |
| `findStructure(structure, value)`  | `any`             | Look up a structure value                     |

**File interface**

```typescript
interface File {
  data: {
    get(opts?: { slug?: string }): Promise<any>;
    set(opts: { slug: string; value: any }): Promise<any>;
    edit(opts: { slug: string }): void;
    addArrayItem(opts: { slug: string; item?: any }): Promise<any>;
    removeArrayItem(opts: { slug: string; index: number }): Promise<any>;
    moveArrayItem(opts: { slug: string; from: number; to: number }): Promise<any>;
  };
  content: {
    get(): Promise<string>;
    set(value: string): Promise<void>;
  };
  getInputConfig(opts: { slug: string }): any;
  addEventListener(event: 'change' | 'delete', listener: () => void): void;
}
```

Slug paths use `.` as the separator: `"hero.title"` for `{ hero: { title: "X" } }`.

**Dataset / Collection**

```typescript
interface Dataset {
  items(): Promise<File | File[]>;
  addEventListener(event: 'change' | 'delete', listener: () => void): void;
}
interface Collection {
  items(): Promise<File[]>;
  addEventListener(event: 'change' | 'delete', listener: () => void): void;
}
```

`dataset.items()` can return a single `File` or `File[]` — always handle both.

**Editor creation**

- **`createTextEditableRegion`** — inline ProseMirror editor. No `destroy()` method; use a generation counter for stale closures. Editor starts empty (call `setContent` after creation). `setContent` resets cursor — skip on focused editors.
- **`createCustomDataPanel`** — floating data panel with custom input fields (used by `EditableImage`).

### Known Quirks

**Text editor**

| Quirk                                                            | Mitigation                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| No `destroy()` — old instances fire `onChange` after DOM removal | Use a generation counter; stale closures check and no-op |
| `onChange` fires on init (ProseMirror normalizes on mount)       | Guard with a `setupComplete` flag                        |
| Editor starts empty — does not read `innerHTML`                  | Call `setContent(value)` immediately after creation      |
| `setContent` resets cursor position                              | Track focus state; skip on focused editors               |

**Data API**

| Quirk                                | Detail                                             |
| ------------------------------------ | -------------------------------------------------- |
| Slug separator is `.` not `/`        | `"hero.title"` for `{ hero: { title: "X" } }`      |
| `dataset.items()` return type varies | Can return `File` or `File[]` — always handle both |
| `change` events are coarse           | Doesn't say which key changed — re-read all keys   |
| `change` fires for own writes        | Guard against echo loops                           |

**DOM and content**

| Quirk                             | Detail                                                           |
| --------------------------------- | ---------------------------------------------------------------- |
| Values often contain HTML         | Use `innerHTML` not `textContent`                                |
| `<editable-text>` replacement tag | Replace with `<span>` (inline) or `<div>` (block) when stripping |
| MutationObserver timing           | Process cloned DOM trees while detached                          |

**Events**

| Event                              | Fired On                  | When                                |
| ---------------------------------- | ------------------------- | ----------------------------------- |
| `cloudcannon:load`                 | `document`                | CloudCannon API is ready            |
| `change`                           | File, Collection, Dataset | Data changed (including own writes) |
| `delete`                           | File, Collection, Dataset | Data deleted                        |
| `cloudcannon-api`                  | DOM elements (bubbles)    | Internal editable regions event bus |
| `editable:focus` / `editable:blur` | DOM elements (bubbles)    | Focus state changes                 |

**Global state**

| Global                  | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `window.inEditorMode`   | `true` when inside the Visual Editor iframe |
| `window.CloudCannonAPI` | API router — call `.useVersion("v1", true)` |
| `window.cc_components`  | Component renderer registry                 |
| `window.cc_snippets`    | Snippet renderer registry                   |

> **In this starter:** interactive components must work in the editor, where inline `<script>`s don't run. Put setup logic in an importable module and register it in `editor-live-sync.js` (see `carousel/setup.ts`). Path resolution is duplicated between `renderBlock.astro` and `live-editing.js` — change both or components vanish from the editor. See CLAUDE.md.
