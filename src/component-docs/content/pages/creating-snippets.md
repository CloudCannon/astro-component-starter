---
title: Creating Snippets
description: >-
  How CloudCannon snippets let editors insert components inside MDX blog content, how the starter
  wires them up, and how to add a snippet to your own component.
contentSections: []
---

# Creating Snippets

Page sections are configured through structures - editors add them to a page's `pageSections` array. But blog posts aren't built from an array of sections; they're MDX documents where the content is the body text. **Snippets** are how CloudCannon lets editors drop components into that body text.

In the CloudCannon content — or visual — editor, an editor clicks the **add snippet** button in the toolbar — the small document icon — and picks a component from the snippet picker. A modal opens with inputs for configuring that instance of the snippet, and CloudCannon writes the MDX from what they enter. Click the component again later and the same modal reopens, populated from the MDX. Values in the file and values in the modal stay in sync in both directions.

## Structures vs snippets

Both describe a component to CloudCannon, and both usually reuse the same inputs file. The difference is where the component ends up:

|           | Structures                                              | Snippets                                             |
| --------- | ------------------------------------------------------- | ---------------------------------------------------- |
| File      | `{slug}.cloudcannon.structure-value.yml`                | `{slug}.cloudcannon.snippets.yml`                    |
| Used in   | Front matter arrays (`pageSections`, `contentSections`) | MDX body content (blog posts)                        |
| Editor UI | "Add Page Section" / "Add Content Section"              | The add snippet button in the content editor toolbar |
| Output    | YAML in front matter                                    | A JSX-style tag in the Markdown body                 |

A component can have both. Most page sections in this starter do - the same Feature Grid can be added to a landing page as a section, or dropped into the middle of a blog post as a snippet.

## How it works end to end

There are three pieces, and all three have to line up:

1. **The component is registered for MDX** in the blog route, so Astro knows what `<FeatureGrid />` means when it appears in a post.
2. **A snippet definition file** sits next to the component, describing how CloudCannon should read and write that tag.
3. **`cloudcannon.config.yml` picks up those files** via a glob.

### 1. Registering components for MDX

MDX doesn't know about your components unless you tell it. Rather than adding an `import` line to the top of every blog post, the blog post route imports every component once and hands them to Astro's `<Content />` component.

From `src/pages/blog/[...slug].astro`:

```ts
// Automatically import all components from building-blocks and page-sections for MDX
const buildingBlocksImports = import.meta.glob('../../components/building-blocks/**/*.astro', {
  eager: true,
});

const pageSectionsImports = import.meta.glob('../../components/page-sections/**/*.astro', {
  eager: true,
});

// Merge both import objects
const componentImports = { ...buildingBlocksImports, ...pageSectionsImports };

// Build components object with PascalCase names from file paths
const mdxComponents: Record<string, any> = {};

Object.entries(componentImports).forEach(([path, module]) => {
  const pathParts = path.split('/');
  const fileName = pathParts[pathParts.length - 1].replace('.astro', '');

  // Component name is already PascalCase from filename
  const componentName = fileName;

  mdxComponents[componentName] = (module as any).default;
});
```

The map is then passed to the rendered post:

```astro
<Content components={mdxComponents} />
```

This is Astro's native MDX `components` prop. It gets you the same result as the `astro-auto-import` integration without adding a dependency to the project.

Two consequences worth remembering:

- **The component's name in MDX is its PascalCase filename.** `FeatureGrid.astro` is `<FeatureGrid />`. Nothing else in the pipeline decides this, which is why the snippet definition has to use exactly the same name.
- **Every component under `building-blocks/` and `page-sections/` is available in MDX**, whether or not it has a snippet file. The snippet file only controls whether it shows up in CloudCannon's picker.

If you add MDX rendering to another route, copy this same block into it - otherwise components will render as literal text in that route.

### 2. Loading snippet definitions

`cloudcannon.config.yml` has two keys near the bottom:

```yaml
_snippets_imports:
  mdx: true
_snippets_from_glob:
  - /**/*.cloudcannon.snippets.yml
```

- `_snippets_imports.mdx` turns on CloudCannon's built-in MDX snippet definitions, so standard MDX syntax is understood by the editor.
- `_snippets_from_glob` picks up every custom snippet definition in the repo, wherever it lives. Nothing needs registering by hand - add a matching file next to a component and it appears in the picker on the next build.

### 3. The snippet definition file

Snippet files live in the component's own folder, named after the component's slug. A component folder with the full set looks like this:

```
src/components/building-blocks/core-elements/image/
├── Image.astro
├── image.cloudcannon.inputs.yml            # Field definitions (shared)
├── image.cloudcannon.snippets.yml          # Use in MDX body content
└── image.cloudcannon.structure-value.yml   # Use in front matter arrays
```

Here's `image.cloudcannon.snippets.yml` in full:

```yaml
image:
  template: mdx_component
  inline: false
  preview:
    view: gallery
    text:
      - Image
    subtext:
      - key: alt
    icon: image
    gallery:
      image:
        - key: source
  definitions:
    component_name: Image
    named_args:
      - editor_key: source
        type: string
      - editor_key: alt
        type: string
        optional: true
        remove_empty: true
      - editor_key: rounded
        type: boolean
        optional: true
      - editor_key: aspectRatio
        type: string
        optional: true
        remove_empty: true
      - editor_key: priority
        type: boolean
        optional: true
  _inputs_from_glob:
    - /src/components/building-blocks/core-elements/image/image.cloudcannon.inputs.yml
```

Which produces MDX like this when an editor inserts it:

```mdx
<Image source="/src/assets/images/banner.jpg" alt="A wide banner" rounded={true} />
```

