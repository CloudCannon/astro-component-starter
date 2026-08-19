---
name: blog-mdx-content
description: Use when writing or editing a blog post, embedding Astro components inside MDX body content, wiring a CloudCannon snippet for inserting a component into a post, or working with blog tags/pagination/listing.
---

# Blog & MDX content

Blog posts are `.mdx` files in `src/content/blog/`, one per post, rendered through the `blog` content collection. The frontmatter schema is code, not convention — `src/content.config.ts` is the source of truth; verify against it before trusting any table below if the two ever disagree.

## When to use

- Writing a new blog post or editing an existing one.
- Embedding a page section or building block inside a post's MDX body.
- Adding a `*.cloudcannon.snippets.yml` so editors can insert a component from the CloudCannon content editor.
- Working on the blog index, tag archive, or pagination.

## When not to use

| Situation                                             | Go instead to                                                |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| Building non-blog page content from existing sections | [page-content-authoring](../page-content-authoring/SKILL.md) |
| Creating a brand-new component (not just using one)   | [create-component](../create-component/SKILL.md)             |
| Migrating a whole existing site, blog included        | [migrate-existing-site](../migrate-existing-site/SKILL.md)   |
| Wiring `data-prop` / editable bindings on a component | [editable-regions](../editable-regions/SKILL.md)             |

## File location, naming, and format

Posts live at `src/content/blog/{filename}.mdx` — always `.mdx`, never `.md` (the collection loader only globs `**/*.mdx`; a `.md` file in that directory is invisible to the collection). The filename (minus `.mdx`) is the slug and becomes the URL, e.g. `src/content/blog/2025-10-15-launch.mdx` → `/blog/2025-10-15-launch/`. Real posts in this repo use a `YYYY-MM-DD-slug.mdx` naming convention for chronological sorting in a file listing, but nothing in the code enforces it — the `date` frontmatter field, not the filename, drives sort order and the displayed date.

## Frontmatter schema

Source of truth: `blogPostSchema` in `src/content.config.ts`.

| Field         | Type     | Required | Default       | Notes                                                                                                    |
| ------------- | -------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `title`       | string   | Yes      | —             |                                                                                                          |
| `description` | string   | Yes      | —             | Also used as the meta description and post-card excerpt.                                                 |
| `date`        | date     | Yes      | —             | `z.coerce.date()` — accepts `2025-10-15` or `2025-10-15T00:00:00Z`. Drives sort order, not the filename. |
| `author`      | string   | No       | `"Anonymous"` |                                                                                                          |
| `image`       | string   | No       | —             | Path under `/src/...`; rendered as the post hero and card thumbnail when set.                            |
| `tags`        | string[] | No       | `[]`          | Powers `/blog/tag/{tag}/` archives.                                                                      |
| `keywords`    | string[] | No       | —             | Output as `<meta name="keywords">` when set.                                                             |
| `showToc`     | boolean  | No       | `true`        | "On this page" sidebar from the post's `h2`/`h3`s. Hidden automatically when the post has no headings.   |

**Note:** the blog schema has no `canonical` field — that exists on the `pages` collection (`pageSchema`) but not `blog`.

CloudCannon reads an additional `_schema: default` frontmatter key (every real post has it) to pick the editor schema at `.cloudcannon/schemas/blog-post.mdx`. It is not part of `blogPostSchema` — zod's default object mode strips unrecognized keys, so it is harmless to Astro but required for the CloudCannon editor to apply the right field set.

```yaml
---
_schema: default
title: Blog Post Title
description: A brief description of the post.
date: 2025-10-15T00:00:00Z
author: Author Name
image: /src/assets/images/component-docs/castle.jpg
tags:
  - Design
  - Development
keywords: []
showToc: true
---
```

## Creating a new post

