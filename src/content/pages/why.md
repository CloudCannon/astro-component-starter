---
_schema: default
title: Why
description: >-
  Why this Astro component starter was built, and how it helps teams ship fast,
  editable static sites.
pageSections:
  - _component: page-sections/heroes/page-header
    eyebrow: ''
    heading: Why this starter exists
    subtext: >-
      Foundations for Astro components that output static HTML and CSS — unbranded,
      adaptable, and ready for visual editing.
    showBreadcrumbs: true
    alignmentHorizontal: start
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/heroes/hero-split
    headingLevel: h2
    eyebrow: Built at CloudCannon
    heading: For teams who ship real client sites
    subtext: >-
      At CloudCannon, we're big fans of the static web. And we love what the
      Astro team is building.


      As more [partner agencies](https://cloudcannon.com/partner-program/)
      build client sites with CloudCannon, we wanted foundations for Astro
      components that output static HTML and CSS — the fastest delivery
      possible, all unbranded and adaptable for any project.
    imageSource: /src/assets/images/component-docs/sunset.jpg
    imageAlt: Coastal cliffs at dusk
    imageAspectRatio: portrait
    buttonSections: []
    reverse: true
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/builders/custom-section
    label: Scroll deck demo
    contentSections:
      - _component: building-blocks/wrappers/scroll-deck
        label: ''
        stickyOffset: md
        cardColorScheme: light
        showRail: true
        cards:
          - _component: building-blocks/wrappers/scroll-deck/scroll-deck-card
            label: Build
            contentSections:
              - _component: building-blocks/core-elements/heading
                text: Build the page from blocks
                level: h3
                size: xl
              - _component: building-blocks/core-elements/text
                text: Every section in the library is a block an editor can drop in, reorder, and fill.
              - _component: building-blocks/wrappers/button-group
                buttonSections:
                  - _component: building-blocks/core-elements/button
                    text: See the library
                    link: /component-docs/
                    variant: primary
          - _component: building-blocks/wrappers/scroll-deck/scroll-deck-card
            label: Brand
            contentSections:
              - _component: building-blocks/core-elements/heading
                text: Set the brand in one file
                level: h3
                size: xl
              - _component: building-blocks/core-elements/text
                text: Colors, type and spacing are tokens. Change them once and every block follows.
              - _component: building-blocks/wrappers/button-group
                buttonSections:
                  - _component: building-blocks/core-elements/button
                    text: Read about theming
                    link: /component-docs/
                    variant: secondary
          - _component: building-blocks/wrappers/scroll-deck/scroll-deck-card
            label: Ship
            contentSections:
              - _component: building-blocks/core-elements/heading
                text: Hand it over and ship
                level: h3
                size: xl
              - _component: building-blocks/core-elements/text
                text: The team edits real pages in the browser, inside the guardrails you shipped.
              - _component: building-blocks/wrappers/button-group
                buttonSections:
                  - _component: building-blocks/core-elements/button
                    text: Get started
                    link: /start/
                    variant: primary
    maxContentWidth: lg
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    backgroundColor: surface
    rounded: false
  - _component: page-sections/explainers/timeline-section
    eyebrow: History
    heading: How the starter grew
    subtext: The public releases, not a fictional company story.
    layout: vertical
    entries:
      - year: ''
        date: '2025'
        title: First public starter
        body: >-
          CloudCannon published an Astro component starter for partner agencies
          building client sites — unbranded, static, and visually editable.
      - year: '2026'
        date: March
        title: '1.0'
        body: >-
          Theme toggle, blog tags, shared section chrome, and the component
          patterns the 1.x sites still run on.
      - year: '2026'
        date: August
        title: '2.0'
        body: >-
          A browsable reference for every component, a gallery and builder, and
          a much larger library of page sections — stats, steps, pricing,
          galleries, and more.
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/builders/custom-section
    label: Scroll stepper demo
    contentSections:
      - _component: building-blocks/wrappers/scroll-stepper
        label: ''
        steps:
          - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
            mediaSections:
              - _component: building-blocks/core-elements/image
                source: /src/assets/images/component-docs/castle.jpg
                alt: A stone castle on a hillside
                rounded: true
                aspectRatio: landscape
            contentSections:
              - _component: building-blocks/core-elements/simple-text
                text: Step one
                size: sm
              - _component: building-blocks/core-elements/heading
                text: Build visually
                level: h3
                size: lg
              - _component: building-blocks/core-elements/text
                text: Start with the pieces of the page and shape the first draft in the editor.
          - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
            mediaSections:
              - _component: building-blocks/core-elements/image
                source: /src/assets/images/component-docs/dunedin-cliff.jpg
                alt: Sea cliffs above a bay
                rounded: true
                aspectRatio: landscape
            contentSections:
              - _component: building-blocks/core-elements/simple-text
                text: Step two
                size: sm
              - _component: building-blocks/core-elements/heading
                text: Make it yours
                level: h3
                size: lg
              - _component: building-blocks/core-elements/text
                text: Set the brand, arrange the content, and share a preview with the people reviewing it.
          - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
            mediaSections:
              - _component: building-blocks/core-elements/image
                source: /src/assets/images/component-docs/sheep.jpg
                alt: Sheep grazing on a green hillside
                rounded: true
                aspectRatio: landscape
            contentSections:
              - _component: building-blocks/core-elements/simple-text
                text: Step three
                size: sm
              - _component: building-blocks/core-elements/heading
                text: Publish with confidence
                level: h3
                size: lg
              - _component: building-blocks/core-elements/text
                text: Finish the page and ship the same polished experience your reviewers approved.
        mediaWidth: half
        reverse: false
        mediaAspectRatio: none
        progressStyle: bar
        stepHeight: content
        gap: 2xl
        spaceBefore: default
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    backgroundColor: base
    rounded: false
  - _component: page-sections/builders/custom-section
    label: ''
    contentSections:
      - _component: building-blocks/core-elements/heading
        text: What you actually get
        level: h2
        size: default
        alignmentHorizontal: center
        iconName:
        iconColor: default
        iconPosition: before
      - _component: building-blocks/core-elements/simple-text
        text: Four pieces. Nothing hiding behind a private package.
        alignmentHorizontal: center
        size: md
      - _component: building-blocks/wrappers/bento-box
        label: ''
        columns: '2'
        minRowHeight: 150
        gap: md
        items:
          - colSpan: '1'
            rowSpan: '1'
            contentSections:
              - _component: building-blocks/core-elements/icon
                name: pencil
                size: lg
                color: purple
                background: true
                alignmentHorizontal: start
              - _component: building-blocks/core-elements/heading
                text: Visual editing
                level: h3
                size: xs
                alignmentHorizontal: start
                iconName:
                iconColor: default
                iconPosition: before
              - _component: building-blocks/core-elements/simple-text
                text: >-
                  Every component ships its CloudCannon schema beside it. Add a
                  section and it appears in the editor.
                alignmentHorizontal: start
                size: sm
          - colSpan: '1'
            rowSpan: '1'
            contentSections:
              - _component: building-blocks/core-elements/icon
                name: paint-brush
                size: lg
                color: pink
                background: true
                alignmentHorizontal: start
              - _component: building-blocks/core-elements/heading
                text: Design tokens
                level: h3
                size: xs
                alignmentHorizontal: start
                iconName:
                iconColor: default
                iconPosition: before
              - _component: building-blocks/core-elements/simple-text
                text: >-
                  Colors, type, spacing, and radius live in token files. Rebrand
                  without fighting component CSS.
                alignmentHorizontal: start
                size: sm
          - colSpan: '1'
            rowSpan: '1'
            contentSections:
              - _component: building-blocks/core-elements/icon
                name: bolt
                size: lg
                color: yellow
                background: true
                alignmentHorizontal: start
              - _component: building-blocks/core-elements/heading
                text: Static output
                level: h3
                size: xs
                alignmentHorizontal: start
                iconName:
                iconColor: default
                iconPosition: before
              - _component: building-blocks/core-elements/simple-text
                text: >-
                  Pages render to HTML and CSS. JavaScript only when CSS can't
                  do the job.
                alignmentHorizontal: start
                size: sm
          - colSpan: '1'
            rowSpan: '1'
            contentSections:
              - _component: building-blocks/core-elements/icon
                name: cube
                size: lg
                color: blue
                background: true
                alignmentHorizontal: start
              - _component: building-blocks/core-elements/heading
                text: Agent skills
                level: h3
                size: xs
                alignmentHorizontal: start
                iconName:
                iconColor: default
                iconPosition: before
              - _component: building-blocks/core-elements/simple-text
                text: >-
                  Playbooks in `.agents/skills/` for creating components,
                  retheming, and migrating a site.
                alignmentHorizontal: start
                size: sm
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    backgroundColor: base
    rounded: false
  - _component: page-sections/explainers/faq-section
    heading: Frequently asked questions
    items:
      - title: What is this, really?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              A starter you clone and own. There is no private component package
              to version. [Browse the library](/component-docs/) to see what
              ships.
            size: md
      - title: Do I need CloudCannon?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              No. The site is plain Astro. CloudCannon is how editors work
              visually — every component is born with that schema, so you don't
              add it later.
            size: md
      - title: Can I delete components I don't need?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Yes. Delete the component directory. The page builder only offers
              what is on disk.
            size: md
      - title: How do I make it look like our brand?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Start with [Customizing your
              brand](/component-docs/customizing-your-brand/). Tokens, not
              per-component CSS.
            size: md
    maxContentWidth: xl
    paddingHorizontal: xl
    paddingVertical: 4xl
    colorScheme: inherit
    backgroundColor: surface
---