## The fields

| Field                        | What it does                                                                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top-level key (`image`)      | The snippet's internal ID. Keep it unique across the project - camelCase of the component name is the convention here (`featureGrid`, `ctaCenter`).  |
| `template`                   | The snippet template. These components all use `mdx_component`.                                                                                      |
| `inline`                     | `false` means the component is a block, sitting on its own line between paragraphs. Every snippet in this starter is a block.                        |
| `preview`                    | How the snippet is displayed in the editor and picker - see below.                                                                                   |
| `definitions.component_name` | The MDX tag name. **Must exactly match the PascalCase `.astro` filename**, because that's what the glob in the blog route registers.                 |
| `definitions.named_args`     | The props, in the order they'll be written into the tag and displayed to the editor.                                                                 |
| `_inputs_from_glob`          | Points at the component's shared inputs file, so the snippet modal and the page-section sidebar use identical input definitions without duplication. |
| `_inputs`                    | Inline input definitions. Use for anything not covered by the shared inputs file.                                                                    |

`mdx_component` is one of several snippet templates CloudCannon supports; others cover different content syntaxes. It's the right one here because these are Astro components written into MDX, and it's what every example on this page uses. See [CloudCannon's snippet documentation](https://cloudcannon.com/documentation/developer-reference/configuration-file/types/snippet/) for the full list.

### named_args

Each entry maps one prop to one input in the modal:

```yaml
- editor_key: heading
  type: string
  optional: true
  remove_empty: true
```

| Key            | Notes                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `editor_key`   | The prop name. Must match the prop your `.astro` component destructures. Any configuration in the inputs file must also match. |
| `type`         | `string`, `boolean`, or `array`. Strings are written as `prop="value"`; booleans and arrays are written as `prop={...}`.       |
| `optional`     | The editor can leave it blank.                                                                                                 |
| `remove_empty` | Drop the prop from the MDX entirely when it's empty, instead of writing `prop=""`.                                             |

A prop that isn't listed in `named_args` is invisible to the snippet system.

### preview

`preview` controls the card an editor sees in the picker and in the document once inserted:

```yaml
preview:
  text:
    - Feature Grid # Literal text string for the main card text
  subtext:
    - key: heading # Use the value in the heading field for the card subtext
    - No heading supplied # A literal text string fallback for when the user has no entered a heading
  icon: apps # Material icon name
```

`text` and `subtext` take a list of fallbacks, tried in order. Entries can be a literal string, a `key:` referencing a prop value, or a `template:` string interpolating props — the Video snippet uses `template: Video - {type}` so the card reads "Video - youtube".

Add `view: gallery` with a `gallery.image` key to show a thumbnail, which is what the Image snippet does.

## Adding a snippet to your own component

Assuming you've already built the component and its inputs file (see [Building a Page Section](/component-docs/building-a-page-section/)):

1. Create `{slug}.cloudcannon.snippets.yml` in the component's folder.
2. Set `template: mdx_component` and `inline: false`.
3. Set `definitions.component_name` to the exact PascalCase filename.
4. Add a `named_args` entry for every prop an editor should control, in the order you want them written.
5. Point `_inputs_from_glob` at the component's existing inputs file so the modal's inputs match the page-section ones.
6. Add a `preview` block with a title, a `subtext` key, and an icon.

No registration step - the glob in `cloudcannon.config.yml` finds it. Push the branch and the snippet appears in the picker after CloudCannon rebuilds.

## What ships with the starter

Thirteen components have snippet definitions out of the box:

- **Building blocks**: Image, Video, Embed, Form
- **CTAs**: CTA Center, CTA Split, CTA Form
- **Features**: Feature Grid, Feature Split, Feature Slider
- **People**: Team Grid, Testimonial Section
- **Info blocks**: FAQ Section

These are the components that make sense mid-article. Heroes and navigation components generally don't belong inside a post.

To see snippets in a real document, open any post in [/blog/](/blog/) - for example [2025-10-15-why-we-built-our-component-starter](/blog/2025-10-15-why-we-built-our-component-starter), which uses a Testimonial Section and a CTA Center partway through the article.

## Hand-writing snippets in MDX

You don't have to use the picker. Writing the tag yourself works, and CloudCannon will pick it up as a snippet as long as the tag matches a definition. One constraint: **keep all props on a single line**. CloudCannon writes them that way, and the parser needs that shape to round-trip the tag back into the modal.

```mdx
<CtaCenter
  heading="Ready to build something better?"
  subtext="Start with a foundation that gets out of your way."
  colorScheme="dark"
  backgroundColor="base"
  rounded={true}
  class="wide"
/>
```

Blog content is centred in a `70ch` column, so add `class="wide"` to any snippet that should break out to the full page width.

## Troubleshooting

**The component isn't in the snippet picker.** Check that the file matches `/**/*.cloudcannon.snippets.yml`, and that CloudCannon has rebuilt since you added it.

**The tag renders as literal text on the site.** The component isn't registered for MDX in that route. Check the `import.meta.glob` block in the route rendering the content, and check that the tag name matches the `.astro` filename exactly - casing included.

**The picker shows it, but the inserted component is blank or unstyled.** `definitions.component_name` probably doesn't match the filename, so CloudCannon writes a tag Astro doesn't recognise.

**An input has no label or is the wrong type.** `_inputs_from_glob` isn't resolving. The path is absolute from the repo root and starts with `/src/...`.

## Next up

With snippets in place, editors can compose posts from your components without touching code. Next, make those components look like your brand: [Customizing Your Brand](/component-docs/customizing-your-brand/).
