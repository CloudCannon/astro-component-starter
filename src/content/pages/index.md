---
_schema: default
title: Home
description: >-
  A library of brandable page sections for Astro, visually editable in
  CloudCannon. Clone it, swap the design tokens, and ship a static site.
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
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    colorScheme: inherit
    backgroundColor: base
    background:
      type: pattern
      patternSize: natural
      imageSource: /src/assets/images/component-docs/pattern-plus.svg
      mask: frame
      overlay: 0
  - _component: page-sections/explainers/feature-split
    eyebrow: Visual editing
    heading: Edit on the page. Commit to the repo.
    subtext: >-
      Click a heading and type, drag sections into a new order, or add new
      ones from the library. Every edit lands in the same Markdown files
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
    imageAlt: >-
      A heading being edited on a webpage, with the change arriving as a
      highlighted line and a commit in a Markdown file
    imageAspectRatio: none
    imageRounded: false
    reverse: true
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/stats
    eyebrow: What's in the box
    heading: Big library. Tiny payload.
    subtext: Every component renders to static HTML and CSS.
    stats:
      - number: 24
        prefix: ''
        suffix: ''
        label: Page sections
        sublabel: Heroes to pricing tables
      - number: 47
        prefix: ''
        suffix: ''
        label: Building blocks
        sublabel: Buttons to bento boxes
      - number: 343
        prefix: ''
        suffix: ''
        label: Icons
        sublabel: Ready in the picker
      - number: 0
        prefix: ''
        suffix: ' KB'
        label: Runtime JavaScript
        sublabel: On most sections
    dividers: true
    colorScheme: inherit
    backgroundColor: surface
    background:
      type: pattern
      patternSize: natural
      imageSource: /src/assets/images/component-docs/pattern-dot-grid.svg
      mask: frame
      overlay: 0
  - _component: page-sections/explainers/feature-split
    eyebrow: Page building
    heading: Pages are lists of sections
    subtext: >-
      Stack sections in a Markdown file and you have a page. They all draw
      from the same design tokens, so a page assembled in an afternoon still
      reads as one site. This page is eight of them.
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
    imageAlt: >-
      A section card being dragged from a component library into a dashed drop
      slot on a page assembled from stacked sections
    imageAspectRatio: none
    imageRounded: false
    reverse: false
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/collections/card-collection
    eyebrow: Examples
    heading: See it put together
    subtext: >-
      Four template pages built from the same library. Copy one as a starting
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
          - _component: building-blocks/core-elements/simple-text
            text: Plan cards, a comparison table, and billing FAQ.
            size: sm
      - image: /src/assets/images/component-docs/website-example-about.svg
        imageAlt: An about page with a hero, a timeline, and a team card
        link: /examples/about/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: About
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Story, timeline, team, and latest posts from the demo blog.
            size: sm
      - image: /src/assets/images/component-docs/website-example-services.svg
        imageAlt: Service cards above process steps and a customer quote
        link: /examples/services/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Services
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Service cards, a process, client marks, and a wall of quotes.
            size: sm
      - image: /src/assets/images/component-docs/website-example-portfolio.svg
        imageAlt: A masonry image gallery with a featured tile and caption
        link: /examples/portfolio/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Portfolio
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Image gallery, featured-project slider, and a contact split.
            size: sm
    layout: grid
    columns: 4
    gap: lg
    aspectRatio: landscape
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/feature-grid
    eyebrow: Principles
    heading: Choices that age well
    subtext: No trends. No noise. Just reliability.
    features:
      - title: Web fundamentals
        description: >-
          Semantic HTML, lean CSS, and JavaScript only when it's needed.
          Boring by design, which is exactly why it works.
        iconName: cube
        iconColor: blue
      - title: Built for speed
        description: >-
          Static-rendered, minimal payloads, zero waste. Built to be extremely
          fast from the first byte.
        iconName: bolt
        iconColor: yellow
      - title: Everything just fits
        description: >-
          Small, predictable components that snap together cleanly, so bigger
          pieces never become a maintenance mess.
        iconName: puzzle-piece
        iconColor: green
      - title: Controlled editing
        description: >-
          Enough freedom for editors to move fast. Enough structure for
          developers to sleep at night.
        iconName: pencil
        iconColor: purple
      - title: Adaptable
        description: >-
          Deliberately plain styling that takes on your design without a
          fight.
        iconName: paint-brush
        iconColor: pink
      - title: AI ready
        description: >-
          Everything is a file in the repo, so agents build with full context.
          Skills for the common jobs come included.
        iconName: sparkles
        iconColor: cyan
    colorScheme: inherit
    backgroundColor: surface
    background:
      type: pattern
      patternSize: natural
      imageSource: /src/assets/images/component-docs/pattern-dot-grid.svg
      mask: frame
      overlay: 0
    alignmentHorizontal: center
  - _component: page-sections/explainers/steps
    eyebrow: How it works
    heading: Clone, rebrand, assemble, ship
    subtext: Four steps from a blank folder to a live site.
    items:
      - contentSections:
          - _component: building-blocks/core-elements/heading
            text: Clone
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: 'One command scaffolds a working site: `npx create-astro-component-starter my-site`.'
            size: sm
      - contentSections:
          - _component: building-blocks/core-elements/heading
            text: Rebrand
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: Change `--color-brand` in one token file. Every component follows.
            size: sm
      - contentSections:
          - _component: building-blocks/core-elements/heading
            text: Assemble
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: "Add `- _component: page-sections/heroes/hero-center` to a page. That's a section."
            size: sm
      - contentSections:
          - _component: building-blocks/core-elements/heading
            text: Ship
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: Run `npm run build` and deploy `dist/` to any host. Nothing to patch, nothing to babysit.
            size: sm
    orientation: horizontal
    imageAspectRatio: landscape
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/conversion/cta-center
    heading: Every file is yours
    subtext: >-
      Built at CloudCannon, MIT licensed, and the clone is the whole site:
      pages, blog, docs, and every component.
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
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: tertiary
        size: md
    colorScheme: dark
    backgroundColor: surface
    background:
      type: pattern
      patternSize: natural
      imageSource: /src/assets/images/component-docs/pattern-grid.svg
      mask: frame
      overlay: 0
    rounded: false
---
