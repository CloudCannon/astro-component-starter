---
name: blog-mdx-content
description: Create and manage blog posts using MDX with embedded Astro components. Use when writing blog posts, using components in MDX content, configuring CloudCannon snippets, or understanding blog pagination.
---

# Blog & MDX Content

Blog posts are MDX files in `src/content/blog/`. They support standard Markdown plus embedded Astro components for rich, interactive content sections within articles.

## Blog post file format

### Location and naming

Posts live at `src/content/blog/{filename}.mdx`. The filename becomes the URL slug:

| File                                                  | URL                                     |
| ----------------------------------------------------- | --------------------------------------- |
| `src/content/blog/my-first-post.mdx`                  | `/blog/my-first-post/`                  |
| `src/content/blog/2025-10-15-launch-announcement.mdx` | `/blog/2025-10-15-launch-announcement/` |

### Frontmatter schema

```yaml
---
_schema: default
title: Blog Post Title
description: A brief description of the post.
date: 2025-10-15T00:00:00Z
author: Author Name
image: /src/assets/images/blog/post-image.jpg
tags:
  - Design
  - Development
---
```

| Field         | Type     | Required | Default       |
| ------------- | -------- | -------- | ------------- |
| `title`       | string   | Yes      | —             |
| `description` | string   | Yes      | —             |
| `date`        | date     | Yes      | —             |
| `author`      | string   | No       | `"Anonymous"` |
| `image`       | string   | No       | —             |
| `tags`        | string[] | No       | `[]`          |

The `_schema: default` line tells CloudCannon to use the blog post schema (`.cloudcannon/schemas/blog-post.mdx`).

### Zod validation

The content collection schema in `src/content.config.ts` validates these fields:

```ts
const blogPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  author: z.string().default('Anonymous'),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
```

---

## Writing MDX content

After the frontmatter, write standard Markdown. MDX extends Markdown with JSX component syntax.

### Basic Markdown

```mdx
---
title: My Post
description: A great post.
date: 2025-10-15
---

This is a paragraph with **bold** and _italic_ text.

## A Heading

Another paragraph with a [link](/page/).

- List item one
- List item two

> A blockquote
```

### Using components in MDX

All building block and page section components are automatically available in blog posts by their PascalCase filename. No imports needed.

```mdx
Here is an inline image:

<Image
  source="/src/assets/images/photo.jpg"
  rounded={true}
  aspectRatio="landscape"
  alt="Photo description"
/>

And a full-width CTA section:

<CtaCenter
  buttonSections={[
    {
      _component: 'building-blocks/core-elements/button',
      text: 'Get Started',
      variant: 'primary',
      size: 'md',
      link: '/',
    },
  ]}
  colorScheme="dark"
  backgroundColor="base"
  heading="Ready to start?"
  subtext="Take the next step today."
  rounded={true}
  class="wide"
  style="margin-top: var(--spacing-xl);"
/>
```

### Component name resolution

The blog renderer (`src/pages/blog/[...slug].astro`) uses `import.meta.glob` to load all components from `building-blocks` and `page-sections`. The component name in MDX is the **PascalCase filename** without the `.astro` extension:

| File                       | MDX component name       |
| -------------------------- | ------------------------ |
| `Image.astro`              | `<Image />`              |
| `CtaCenter.astro`          | `<CtaCenter />`          |
| `TestimonialSection.astro` | `<TestimonialSection />` |
| `FeatureGrid.astro`        | `<FeatureGrid />`        |
| `CustomSection.astro`      | `<CustomSection />`      |

### Full-width elements

Blog content uses a CSS grid layout with a centered content column (`70ch` max). To make an element span the full width, add the `wide` class:

```mdx
<Image source="/src/assets/images/banner.jpg" alt="Banner" class="wide" />

<CtaCenter heading="Full width CTA" class="wide" />
```

Elements that automatically get full width: `<pre>` (code blocks), `.image`, `.video`.

### Prop syntax in MDX

- **Strings**: `prop="value"` or `prop={'value'}`
- **Booleans**: `prop={true}` or just `prop` for true
- **Numbers**: `prop={42}`
- **Arrays/objects**: `prop={[{ key: "value" }]}` (JSX expression syntax)
- **CSS**: `style="margin-top: var(--spacing-xl);"`

---

## Commonly used components in blog posts

### Image

```mdx
<Image
  source="/src/assets/images/blog/photo.jpg"
  alt="Description"
  rounded={true}
  aspectRatio="landscape"
/>
```

### Testimonial

```mdx
<TestimonialSection
  text="A great testimonial quote."
  authorName="Jane Doe"
  authorDescription="CEO, Company"
  authorImage="/src/assets/images/team/jane.jpg"
  paddingVertical="sm"
  class="wide"
/>
```

### CTA section

```mdx
<CtaCenter
  heading="Call to action"
  subtext="Supporting text."
  buttonSections={[
    {
      _component: 'building-blocks/core-elements/button',
      text: 'Learn More',
      variant: 'primary',
      size: 'md',
      link: '/page/',
    },
  ]}
  colorScheme="dark"
  backgroundColor="base"
  rounded={true}
  class="wide"
  style="margin-top: var(--spacing-xl);"
/>
```

