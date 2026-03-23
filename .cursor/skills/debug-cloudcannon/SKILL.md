---
name: debug-cloudcannon
description: Troubleshoot CloudCannon visual editing issues in this Astro component library. Use when components don't appear in the picker, editable regions don't work, the visual editor doesn't update, or renderBlock can't find a component.
---

# Debugging CloudCannon Visual Editing

Troubleshooting guide for common issues with CloudCannon visual editing in this component library.

## How the rendering pipeline works

Understanding the pipeline helps diagnose where things break.

```
Page frontmatter (pageSections array)
  → Page.astro wraps in component editable region
    → MainComponent.astro (array editable container)
      → renderBlock.astro (resolves _component → Astro component)
        → Component renders with data-editable attributes
```

### renderBlock component resolution

`renderBlock.astro` builds a component registry at build time using `import.meta.glob("../**/*.{jsx,astro}", { eager: true })`. This glob runs relative to `src/components/utils/`, so it captures everything under `src/components/`.

For each file, it:

1. Strips the `../` prefix and file extension
2. Splits the path into segments
3. Converts the filename from PascalCase to kebab-case using `pascalToKebab`
4. If the kebab filename matches its parent directory name, drops the duplicate (e.g., `hero-center/HeroCenter.astro` becomes `hero-center`)
5. Joins segments to create the registry key

The `_component` value in YAML must exactly match the resulting registry key.

**Examples:**

| File path                                           | Registry key                              |
| --------------------------------------------------- | ----------------------------------------- |
| `page-sections/heroes/hero-center/HeroCenter.astro` | `page-sections/heroes/hero-center`        |
| `building-blocks/core-elements/button/Button.astro` | `building-blocks/core-elements/button`    |
| `building-blocks/wrappers/grid/GridItem.astro`      | `building-blocks/wrappers/grid/grid-item` |
| `navigation/footer/Footer.astro`                    | `navigation/footer`                       |

### Component editable region (Page.astro)

`Page.astro` wraps `MainComponent` in a component editable region:

```astro
<div
  data-editable="component"
  data-component="utils/main-component"
  data-prop-sections="pageSections"
>
  <MainComponent sections={sections} />
</div>
```

This tells CloudCannon: "this div renders the `main-component` component, and its `sections` prop maps to the `pageSections` frontmatter key."

### MainComponent.astro

Adds the array-level editable attributes:

```astro
<div data-pagefind-body data-editable="array" data-prop="sections" data-component-key="_component">
  <Components contentSections={sections} />
</div>
```

### renderBlock.astro per-item attributes

When `useDefaultEditableBinding` is `true` (default), renderBlock stamps each rendered block:

```astro
<Component
  data-editable="array-item"
  data-id={block._component}
  {...block}
  useDefaultEditableBinding={true}
/>
```

---

## Issue: Component not found

**Symptom:** Console warning `Component not found: {path}. Available components: [...]`

### Causes and fixes

**1. `_component` path doesn't match the registry key**

The `_component` value in YAML must match the key that `renderBlock` generates. Common mistakes:

| Wrong                                  | Correct                                | Why                              |
| -------------------------------------- | -------------------------------------- | -------------------------------- |
| `heroes/hero-center`                   | `page-sections/heroes/hero-center`     | Missing category prefix          |
| `page-sections/heroes/HeroCenter`      | `page-sections/heroes/hero-center`     | PascalCase instead of kebab-case |
| `building-blocks/core-elements/Button` | `building-blocks/core-elements/button` | PascalCase instead of kebab-case |
| `page-sections/hero-center`            | `page-sections/heroes/hero-center`     | Missing subcategory              |

**Fix:** Check the console warning — it logs all available component keys. Find the correct key in that list.

**2. Component file not in `src/components/` tree**

`renderBlock`'s glob only captures files under `src/components/`. Files outside that directory aren't registered.

**Fix:** Move the component file under the appropriate `src/components/` subdirectory.

**3. PascalCase filename doesn't match directory name**

The deduplication logic expects the kebab version of the filename to match the parent directory name. If they don't match, the registry key includes both:

| Structure                      | Key                                          |
| ------------------------------ | -------------------------------------------- |
| `hero-center/HeroCenter.astro` | `hero-center` (deduplicated)                 |
| `hero-center/HeroBanner.astro` | `hero-center/hero-banner` (not deduplicated) |

**Fix:** Rename the component file to match its directory (e.g., `HeroCenter.astro` in `hero-center/`).

