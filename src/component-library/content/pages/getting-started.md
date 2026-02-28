---
title: Setting Up CloudCannon
contentSections: []
---

# Setting Up CloudCannon

CloudCannon is where the visual editing magic happens. This guide walks you through connecting your site from scratch: from creating an account to making your first visual edit.

If you've been following the guides in order, you've already seen what CloudCannon can do. Now let's set it up for real.

## Create a CloudCannon account

1. Head to <a href="https://cloudcannon.com/" target="_blank" rel="noopener">cloudcannon.com</a> and sign up for a free account.
2. Create a new **organization** (or use an existing one).

## Connect your repository

1. Click **Add new site** in your CloudCannon dashboard.
2. Choose **Build with your own files**.
3. Name your site and select your Git provider (GitHub, GitLab, or Bitbucket).
4. Authorize CloudCannon to access your repository and select the repo containing your Astro Component Starter.
5. Choose the branch you want to edit (usually `main`).

## Configure the build

CloudCannon will detect the Astro project automatically. Verify these settings:

- **Build command:** `npm run build`
- **Output path:** `dist`
- **Node version:** File (reads from `.nvmrc`, Node 24)

The project already includes a `cloudcannon.config.yml` file at the root with all the collection and component configuration. CloudCannon reads this automatically, so you shouldn't need to change anything for the initial setup.

Click **Build** and wait for the first build to complete. This usually takes a couple of minutes.

## Your first visual edit

Once the build succeeds:

1. Go to the **Pages** collection in the sidebar.
2. Open the home page (`index`).
3. CloudCannon will open the **Visual Editor**, where you'll see your live site with editing capabilities.
4. **Click on any text** in the preview to edit it inline.
5. **Click on a component** to see its inputs in the sidebar.
6. **Try adding a new section**: click "Add Page Section" in the sidebar, pick a component from the list, and watch it appear on the page.

That's it. You're visually editing the same components you've been working with in code.

## How the configuration works

The starter ships with a complete `cloudcannon.config.yml` that sets up everything CloudCannon needs. Here's what it configures:

### Collections

The config defines three collections that map to your content directories:

- **Pages** (`src/content/pages/`): Site pages, opened in the Visual Editor by default
- **Blog** (`src/content/blog/`): Blog posts in MDX, opened in the Content Editor
- **Data** (`src/data/`): Site-wide data like navigation, footer, and SEO settings

### Component auto-discovery

CloudCannon automatically discovers your components through two mechanisms:

**Structure files.** The `_structures_from_glob` setting in `cloudcannon.config.yml` tells CloudCannon to scan for `.cloudcannon.structures.yml` files, which define reusable structure groups (like button arrays).

**Component config files.** Each component's `.cloudcannon.structure-value.yml` file registers it in CloudCannon's component picker. The `_inputs_from_glob` field inside each structure-value file tells CloudCannon where to find the matching inputs config.

This means **adding a new component to the visual editor is automatic**: just include the two CloudCannon config files alongside your `.astro` file and CloudCannon picks it up on the next build.

### Snippets for MDX

The `_snippets_from_glob` setting discovers `.cloudcannon.snippets.yml` files, which let editors insert components while editing MDX content (like blog posts) through CloudCannon's snippet picker.

## Editable regions reference

Editable regions are what make the live preview interactive. They're `data-*` attributes you add to your component's HTML:

### Text editing

```html
<Heading data-prop="heading" text="{heading}" />
```

`data-prop="heading"` tells CloudCannon that clicking this element should edit the `heading` prop. Works for headings, text, and any text-based content.

### Image editing

```html
<image
  data-prop-src="imageSource"
  data-prop-alt="imageAlt"
  data-editable="image"
  source="{imageSource}"
  alt="{imageAlt}"
/>
```

`data-editable="image"` enables the image picker. `data-prop-src` and `data-prop-alt` map to the source and alt text props.

### Array editing

```html
<ButtonGroup
  buttonSections="{buttonSections}"
  data-children-prop="buttonSections"
  editable="{true}"
/>
```

`data-children-prop="buttonSections"` tells CloudCannon this element contains an array of child components that can be added, removed, and reordered inline.

### Array items and containers

The `renderBlock.astro` utility automatically adds `data-editable="array-item"` to each rendered block, and page layouts add `data-editable="array"` to section containers. You generally don't need to set these yourself; they're handled by the framework.

See the existing page section components (like [Feature Split](/component-library/components/page-sections/features/feature-split/) or [CTA Center](/component-library/components/page-sections/ctas/cta-center/)) for working examples of all these patterns.

## What's next

You've got your site connected, your components are visually editable, and you know how the configuration works. From here, the best thing to do is **browse all the components** in the sidebar. Each one has documentation, examples, and property details to help you build your site.
