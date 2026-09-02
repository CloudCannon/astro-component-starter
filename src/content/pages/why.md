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
  - _component: page-sections/explainers/timeline
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