---

## Issue: Editable region not working

**Symptom:** Clicking an element in the CloudCannon visual editor doesn't open an editor, or changes in the sidebar don't update the preview.

### Causes and fixes

**1. Missing `data-prop` or `data-children-prop`**

Text and image elements need editable bindings to be clickable. Without them, CloudCannon can't map the DOM element to a data field.

**Fix:** Add the appropriate binding on the building block:

```astro
<!-- Text fields -->
<Heading data-prop="heading" text={heading} />
<Text data-prop="subtext" text={subtext} />

<!-- Image fields -->
<Image data-prop-src="imageSource" data-prop-alt="imageAlt" source={imageSource} alt={imageAlt} />

<!-- Array fields -->
<Grid data-children-prop="items">
  {
    items.map((item) => (
      <ItemComponent data-editable="array-item" data-id="path/to/child" {...item} />
    ))
  }
</Grid>
```

See the [editable-regions skill](../editable-regions/SKILL.md) for the full reference.

**2. `data-prop` value doesn't match frontmatter key**

The `data-prop` value must exactly match the prop name that maps to a frontmatter key.

| Wrong                                            | Correct                                      | Why                                         |
| ------------------------------------------------ | -------------------------------------------- | ------------------------------------------- |
| `data-prop="title"`                              | `data-prop="heading"`                        | Prop is named `heading` in the component    |
| `data-prop="image"`                              | `data-prop-src="imageSource"`                | Images use `data-prop-src` not `data-prop`  |
| `data-children-prop="features"` on wrong element | On the wrapper (`Grid`, `ButtonGroup`, etc.) | Must be on the element that holds the array |

**3. `useDefaultEditableBinding` not propagating**

`renderBlock` sets `useDefaultEditableBinding={true}` by default, which makes all child building blocks bind to their default prop names automatically. If you render components manually (not through `renderBlock`), you need to either:

- Pass `useDefaultEditableBinding={true}` explicitly, or
- Pass explicit `data-prop` / `data-children-prop` on each building block

**4. `display: contents` on root element**

Using `display: contents` on a component's root element breaks `data-editable="array-item"` because CloudCannon needs a real DOM box to attach the editable region.

**Fix:** Use a different layout approach. Use `display: flex` or `display: grid` instead.

**5. Duplicate `data-editable` attributes**

A component's root element should **never** have `data-editable` set directly — `renderBlock` injects `data-editable="array-item"` on the root via `htmlAttributes`. If the component also sets it, they conflict.

**Fix:** Remove `data-editable` from the component's root element. Only set it on inner elements for text/image/array bindings.

**6. `data-editable` on wrong element**

For text bindings, `data-editable="text"` must be on the element that **contains the text**, not a parent wrapper. Building blocks handle this internally — they put the attribute on the inner text span, not the outer container.

---

## Issue: Component not in CloudCannon picker

**Symptom:** When adding a new section in CloudCannon, the component doesn't appear in the structure picker.

### Causes and fixes

**1. Missing or mismatched structure-value file**

Every component needs a `{slug}.cloudcannon.structure-value.yml` file. The `_component` value in this file must match the renderBlock registry key.

**Fix:** Verify the structure-value file exists and `_component` matches.

**2. Structure file doesn't include the component's glob**

Components appear in pickers based on which structure files reference them. Structure files are in `.cloudcannon/structures/`.

| Structure file            | What it controls                                                  |
| ------------------------- | ----------------------------------------------------------------- |
| `pageSections`            | Top-level page sections (glob: all page-section structure-values) |
| `containerSections`       | Content inside custom sections                                    |
| `splitSections`           | Content inside split layouts                                      |
| `gridItemSections`        | Content inside grid items                                         |
| `cardSections`            | Content inside cards                                              |
| `accordionSections`       | Content inside accordion items                                    |
| `modalSections`           | Content inside modals                                             |
| `carouselSections`        | Content inside carousels                                          |
| `contentSelectorSections` | Content inside content selector panels                            |
| `bentoBoxSections`        | Content inside bento box items                                    |
| `buttonSections`          | Buttons only                                                      |
| `formBlocks`              | Form field components                                             |

**Page sections** are auto-included via glob:

```yaml
pageSections:
  values_from_glob:
    - /src/components/page-sections/**/*.cloudcannon.structure-value.yml
```

