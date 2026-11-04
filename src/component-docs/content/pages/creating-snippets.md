---
title: Creating Snippets
description: >-
  How CloudCannon snippets let editors insert components inside MDX blog content, how the starter
  wires them up, and how to add a snippet to your own component.
contentSections: []
---

# Creating Snippets

> **Reference.** Read this when you want a component of your own to be insertable in blog posts. If your site has no blog, skip ahead to [Going Live](/component-docs/going-live/).

Page sections are added to a page's `pageSections` array through structures. Blog posts aren't built from an array of sections: they're MDX documents, and the content is the body text. **Snippets** are how CloudCannon lets editors drop components into that body text.

In CloudCannon's content or visual editor, an editor clicks the **snippet** button in the toolbar (the small document icon) and picks a component from the snippet picker. A modal opens with inputs for that instance of the component, and CloudCannon writes the MDX from what they enter. Click the component again later and the same modal reopens, filled in from the MDX. The file and the modal stay in sync in both directions.

## Structures vs snippets

Both describe a component to CloudCannon, and both reuse the same inputs file. The difference is where the component ends up:

|           | Structures                                              | Snippets                           |
| --------- | ------------------------------------------------------- | ---------------------------------- |
| File      | `{slug}.cloudcannon.structure-value.yml`                | `{slug}.cloudcannon.snippets.yml`  |
| Used in   | Front matter arrays (`pageSections`, `contentSections`) | MDX body content (blog posts)      |
| Editor UI | The **Add** menu on an array                            | The snippet button in the toolbar  |
| Output    | YAML in front matter                                    | A JSX-style tag in the post's body |

A component can have both. The same Feature Grid can be added to a landing page as a section, or dropped into the middle of a blog post as a snippet.

## How it works end to end

Three pieces have to line up:

1. **The component is registered for MDX** in the blog route, so Astro knows what `<FeatureGrid />` means in a post.
2. **A snippet file** sits next to the component, describing how CloudCannon reads and writes that tag.
3. **`cloudcannon.config.yml` picks up those files** with a glob.

### 1. Registering components for MDX

MDX doesn't know about your components unless you tell it. Rather than adding an `import` line to every post, the post route imports every component once and hands them to Astro's `<Content />`. From `src/pages/blog/[...slug].astro`:

```ts
const componentImports = {
  ...import.meta.glob('../../components/building-blocks/**/*.astro', { eager: true }),
  ...import.meta.glob('../../components/page-sections/**/*.astro', { eager: true }),
};

const mdxComponents: Record<string, any> = {};
const sourceByName: Record<string, string> = {};

Object.entries(componentImports).forEach(([path, module]) => {
  const componentName = path.split('/').pop()!.replace('.astro', '');

  if (sourceByName[componentName]) {
    throw new Error(`Two components are named ${componentName}.astro, so MDX cannot address both`);
  }

  sourceByName[componentName] = path;
  mdxComponents[componentName] = (module as any).default;
});
```

The map is then passed to the rendered post:

```astro
<Content components={mdxComponents} />
```

This is Astro's own MDX `components` prop, so there's no extra dependency. Two consequences:

- **A component's name in MDX is its PascalCase filename.** `FeatureGrid.astro` is `<FeatureGrid />`, and the snippet definition has to use exactly that name.
- **Filenames must be unique across the whole library.** Two components with the same filename fail the build, which is why some page sections carry a `Section` suffix (`FaqSection`, `TestimonialSection`).

If you render MDX in another route, copy this block into it, or components render as literal text there.

### 2. Loading snippet files

Near the bottom of `cloudcannon.config.yml`:

```yaml
markdown:
  engine: commonmark
  options:
    escape_snippets_in_code_blocks: true
_snippets_imports:
  mdx: true
_snippets_from_glob:
  - /**/*.cloudcannon.snippets.yml
```

- `_snippets_from_glob` picks up every snippet file in the repo. Nothing is registered by hand: add a file next to a component and it appears in the picker on the next build.
- `_snippets_imports.mdx` adds CloudCannon's built-in MDX snippets. They keep anything without a snippet of its own (imports, `{expressions}`, other JSX) as a locked block, so the editor doesn't break on it.
- `escape_snippets_in_code_blocks` keeps a component tag inside a code fence as code, so a post can show snippet syntax as an example.

The snippet button itself is switched on for the blog collection by `snippet: true` in its `_editables.content` toolbar.

### 3. The snippet file

Snippet files live in the component's own folder, named after its slug:

```
src/components/page-sections/conversion/cta-center/
├── CtaCenter.astro
├── cta-center.cloudcannon.inputs.yml            # Field definitions (shared)
├── cta-center.cloudcannon.snippets.yml          # Use in MDX body content
└── cta-center.cloudcannon.structure-value.yml   # Use in front matter arrays
```

Here's `cta-center.cloudcannon.snippets.yml`, shortened to four of its props:

```yaml
ctaCenter:
  template: mdx_component
  inline: false
  preview:
    text:
      - CTA Center
    subtext:
      - key: heading
    image: public/component-previews/page-sections/conversion/cta-center.svg
    icon: call_to_action
    gallery:
      image: public/component-previews/page-sections/conversion/cta-center.svg
      fit: cover
  definitions:
    component_name: CtaCenter
    named_args:
      - editor_key: heading
        type: string
        optional: true
        remove_empty: true
      - editor_key: subtext
        type: string
        optional: true
        remove_empty: true
      - editor_key: buttonSections
        type: array
        optional: true
      - editor_key: colorScheme
        type: string
        optional: true
        remove_empty: true
  _inputs_from_glob:
    - /src/components/page-sections/conversion/cta-center/cta-center.cloudcannon.inputs.yml
```