### Feature Grid

```mdx
<FeatureGrid
  heading="Key points"
  features={[
    { title: 'Point 1', description: 'Details.', iconName: 'bolt', iconColor: 'blue' },
    { title: 'Point 2', description: 'Details.', iconName: 'shield-check', iconColor: 'green' },
  ]}
  colorScheme="inherit"
  backgroundColor="surface"
  class="wide"
/>
```

---

## CloudCannon snippet system

Snippets allow CloudCannon editors to insert components into MDX content through a visual picker, without writing JSX.

### How snippets work

1. Snippet definitions live in `*.cloudcannon.snippets.yml` files next to their components
2. `cloudcannon.config.yml` loads them via glob: `_snippets_from_glob: - /**/*.cloudcannon.snippets.yml`
3. MDX snippet imports are enabled: `_snippets_imports: { mdx: true }`
4. In the CloudCannon content editor, editors click the snippet button to insert components

### Snippet file format

Each snippet file defines how a component maps between the CloudCannon editor and MDX output:

```yaml
ctaCenter:
  template: mdx_component
  inline: false
  preview:
    text:
      - CTA Center
    subtext:
      - key: heading
    icon: hero
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
      - editor_key: backgroundColor
        type: string
        optional: true
        remove_empty: true
      - editor_key: rounded
        type: boolean
        optional: true
  _inputs_from_glob:
    - /src/components/page-sections/ctas/cta-center/cta-center.cloudcannon.inputs.yml
```

### Key snippet fields

| Field                        | Purpose                                              |
| ---------------------------- | ---------------------------------------------------- |
| `template`                   | Always `mdx_component` for MDX components            |
| `inline`                     | `false` for block-level components                   |
| `preview`                    | How the snippet appears in the editor                |
| `definitions.component_name` | PascalCase component name for MDX output             |
| `definitions.named_args`     | Maps editor fields to component props                |
| `_inputs_from_glob`          | Reuses the component's CloudCannon input definitions |

### Named arg types

| `type`    | MDX output     | Notes                                          |
| --------- | -------------- | ---------------------------------------------- |
| `string`  | `prop="value"` | Use `remove_empty: true` to omit empty strings |
| `boolean` | `prop={true}`  | Omitted when false                             |
| `array`   | `prop={[...]}` | Do not use `remove_empty`                      |
| `number`  | `prop={42}`    | —                                              |

### Creating a snippet for a new page section

1. Create `{slug}.cloudcannon.snippets.yml` next to the component
2. Set `template: mdx_component` and `inline: false`
3. Set `component_name` to the PascalCase filename
4. Map each prop as a `named_args` entry with the correct type
5. Reference the component's inputs file with `_inputs_from_glob`
6. The snippet is auto-discovered by the glob in `cloudcannon.config.yml`

---

## Blog index and pagination

### Blog index page

The blog index is rendered by `src/pages/blog/[...page].astro`. It:

1. Loads all blog posts from the `blog` collection
2. Sorts by date (newest first)
3. Paginates at 9 posts per page
4. Renders each post as a card in a responsive grid
5. Pulls hero sections from `src/content/pages/blog.md` to display above the post grid

### Blog hero configuration

Edit `src/content/pages/blog.md` to configure the hero section shown above the post grid:

```yaml
---
_schema: default
title: Blog
description: Read our latest articles.
pageSections:
  - _component: page-sections/heroes/hero-center
    heading: All posts
    subtext: >-
      Description text for the blog index.
    buttonSections: []
    colorScheme: inherit
    backgroundColor: base
---
```

### Post card display

Each post card shows:

- Featured image (if `image` is set)
- Date and author
- Title (as h3)
- Description

### Pagination

The `Pagination` component renders page navigation below the post grid. URLs follow the pattern `/blog/`, `/blog/2/`, `/blog/3/`, etc.

---

## CloudCannon blog collection config

The blog collection is configured in `cloudcannon.config.yml`:

```yaml
blog:
  path: src/content/blog
  glob:
    - '**/*.mdx'
  url: /blog/[full_slug]/
  icon: article
  _enabled_editors:
    - content
    - visual
  schemas:
    default:
      name: New Blog Post
      path: .cloudcannon/schemas/blog-post.mdx
  create:
    path: '[relative_base_path]/{filename|slugify|lowercase}.mdx'
  new_preview_url: /blog/
```

Editors can create new posts from CloudCannon using the "Add New Blog Post" button, which scaffolds from the schema template.

---

## Converting existing blog content to MDX

When migrating blog posts from another platform:

1. **Create the `.mdx` file** with proper frontmatter
2. **Convert HTML to Markdown** — headings, paragraphs, links, lists, bold/italic
3. **Replace embedded content** with components:
   - `<img>` tags → `<Image source="..." alt="..." />`
   - `<blockquote>` with author → `<TestimonialSection ... />`
   - CTA sections → `<CtaCenter ... />`
   - Video embeds → `<Video videoId="..." provider="youtube" />`
4. **Download images** to `src/assets/images/blog/` and update paths
5. **Set the date** to the original publication date (ISO format or `YYYY-MM-DD`)
6. **Map categories/tags** to the `tags` array