**Wrappers** must be manually added to each relevant structure file. Check if the component's structure-value path is listed in the appropriate `values_from_glob` array.

**Core elements** are included via glob in most structure files:

```yaml
- /src/components/building-blocks/core-elements/**/*.cloudcannon.structure-value.yml
```

**Fix:** Add the component's structure-value file path to the relevant structure file(s) in `.cloudcannon/structures/`.

**3. YAML syntax error**

A syntax error in the structure-value or inputs file silently prevents the component from loading.

**Fix:** Validate the YAML syntax. Common issues:

- Missing quotes around strings with special characters
- Incorrect indentation
- Missing required fields (`label`, `value`, `_component`)

**4. `_inputs_from_glob` path is wrong**

The structure-value file references its inputs file via `_inputs_from_glob`. If this path is wrong, the component loads without field definitions.

```yaml
_inputs_from_glob:
  - /src/components/page-sections/heroes/hero-center/hero-center.cloudcannon.inputs.yml
```

**Fix:** Verify the path matches the actual inputs file location. Paths are relative to the project root and start with `/`.

---

## Issue: Visual editor not updating

**Symptom:** The visual preview doesn't refresh when data changes in the sidebar editor.

### Causes and fixes

**1. Component editable region not wired in Page.astro**

The component editable region in `Page.astro` must correctly reference the component and map props:

```astro
<div
  data-editable="component"
  data-component="utils/main-component"
  data-prop-sections="pageSections"
>
</div>
```

If `data-prop-sections` doesn't match the frontmatter key name, CloudCannon can't push updates.

**2. `@cloudcannon/editable-regions` integration missing**

The `editableRegions()` integration must be in `astro.config.mjs`:

```js
import editableRegions from '@cloudcannon/editable-regions/astro-integration';

export default defineConfig({
  integrations: [
    editableRegions(),
    // ...
  ],
});
```

**Fix:** Verify the integration is imported and listed in the integrations array.

**3. Live editing scripts not loading**

`BaseLayout.astro` conditionally loads live editing scripts:

```astro
<script>
  if (window.inEditorMode) {
    import('../../live-editing');
    import('../../editor-live-sync');
  }
</script>
```

If these files are missing or broken, the visual editor won't reflect changes in real-time.

---

## Issue: Snippets not appearing in MDX editor

**Symptom:** When editing blog posts in CloudCannon's content editor, the snippet picker doesn't show expected components.

### Causes and fixes

**1. Missing snippet file**

The component needs a `{slug}.cloudcannon.snippets.yml` file. See the [blog-mdx-content skill](../blog-mdx-content/SKILL.md) for the snippet file format.

**2. Snippet glob not matching**

`cloudcannon.config.yml` loads snippets via:

```yaml
_snippets_from_glob:
  - /**/*.cloudcannon.snippets.yml
```

Verify the snippet file matches this glob pattern and is in the correct location.

**3. MDX imports not enabled**

Snippets require MDX imports to be enabled:

```yaml
_snippets_imports:
  mdx: true
```

This should already be in `cloudcannon.config.yml`.

**4. `component_name` doesn't match filename**

The `definitions.component_name` in the snippet must match the PascalCase filename exactly (what `import.meta.glob` registers). If `CtaCenter.astro` is the file, `component_name` must be `CtaCenter`.

---

## Diagnostic checklist

When debugging any CloudCannon issue, work through this checklist:

1. **Check the browser console** — `renderBlock` logs warnings for unresolved components
2. **Verify `_component` paths** — compare YAML values against the console's available components list
3. **Check file locations** — component files must be under `src/components/`
4. **Verify naming conventions** — PascalCase filename must kebab-match directory name
5. **Check structure-value files** — `_component` must match renderBlock key, `_inputs_from_glob` path must be correct
6. **Check structure registration** — component's structure-value must be in the right `.cloudcannon/structures/` file
7. **Check editable bindings** — `data-prop`, `data-children-prop`, `data-prop-src`/`data-prop-alt` on the correct elements
8. **Check for YAML errors** — validate syntax in all `.cloudcannon.*.yml` files
9. **Rebuild** — some changes require a full rebuild (`npm run build`) or dev server restart
10. **Check CloudCannon build logs** — structure/snippet errors often surface there

### Quick component key lookup

To see all registered component keys, temporarily add this to `renderBlock.astro`:

```js
console.log('Registered components:', Object.keys(components));
```

Or check the console when a component fails to resolve — the warning already lists all available keys.