1. Create `src/content/blog/{date-prefix}-{slug}.mdx` (or let CloudCannon's "Add New Blog Post" scaffold it from the schema).
2. Fill in frontmatter per the table above — `title`, `description`, and `date` are required; everything else can be omitted. Add `h2`/`h3` headings in the body if you want the "On this page" sidebar to list sections (`showToc` defaults to on).
3. Write the body in standard Markdown; embed components per [Using components in MDX](#using-components-in-mdx) where needed.
4. If the post has an `image`, confirm the referenced file exists under `src/assets/images/` (see [Images](#images)).
5. Run `npm run dev`, visit `/blog/{slug}/`, and confirm the post appears on `/blog/` (newest-first, by `date`) and on any `/blog/tag/{tag}/` pages for its tags.

## Using components in MDX

`src/pages/blog/[...slug].astro` builds an `mdxComponents` map with `import.meta.glob` over every `.astro` file under `src/components/building-blocks/**` and `src/components/page-sections/**`, keyed by its **PascalCase filename** (not its kebab-case `_component` path). Every building block and page section is therefore usable in a post body with no explicit import — write `<ComponentFileName ...props />` and it resolves.

```mdx
<Image
  source="/src/assets/images/component-docs/sunset.jpg"
  alt="Description"
  rounded={true}
  aspectRatio="landscape"
/>

<TestimonialSection
  text="A great testimonial quote."
  authorName="Jane Doe"
  authorDescription="CEO, Company"
  authorImage="/src/assets/images/component-docs/profile.jpg"
  class="wide"
/>
```

**Prop syntax:** strings as `prop="value"`, booleans as `prop={true}` (or bare `prop`), numbers as `prop={42}`, arrays/objects as JSX expressions (`prop={[{ key: "value" }]}`) — arrays need `_component` on every nested block item exactly like page-section YAML. For the actual prop list of a given page section (`CtaCenter`, `FeatureGrid`, `TestimonialSection`, etc.), read its entry in the [page-content-authoring catalog](../page-content-authoring/SKILL.md) — this skill does not duplicate those tables.

**Full width:** post body content sits in a centered `70ch` grid column (see `.post` in `src/pages/blog/[...slug].astro`). Add `class="wide"` to any component to span the full content width; `<pre>` (code blocks), `.image`, and `.video` elements get it automatically.

**Common miss:** page sections accept arbitrary extra attributes (e.g. `rounded`, `class`, `style`) beyond their declared props because most spread `...htmlAttributes` down to `CustomSection` — real posts rely on this (`rounded={true}`, `style="margin-top: var(--spacing-xl);"`). Don't assume every attribute you see in an existing post is a documented prop; check the component's `.astro` destructure if unsure.

## Components with a CloudCannon snippet

A `*.cloudcannon.snippets.yml` next to a component lets an editor insert it into a post's body from the CloudCannon content editor's snippet picker, instead of hand-writing JSX. Snippet files are auto-discovered — `cloudcannon.config.yml` collects them via `_snippets_from_glob: /**/*.cloudcannon.snippets.yml` and enables MDX output with `_snippets_imports: { mdx: true }`. The blog collection's `_editables.content.snippet: true` turns on the picker button for the `blog` collection specifically.

Components with a snippet today (13 total):

| Component (MDX tag)  | `_component` directory                    |
| -------------------- | ----------------------------------------- |
| `Image`              | `building-blocks/core-elements/image`     |
| `Video`              | `building-blocks/core-elements/video`     |
| `Embed`              | `building-blocks/core-elements/embed`     |
| `Form`               | `building-blocks/forms/form`              |
| `CtaCenter`          | `page-sections/conversion/cta-center`     |
| `CtaSplit`           | `page-sections/conversion/cta-split`      |
| `CtaForm`            | `page-sections/conversion/cta-form`       |
| `FeatureGrid`        | `page-sections/explainers/feature-grid`   |
| `FeatureSplit`       | `page-sections/explainers/feature-split`  |
| `FeatureSlider`      | `page-sections/explainers/feature-slider` |
| `FaqSection`         | `page-sections/explainers/faq-section`    |
| `TeamGrid`           | `page-sections/collections/team-grid`     |
| `TestimonialSection` | `page-sections/proof/testimonial-section` |

Each snippet's `definitions.named_args` maps an editor field to a prop (`type: string` → `prop="value"`, `type: array` → `prop={[...]}`, `type: boolean` → `prop={true}`, omitted when false) and `_inputs_from_glob` reuses the component's own `*.cloudcannon.inputs.yml` for field UI. In real posts, only `Image`, `TestimonialSection`, `CtaCenter`, `CtaSplit`, and `CtaForm` are actually used — the rest exist but are unexercised in current content.

**Creating a new snippet for a component** (e.g. you just scaffolded a new page section and want it insertable in blog bodies): follow the `snippets.yml (MDX-insertable page sections only)` section of [create-component/cloudcannon-yaml.md](../create-component/cloudcannon-yaml.md) — that skill owns the template and field-type table. Do not hand-invent the YAML shape here.

## Images

Blog `image` and inline `<Image source=...>` paths resolve through `src/components/utils/image.ts`, which globs everything under `/src/assets/images/**/*` at build time and matches by suffix. There is no dedicated `src/assets/images/blog/` directory in this repo today — real posts reference images already under `src/assets/images/component-docs/` (shared stock imagery). Any path under `src/assets/images/` works; organize into a subfolder if you prefer, but nothing requires it.

For a genuinely new/placeholder image an editor will later replace, use the one committed placeholder asset: `/src/assets/images/placeholder.jpg`. **Why:** referencing a path that doesn't exist under `src/assets/images/` fails the build (`getLocalImageAsset` logs `Local image not found` and falls back to the raw string as an unoptimized `<img src>`, which 404s in production).

## CloudCannon editing

The `blog` collection is configured in `cloudcannon.config.yml` (`path: src/content/blog`, `glob: **/*.mdx`, `url: /blog/[full_slug]/`). Editors create a post via the "Add New Blog Post" add-option, which scaffolds from `.cloudcannon/schemas/blog-post.mdx` (empty `title`/`description`/`date`, `author: Anonymous`, `image: ""`, `tags: []`, `keywords: []`, `showToc: true`). The collection has both `content` and `visual` editors enabled; `_editables.content` configures the rich-text toolbar for the MDX body (headings, lists, blockquote, code, snippets) — the native image toolbar button is not in that format list, so editors add images via the `Image` snippet instead of the generic editor image button.

## Blog index, tags, and pagination

| Route                               | File                                       | Notes                                                        |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `/blog/`, `/blog/2/`, …             | `src/pages/blog/[...page].astro`           | All posts, newest-first by `date`, 12 per page.              |
| `/blog/{slug}/`                     | `src/pages/blog/[...slug].astro`           | Single post; renders `Content` with the `mdxComponents` map. |
| `/blog/tag/{tag}/`, `/tag/{tag}/2/` | `src/pages/blog/tag/[tag]/[...page].astro` | Posts filtered to one tag, same 12-per-page pagination.      |

Both listing routes share `getBlogPostsSortedByDate()` and `loadBlogPageContext()` from `src/utils/blog.ts`. `loadBlogPageContext()` reads the `pages` collection entry with id `blog` (i.e. `src/content/pages/blog.md`) for the hero section shown above the post grid — edit that file's `pageSections` to change the blog index hero copy, not the route file. Tag slugs are derived from each tag string via `slugifyLabel` (lowercased, non-alphanumeric runs collapsed to `-`), so `Design` and `design` land on the same archive page.

Each post card (`src/components/utils/BlogPostListingGrid.astro`) shows the image (if set), date + author, title, and description — pulled straight from frontmatter, nothing extra to configure per post.

## Verify your work

| Command         | What to look for                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check` | Exit 0 — no lint/type errors; `astro check` catches a malformed MDX body or a schema violation.                                                            |
| `npm run dev`   | Visit `/blog/{slug}/` — the post renders, embedded components display correctly, and it appears on `/blog/` and any `/blog/tag/{tag}/` pages for its tags. |
