---
title: Editing the Blog
contentSections: []
---

# Editing the Blog

The starter ships with a fully working blog: a paginated index page, individual post pages, and tag filtering. Blog posts are MDX files, which means you get standard Markdown plus the ability to embed any component from the starter directly in your content.

## Blog structure overview

```
src/
├── content/
│   ├── blog/                        # Blog posts (MDX files)
│   │   ├── 2025-10-15-my-post.mdx
│   │   └── 2025-12-31-another-post.mdx
│   └── pages/
│       └── blog.md                  # Shared blog content (hero, title, description)
└── pages/blog/
    ├── [...page].astro              # Blog index page template
    ├── [...slug].astro              # Individual post page template
    └── tag/[tag]/[...page].astro    # Tag filter page template
```

There are three things you might want to edit:

1. **Blog content** (`src/content/pages/blog.md`) — the hero section and metadata shared across the blog index and tag pages
2. **Individual blog posts** (`src/content/blog/`) — the MDX files that become articles
3. **Page templates** (`src/pages/blog/`) — the Astro files that control the layout and structure of the blog index, post pages, and tag pages

## Editing the blog content

The blog content file at `src/content/pages/blog.md` controls the hero and metadata shown above the post grid. This content is shared across both the blog index page (`/blog/`) and the tag filter pages (`/blog/tag/{tag}/`).

```yaml
---
_schema: default
title: Blog
description: Read our latest articles and insights.
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

### What you can change

- **Title and description**: Used for the page's `<title>` tag and meta description.
- **Hero section**: Swap `hero-center` for `hero-split` or any other hero component. Change the heading, subtext, color scheme, or add buttons.
- **Add more sections**: Add additional entries to `pageSections` to place content above the post grid. Any page section component works here (CTAs, feature blocks, etc.).

The post grid itself is rendered automatically below your `pageSections`. It shows 9 posts per page with pagination.

### In CloudCannon

Open **Pages → Blog** in CloudCannon to edit the blog content visually. You can click the hero heading to edit it inline, change section settings in the sidebar, or add new sections above the post grid.

## Customizing the blog page templates

The content in `blog.md` controls what appears above the post grid, but the actual page layout and structure is defined in Astro template files. To change how the post list or individual posts are rendered, edit these files directly:

| Template                                   | URL pattern                | What it controls                                            |
| ------------------------------------------ | -------------------------- | ----------------------------------------------------------- |
| `src/pages/blog/[...page].astro`           | `/blog/`, `/blog/2/`, etc. | Blog index page layout, post grid, pagination               |
| `src/pages/blog/[...slug].astro`           | `/blog/my-post/`           | Individual post page layout (title, metadata, content area) |
| `src/pages/blog/tag/[tag]/[...page].astro` | `/blog/tag/design/`        | Tag filter pages                                            |

These are standard Astro components, so you can use any of the starter's components inside them. For example, you could add a `CustomSection` wrapper, change the post metadata layout, or add a sidebar.

## Creating a blog post

Create a new `.mdx` file in `src/content/blog/`. The filename becomes the URL slug:

| File                        | URL                            |
| --------------------------- | ------------------------------ |
| `my-first-post.mdx`         | `/blog/my-first-post/`         |
| `2025-10-15-launch-day.mdx` | `/blog/2025-10-15-launch-day/` |

### Frontmatter

Every post starts with frontmatter that defines its metadata:

```yaml
---
_schema: default
title: Your Post Title
description: A brief summary shown on the blog index cards.
date: 2025-10-15T00:00:00Z
author: Your Name
image: /src/assets/images/blog/featured-image.jpg
tags:
  - Design
  - Development
---
```

| Field         | Required | What it does                                                                           |
| ------------- | -------- | -------------------------------------------------------------------------------------- |
| `title`       | Yes      | Post title, shown as an h1 on the post page and as the card heading on the blog index. |
| `description` | Yes      | Summary text shown below the title and on blog index cards.                            |
| `date`        | Yes      | Publication date. Posts are sorted newest-first. Use ISO format or `YYYY-MM-DD`.       |
| `author`      | No       | Author name displayed next to the date. Defaults to "Anonymous".                       |
| `image`       | No       | Featured image shown at the top of the post and on the blog index card.                |
| `tags`        | No       | Array of tags. Each tag gets its own filtered page at `/blog/tag/{tag-slug}/`.         |

### In CloudCannon

Click **Add New Blog Post** in the blog collection to create a post from the schema template. CloudCannon will prompt you for the filename and populate the frontmatter fields with an editing interface.

## Writing post content

After the frontmatter, write standard Markdown:

```markdown
This is a paragraph with **bold** and _italic_ text.

## A Heading

Another paragraph with a [link](/about/).

- List item one
- List item two

> A blockquote
```

### Using components in posts

This is what makes MDX powerful: you can embed any building block or page section component directly in your post content. Components are available by their PascalCase filename — no imports needed.

**Important:** Each component must be written on a single line.

```mdx
Here's a testimonial in the middle of a blog post:

<TestimonialSection
  text="This starter is exactly what we needed."
  authorName="Jane Doe"
  authorDescription="CEO, Company"
  authorImage="/src/assets/images/team/jane.jpg"
  paddingVertical="sm"
  class="wide"
/>

And a call-to-action section:

<CtaCenter
  heading="Ready to start?"
  subtext="Take the next step today."
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
  rounded={true}
  class="wide"
/>
```

The component name matches the `.astro` filename: `TestimonialSection.astro` becomes `<TestimonialSection />`, `CtaCenter.astro` becomes `<CtaCenter />`, `Image.astro` becomes `<Image />`.

### Full-width components

Blog content is centered in a `70ch` column. To make a component span the full width of the page, add `class="wide"`:

```mdx
<Image source="/src/assets/images/banner.jpg" alt="Banner" class="wide" />
```

Code blocks (`<pre>`), images (`.image`), and videos (`.video`) are automatically full-width.

### Prop syntax

MDX uses JSX syntax for component props:

| Type         | Syntax                           | Example                                                   |
| ------------ | -------------------------------- | --------------------------------------------------------- |
| String       | `prop="value"`                   | `heading="Hello"`                                         |
| Boolean      | `prop={true}` or just `prop`     | `rounded={true}` or `rounded`                             |
| Number       | `prop={42}`                      | `columns={3}`                                             |
| Array/Object | `prop={[...]}` or `prop={{...}}` | `buttonSections={[{ _component: '...', text: 'Click' }]}` |

### In CloudCannon

When editing a blog post in CloudCannon's content editor, you can insert components using the **snippet picker** (the "+" button in the toolbar). This gives you a visual form for each component's props without needing to write JSX. The snippet system converts back and forth between the visual form and the MDX code automatically.

## Post card display

Each post appears on the blog index as a card showing:

- Featured image (if set)
- Date and author
- Title
- Description

To control how a post looks on the index, update its `title`, `description`, `image`, and `date` frontmatter fields.

## Tags

Tags create filtered views of your posts. If a post has `tags: ["Design", "Development"]`, it will appear on both `/blog/tag/design/` and `/blog/tag/development/`. Tags are also displayed on the individual post page and link to their filtered view.

## Next up

Now that you know how the blog works, let's make the starter look like your brand. Head to [Customizing Your Brand](/component-docs/customizing-your-brand/) to update colors, fonts, and spacing across your entire site.
