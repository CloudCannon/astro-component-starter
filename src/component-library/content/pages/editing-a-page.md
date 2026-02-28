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
        link: /component-library/
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

Here's where it gets interesting. The exact same page you just edited in code can be edited visually in CloudCannon:

- **Click on text** in the preview to edit it inline: headings, body text, buttons
- **Open a component** in the sidebar to see its inputs: text fields, dropdowns, image pickers, toggles
- **Drag sections** to reorder them
- **Add new sections** from the component picker. Every page section is available with sensible defaults.
- **Watch changes** appear in the live preview as you make them

The visual editor reads and writes the same frontmatter you just edited by hand. There's no separate content format. It's the same `pageSections` array, the same props, the same components.

This is the core idea: developers build components and define the editing experience through CloudCannon config files. Editors manage content visually without touching code. Both work with the same source of truth.

> **Want to try the visual editor yourself?** Jump to [Setting Up CloudCannon](/component-library/getting-started/) to connect your site, then come back here.

## Next up

Now that you can edit pages, let's make the starter look like your brand. Head to [Customizing Your Brand](/component-library/customizing-your-brand/) to update colors, fonts, and spacing across your entire site.
