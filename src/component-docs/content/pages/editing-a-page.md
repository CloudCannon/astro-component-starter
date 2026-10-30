---
title: Editing a Page
contentSections: []
---

# Editing a Page

One of the best things about this starter is that the same components work in two contexts: your code editor and CloudCannon's visual editor. Let's see both in action.

## Editing in code

Open `src/content/pages/index.md` in your editor. Its frontmatter starts like this (trimmed):

```yaml
pageSections:
  - _component: page-sections/heroes/hero-center
    eyebrow: Astro + CloudCannon
    heading: Components already built. Pages anyone can edit.
    subtext: >-
      Built on web fundamentals. Yours to brand, simple to maintain, and fast
      by default.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Get started
        link: /start/
        variant: primary
        size: md
```

Each entry in `pageSections` is a component with its props. Try a few changes:

### Change a heading

Find the `hero-center` section and update the `heading` value to something different. Save the file and watch your browser update instantly.

### Reorder sections

Cut an entire `- _component: ...` block (from the dash to the next dash) and paste it in a different position. The page reorders to match.

### Swap a component

Change a section's `_component` value. For example, swap `page-sections/heroes/hero-center` to `page-sections/heroes/hero-split`. Same props, different layout. Not all props will carry over perfectly between components, but it's a quick way to experiment.

### Add a section

Copy an existing section block and paste it into the `pageSections` array. Change the content and you've got a new section on your page.

## Creating a page

A page is one Markdown file in `src/content/pages/`, and its path is its URL: `src/content/pages/pricing.md` is `/pricing/`, and `src/content/pages/services/design.md` is `/services/design/`. Give it a `title`, a `description` for search engines, and a `pageSections` array:

```yaml
---
title: Pricing
description: Plans and prices for every size of team.
pageSections:
  - _component: page-sections/heroes/page-header
    heading: Pricing
    subtext: Pick the plan that fits how often you publish.
---
```

Inner pages usually open with a [Page Header](/component-docs/components/page-sections/heroes/page-header/) (a slim title block, with a breadcrumb trail on nested pages) and save the larger heroes for landing pages. In CloudCannon, editors do the same from **Pages → Add New Page**.

The pages under `/examples/` are complete, worked examples to copy from.

## How it works

The `_component` path maps directly to a component in `src/components/`. When Astro builds your page, `renderBlock.astro` resolves each path and renders the matching component with the props you've defined.

This means you can look at any `_component` value and immediately find its source file. `page-sections/explainers/feature-split` lives at `src/components/page-sections/explainers/feature-split/FeatureSplit.astro`.

Every other key in a section block is a prop passed directly to that component. The props available for each component are documented right here in the component docs. Browse the sidebar to find any component.

If a section renders blank, its `_component` path is almost always wrong. The dev-server terminal prints a `Component not found` warning listing every valid path.

## How blocks space themselves

You never manage margins between blocks. Each block type carries its own default space above: a heading leaves room before a new topic, text sits close under its heading, and collection layouts like grids give themselves extra breathing room. The first block inside a section or wrapper always sits flush, so there's nothing to trim at the top.

When a gap isn't right, adjust the block _below_ it: every block has a **Space Before** field (Default, None, Tight, or Loose) — in code, the `spaceBefore` prop. And when you need an exact gap, add a [Spacer](/component-docs/components/building-blocks/core-elements/spacer/) between two blocks: its size becomes the whole gap, replacing the automatic spacing rather than adding to it.

## Editing in CloudCannon

The exact same page you just edited in code can also be edited visually in CloudCannon. You can try it on your own machine first, then connect a real site.

### Try it locally

```bash
npm run editor
```

This builds the site and serves CloudCannon's real Visual Editor against it at [localhost:10101](http://localhost:10101), with no account needed. Two things to know:

- It shows the last build, not the dev server. After a change, run `npm run build` in another terminal; the open editor picks it up.
- Open pages by their file path (`/about/index.html`). Folder-style URLs like `/about/` return an error in the local editor only.

Edits you make here aren't written back to your files, so it's a safe place to explore.

### Connect your site

1. Push the project to your own GitHub, GitLab, or Bitbucket repository. (The CLI keeps the starter as `upstream`, so add your repository as a new remote first.)
2. Sign up at <a href="https://cloudcannon.com/" target="_blank" rel="noopener">cloudcannon.com</a>, then go to **Create a Site** and pick your Git provider from the **File source** dropdown. Choose your repository and branch.
3. Set the **Static Site Generator** to **Astro** and build.

The project ships with a `cloudcannon.config.yml` and build settings that configure everything else. [Going Live](/component-docs/going-live/) covers deployment in full.

### Make your first visual edit

Once the build succeeds, go to **Pages** in the sidebar and open the home page. Then try:

- **Click a heading or paragraph** in the preview and edit it inline
- **Select a section** in the sidebar to update its fields (text, images, options)
- **Drag sections** to reorder your page layout
- **Add a new section** by clicking "Add Page Section" at the bottom of the sidebar

As you edit, CloudCannon updates the same frontmatter you used in code. It's still the same `pageSections` array and the same component props, just with a visual interface on top.

This is the core idea: developers build the components and editing controls, while content editors work visually. Both workflows use the same source of truth in your repository.

## Next up

Now make it look like your brand. Head to [Customizing Your Brand](/component-docs/customizing-your-brand/) to change colors, fonts, and spacing across the whole site.