Inserting it produces MDX like this:

```mdx
<CtaCenter heading="Ready to start?" subtext="Take the next step today." colorScheme="dark" />
```

## The fields

| Field                        | What it does                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Top-level key (`ctaCenter`)  | The snippet's ID. Keep it unique across the project. The convention here is the component name in camelCase.                       |
| `template`                   | The snippet template. Every snippet in the starter uses `mdx_component`.                                                           |
| `inline`                     | `false` makes the component a block on its own line between paragraphs. Every snippet in the starter is a block.                   |
| `preview`                    | How the snippet looks in the picker and in the document once inserted. See below.                                                  |
| `definitions.component_name` | The MDX tag name. **Must exactly match the PascalCase `.astro` filename**, because that's what the blog route registers.           |
| `definitions.named_args`     | The props, in the order they're written into the tag and shown to the editor.                                                      |
| `_inputs_from_glob`          | Points at the component's inputs file, so the snippet modal and the page-section sidebar use the same inputs. Don't add `_inputs`. |

`mdx_component` is one of several snippet templates CloudCannon supports. See [CloudCannon's snippet documentation](https://cloudcannon.com/documentation/developer-reference/configuration-file/types/snippet/) for the others.

### named_args

Each entry maps one prop to one input in the modal:

| Key            | Notes                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `editor_key`   | The prop name. Must match the prop your `.astro` component destructures, and the input's key in the inputs file.      |
| `type`         | `string`, `boolean` or `array`. Strings are written as `prop="value"`; booleans and arrays as `prop={...}`.           |
| `optional`     | The editor can leave it blank.                                                                                        |
| `remove_empty` | Leave the prop out of the MDX when it's empty, instead of writing `prop=""`. Use it on strings; arrays don't need it. |

A prop that isn't listed in `named_args` is invisible to the snippet.

### preview

`preview` controls the card an editor sees in the picker and in the document. `text` and `subtext` take a list of fallbacks, tried in order. An entry can be a literal string, a `key:` naming a prop, or a `template:` that fills in props. The Video snippet uses `template: Video - {type}`, so its card reads "Video - youtube".

`image` and `gallery.image` point at the component's preview thumbnail. You don't write those by hand: `npm run previews:build` adds them for every component with a preview recipe. The Image snippet is the exception, with a `gallery` that shows the chosen photo instead.

## Adding a snippet to your own component

Once you've built the component and its inputs file (see [Building a Page Section](/component-docs/building-a-page-section/)):

1. Create `{slug}.cloudcannon.snippets.yml` in the component's folder.
2. Set `template: mdx_component` and `inline: false`.
3. Set `definitions.component_name` to the exact PascalCase filename.
4. Add a `named_args` entry for every prop an editor should control, in the order you want them written.
5. Point `_inputs_from_glob` at the component's inputs file.
6. Add a `preview` with a title, a `subtext` key and an icon, then run `npm run previews:build` to add the thumbnail.
7. Run `npm run lint:cms`. It checks that every component tag in a post has a snippet.

There's no registration step: the glob in `cloudcannon.config.yml` finds the file. Push the branch and the snippet appears in the picker after CloudCannon rebuilds.

## What ships with the starter

Fifteen components have a snippet out of the box:

- **Building blocks:** Alert, Code Block, Image, Video, Embed, Form
- **Conversion:** CTA Center, CTA Split, CTA Form
- **Explainers:** Feature Grid, Feature Split, Feature Slider, FAQ Section
- **Collections:** Team Grid
- **Proof:** Testimonial Section

These are the components that make sense mid-article. Heroes and navigation don't belong inside a post.

To see snippets in a real post, open [Why we built our component starter](/blog/2025-10-15-why-we-built-our-component-starter/), which uses a Testimonial Section and a CTA Center partway through.

## Writing snippets by hand

You don't have to use the picker. A tag you write yourself is picked up as a snippet as long as its name matches a `component_name`. Only use components that have a snippet: any other component shows up as a locked block in the editor, and `npm run lint:cms` fails on it.

Post text sits in a `70ch` column, so add `class="wide"` to a component that should use the full width of the article:

```mdx
<CtaCenter heading="Ready to build something better?" colorScheme="dark" class="wide" />
```

## Troubleshooting

**The component isn't in the snippet picker.** Check that the filename ends in `.cloudcannon.snippets.yml`, and that CloudCannon has rebuilt since you added it.

**The tag renders as literal text on the site.** The component isn't registered for MDX in that route. Check the `import.meta.glob` block in the route that renders the content, and check that the tag matches the `.astro` filename exactly, casing included.

**The editor shows the component as a locked block.** No snippet's `component_name` matches the tag. `npm run lint:cms` names the tag and the post.

**An input has no label or is the wrong type.** `_inputs_from_glob` isn't resolving. The path is absolute from the repo root and starts with `/src/`.

## Next up

With snippets in place, editors can build posts from your components without touching code. Next, [Going Live](/component-docs/going-live/) covers deploying the site and clearing out the demo content.
