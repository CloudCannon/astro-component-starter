---
title: Editing the Blog
contentSections: []
---

# Editing the Blog

> **Reference.** Read this when you're working on the blog. If your site has no blog, skip ahead to [Going Live](/component-docs/going-live/).

The starter ships a working blog: a paginated listing, a page per post, and a page per tag. Posts are MDX files, so you write Markdown and can drop in components where a post needs one.

## Where things live

```
src/
├── content/
│   ├── blog/                        # Posts, one MDX file each
│   └── pages/
│       └── blog.md                  # The listing's heading and metadata
└── pages/blog/
    ├── [...page].astro              # Listing template
    ├── [...slug].astro              # Post template
    └── tag/[tag]/[...page].astro    # Tag listing template
```

## The listing page

`src/content/pages/blog.md` sets what appears above the post grid, on `/blog/` and on every tag page:

```yaml
---
_schema: default
title: Blog
description: Articles on web development, design, and shipping sites.
pageSections:
  - _component: page-sections/heroes/page-header
    eyebrow: Example
    heading: Blog
    subtext: Example listing page. Copy it as a starting point.
    showBreadcrumbs: true
    alignmentHorizontal: center
---
```

`title` and `description` become the page's `<title>` and meta description. `pageSections` works like any other page: swap the header for a hero, or add sections above the grid. The grid itself comes after your sections, 12 posts to a page. In CloudCannon, open **Pages → Blog**.

To change the grid, the post layout or the tag pages, edit the templates in `src/pages/blog/`. They're ordinary Astro files.

## Creating a post

Add an `.mdx` file to `src/content/blog/`. Its filename is its URL: `launch-day.mdx` becomes `/blog/launch-day/`.

```yaml
---
_schema: default
title: Your Post Title
description: A short summary for the listing card and search engines.
date: 2026-10-15
author: Your Name
image: /src/assets/images/blog/featured-image.jpg
tags:
  - Design
---
```

| Field         | Required | What it does                                                           |
| ------------- | -------- | ---------------------------------------------------------------------- |
| `title`       | Yes      | The post's heading, and the card heading on the listing.               |
| `description` | Yes      | Summary under the title and on the card.                               |
| `date`        | Yes      | Publication date. Posts are listed newest first.                       |
| `author`      | No       | Shown next to the date. Defaults to "Anonymous".                       |
| `image`       | No       | Featured image at the top of the post and on its card.                 |
| `tags`        | No       | Each tag gets a listing at `/blog/tag/{tag}/` and links from the post. |
| `keywords`    | No       | Extra search-engine keywords.                                          |

In CloudCannon, use **Add New Blog Post** in the blog collection.

## Components in a post

After the frontmatter, write Markdown. Where a post needs more, use a component by its filename, with no import:

```mdx
Here's what a client said:

<TestimonialSection
  text="This starter is exactly what we needed."
  authorName="Jane Doe"
  authorDescription="CEO, Company"
  class="wide"
/>

<CtaCenter
  heading="Ready to start?"
  subtext="Take the next step today."
  buttonSections={[
    { _component: 'building-blocks/core-elements/button', text: 'Get started', link: '/start/' },
  ]}
  colorScheme="dark"
  class="wide"
/>
```

Props use JSX syntax: `heading="Hello"` for text, `columns={3}` for numbers, `{true}` or `{false}` for booleans, and `{[...]}` for arrays.

Use only components that have a **snippet**, so editors can change them in CloudCannon's content editor (the **+** button in the toolbar opens a form for each). These ship with one: Alert, Code Block, CTA Center, CTA Form, CTA Split, Embed, FAQ Section, Feature Grid, Feature Slider, Feature Split, Form, Image, Team Grid, Testimonial Section and Video. Any other component shows up as a locked block in the editor, and `npm run lint:cms` fails on it. To add one, see the blog-mdx-content skill in `.agents/skills/`.

### Wide components

Post text sits in a `70ch` column. Add `class="wide"` to let a component use the full width of the article:

```mdx
<Image source="/src/assets/images/banner.jpg" alt="Banner" class="wide" />
```

Code blocks, images and videos are wide automatically.

## Next up

Head to [Going Live](/component-docs/going-live/) to deploy the site, point it at your domain, and clear out the demo content.
