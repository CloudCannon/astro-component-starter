---
title: Editing a Page
contentSections: []
---

# Editing a Page

One of the best things about this starter is that the same components work in two contexts: your code editor and CloudCannon's visual editor. Let's see both in action.

## Editing in code

Open `src/content/pages/index.md` in your editor. You'll see frontmatter like this:

```yaml
pageSections:
  - _component: page-sections/heroes/hero-center
    heading: The Astro Component Starter for building any site
    subtext: >-
      Built on web fundamentals. Easy to customize, fast to use,
      and simple to maintain.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Explore Components
        link: /component-docs/
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

## How it works

The `_component` path maps directly to a component in `src/components/`. When Astro builds your page, `renderBlock.astro` resolves each path and renders the matching component with the props you've defined.

This means you can look at any `_component` value and immediately find its source file. `page-sections/features/feature-split` lives at `src/components/page-sections/features/feature-split/FeatureSplit.astro`.

Every other key in a section block is a prop passed directly to that component. The props available for each component are documented right here in the component docs. Browse the sidebar to find any component.

## Editing in CloudCannon

The exact same page you just edited in code can also be edited visually in CloudCannon.

### Connect your site

1. Head to <a href="https://cloudcannon.com/" target="_blank" rel="noopener">cloudcannon.com</a> and sign up for a free account.
2. Click **Add new site** and choose **Build with your own files**.
3. Name your site, select your Git provider, and connect the repository containing this project.
4. Wait for the build to complete.

The project ships with a `cloudcannon.config.yml` that configures all collections, components, and editing behavior. CloudCannon reads this automatically — no additional setup needed.

### Make your first visual edit

Once the build succeeds, go to **Pages** in the sidebar and open the home page. Then try:

- **Click a heading or paragraph** in the preview and edit it inline
- **Select a section** in the sidebar to update its fields (text, images, options)
- **Drag sections** to reorder your page layout
- **Add a new section** by clicking "Add Page Section" at the bottom of the sidebar

As you edit, CloudCannon updates the same frontmatter you used in code. It's still the same `pageSections` array and the same component props, just with a visual interface on top.

This is the core idea: developers build the components and editing controls, while content editors work visually. Both workflows use the same source of truth in your repository.

## Next up

Now that you can edit pages, let's make the starter look like your brand. Head to [Customizing Your Brand](/component-docs/customizing-your-brand/) to update colors, fonts, and spacing across your entire site.
