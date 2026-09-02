---
_schema: default
title: Get started
description: >-
  Clone the Astro Component Starter, then follow the guides for editing pages,
  customizing the brand, and building your own sections.
pageSections:
  - _component: page-sections/heroes/page-header
    eyebrow: ''
    heading: Get started
    subtext: >-
      Clone the starter, then follow the guides. This page is a map. The README
      and component docs are the source of truth.
    showBreadcrumbs: true
    alignmentHorizontal: start
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/steps
    eyebrow: First hour
    heading: From clone to a site you own
    subtext: ''
    items:
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Clone
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              npx create-astro-component-starter my-site-name scaffolds the
              latest starter and installs dependencies.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Customize tokens
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Colors, fonts, and spacing live in token files. One change
              restyles every component.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Edit in CloudCannon
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Open a page in the visual editor. Click a heading, change it, save.
              The same files you edit in git.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Deploy
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Ship the static build. When you're ready to drop the demo content,
              run npm run reset:starter.
            size: sm
    orientation: horizontal
    imageAspectRatio: landscape
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/collections/card-collection
    eyebrow: Guides
    heading: Follow the learning path
    subtext: Six short guides, from the project tour to building your own section.
    items:
      - image: ''
        imageAlt: ''
        link: /component-docs/project-tour/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Project tour
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Directories, the three-file pattern, and how components are organized.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/editing-a-page/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Editing a page
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Change a page in code, then make the same edit in the visual editor.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/editing-the-blog/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Editing the blog
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Posts, the index, tags, and embedding components in MDX.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/customizing-your-brand/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Customizing your brand
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Tokens, themes, and the cascade layers that keep styles predictable.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/building-a-page-section/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Building a page section
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: 'A new component from scratch: Astro file, CloudCannon config, docs.'
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/visually-edit-components/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Visually edit components
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Wire editable regions so editors can click, type, and drag on the preview.
            size: sm
    layout: grid
    columns: 3
    gap: lg
    aspectRatio: none
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/conversion/cta-split
    heading: Prefer to read the source?
    subtext: >-
      The repo is the starter. The component docs stay next to the code, including
      a drag-and-drop builder that exports a full component package.
    imageSource: /src/assets/images/component-docs/website-documented.svg
    imageAlt: Documented component layout
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: View on GitHub
        hideText: false
        link: https://github.com/CloudCannon/astro-component-starter
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Open the docs
        hideText: false
        link: /component-docs/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    reverse: false
    colorScheme: inherit
    backgroundColor: surface
---
