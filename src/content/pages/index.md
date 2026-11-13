---
_schema: default
title: Components already built. Pages anyone can edit.
description: A library of brandable page sections for Astro, visually editable
  in CloudCannon. Clone it, swap the design tokens, and ship a static site.
keywords: []
pageSections:
  - _component: page-sections/heroes/hero-center
    sectionLabel: ''
    eyebrow: Astro + CloudCannon
    heading: Components already built. Pages anyone can edit.
    headingLevel: h1
    subtext: Built on web fundamentals. Yours to brand, simple to maintain, and fast
      by default.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Get started
        hideText: false
        link: /start/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Browse components
        hideText: false
        link: /component-docs/
        iconName: blocks
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    background:
      type: pattern
      imageSource: /src/assets/images/component-docs/pattern-plus.svg
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: frame
      overlay: 0
      patternSize: natural
  - _component: page-sections/explainers/feature-split
    sectionLabel: ''
    eyebrow: Visual editing
    heading: Edit on the page. Commit to the repo.
    headingLevel: h2
    subtext: Click a heading and type, drag sections into a new order, or add new
      ones from the library. Every edit is saved to the same Markdown files
      developers see in git.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: See how editing works
        hideText: false
        link: /component-docs/editing-a-page/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    imageSource: /src/assets/images/component-docs/website-edit-commit.svg
    imageAlt: A heading being edited on a webpage, with the change arriving as a
      highlighted line and a commit in a Markdown file
    imageAspectRatio: none
    imageRounded: false
    imageBleed: false
    reverse: true
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
  - _component: page-sections/explainers/stats
    sectionLabel: ''
    eyebrow: What's in the box
    heading: Big library. Tiny payload.
    headingLevel: h2
    subtext: Every component renders to static HTML and CSS. Most ship no JavaScript
      at all.
    stats:
      - number: 26
        prefix: ''
        suffix: ''
        label: Page sections
      - number: 51
        prefix: ''
        suffix: ''
        label: Building blocks
      - number: 1898
        prefix: ''
        suffix: ''
        label: Icons in the picker
      - number: 0
        prefix: ''
        suffix: ' KB'
        label: JS on most sections
    dividers: true
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: dark
    lockColorScheme: false
    backgroundColor: surface
    background:
      type: pattern
      imageSource: /src/assets/images/component-docs/pattern-dot-grid.svg
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: frame
      overlay: 0
      patternSize: natural
  - _component: page-sections/explainers/feature-split
    sectionLabel: ''
    eyebrow: Page building
    heading: Pages are lists of sections
    headingLevel: h2
    subtext: Stack sections in a Markdown file and you have a page. They all draw
      from the same design tokens, so a quickly assembled is still visually
      cohesive. (This page is made up of eight sections.)
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Browse the full library
        hideText: false
        link: /component-docs/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    imageSource: /src/assets/images/component-docs/website-page-building.svg
    imageAlt: A section card being dragged from a component library into a dashed
      drop slot on a page assembled from stacked sections
    imageAspectRatio: none
    imageRounded: false
    imageBleed: false
    reverse: false
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
  - _component: page-sections/collections/card-collection
    sectionLabel: ''
    eyebrow: Examples
    heading: See it put together
    headingLevel: h2
    subtext: Four template pages built from the same library. Copy one as a starting
      point, or [browse the full set](/examples/).
    items:
      - image: /src/assets/images/component-docs/website-example-pricing.svg
        imageAlt: Three pricing plan cards with a highlighted middle tier
        link: /examples/pricing/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Pricing
            level: h3
            size: xs
            alignmentHorizontal: start
            iconColor: default
            iconPosition: before
          - _component: building-blocks/core-elements/simple-text
            text: Care plans, a comparison table, and billing FAQ.
            size: sm
      - image: /src/assets/images/component-docs/website-example-about.svg
        imageAlt: An about page with a hero, a timeline, and a team card
        link: /examples/about/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: About
            level: h3
            size: xs
            alignmentHorizontal: start
            iconColor: default
            iconPosition: before
          - _component: building-blocks/core-elements/simple-text
            text: Story, values, timeline, team, and posts from the demo blog.
            size: sm
      - image: /src/assets/images/component-docs/website-example-services.svg
        imageAlt: Service cards above process steps and a customer quote
        link: /examples/services/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Services
            level: h3
            size: xs
            alignmentHorizontal: start
            iconColor: default
            iconPosition: before
          - _component: building-blocks/core-elements/simple-text
            text: Services, tabbed engagement detail, a process, and an FAQ.
            size: sm
      - image: /src/assets/images/component-docs/website-example-portfolio.svg
        imageAlt: A masonry image gallery with a featured tile and caption
        link: /examples/portfolio/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Portfolio
            level: h3
            size: xs
            alignmentHorizontal: start
            iconColor: default
            iconPosition: before
          - _component: building-blocks/core-elements/simple-text
            text: A case study, client sites, results, and a photo gallery.
            size: sm
    layout: grid
    columns: 4
    gap: lg
    aspectRatio: landscape
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
  - _component: page-sections/explainers/feature-grid
    sectionLabel: ''
    eyebrow: Principles
    heading: Choices that age well
    headingLevel: h2
    subtext: No trends. No noise. Just reliability.
    alignmentHorizontal: center
    features:
      - title: Web fundamentals
        description: Semantic HTML, lean CSS, and JavaScript only when it's needed. It's
          boring by design, which is exactly why it works.
        iconName: box
        iconColor: blue
        iconBackground: true
      - title: Built for speed
        description: Static-rendered, minimal payloads, zero waste. Built to be
          extremely fast from the first byte.
        iconName: zap
        iconColor: yellow
        iconBackground: true
      - title: Everything just fits
        description: Small, predictable components that snap together cleanly, so bigger
          pieces never become a maintenance mess.
        iconName: puzzle
        iconColor: green
        iconBackground: true
      - title: Controlled editing
        description: Enough freedom for editors to move fast. Enough structure for
          developers to sleep at night.
        iconName: pencil
        iconColor: purple
        iconBackground: true
      - title: Adaptable
        description: Deliberately plain styling that takes on your design without a fight.
        iconName: paintbrush
        iconColor: pink
        iconBackground: true
      - title: AI ready
        description: Everything is a file in the repo, so agents build with full
          context. Skills for the common jobs come included.
        iconName: sparkles
        iconColor: cyan
        iconBackground: true
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: surface
    background:
      type: pattern
      imageSource: /src/assets/images/component-docs/pattern-dot-grid.svg
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: frame
      overlay: 0
      patternSize: natural
  - _component: page-sections/explainers/steps-section
    sectionLabel: ''
    eyebrow: How it works
    heading: Clone, rebrand, assemble, ship
    headingLevel: h2
    subtext: Four steps from a blank folder to a live site.
    items:
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Clone
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: 'One command scaffolds a working site: `npx create-astro-component-starter
              my-site`.'
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Rebrand
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: Change `--color-brand` in the light and dark theme files. Every component
              follows.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Assemble
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: "Add `- _component: page-sections/heroes/hero-center` to a page. That's a
              section."
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Ship
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: Run `npm run build` and deploy `dist/` to any host. Nothing to patch,
              nothing to babysit.
            size: sm
    orientation: horizontal
    imageAspectRatio: landscape
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
  - _component: page-sections/conversion/cta-center
    sectionLabel: ''
    heading: Every file is yours
    headingLevel: h2
    subtext: 'Built at CloudCannon, MIT licensed, and the repo is the whole site:
      pages, blog, docs, and every component.'
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Get started
        hideText: false
        link: /start/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: View on GitHub
        hideText: false
        link: https://github.com/CloudCannon/astro-component-starter
        iconName: social/github
        iconColor: default
        iconPosition: before
        variant: tertiary
        size: md
    maxContentWidth: lg
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: dark
    lockColorScheme: true
    backgroundColor: surface
    background:
      type: pattern
      imageSource: /src/assets/images/component-docs/pattern-grid.svg
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: frame
      overlay: 0
      patternSize: natural
---
