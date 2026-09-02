---
_schema: default
title: Examples
description: >-
  Template pages you can copy: pricing, about, services, portfolio, contact,
  and a demo blog. Labeled examples, not the starter's own product pages.
pageSections:
  - _component: page-sections/collections/card-collection
    eyebrow: ''
    heading: The set
    subtext: Each page hangs together as one design, not a gallery of widgets.
    items:
      - image: /src/assets/images/component-docs/castle.jpg
        imageAlt: Stone castle under a night sky
        link: /examples/pricing/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Pricing
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Plan cards, a comparison table, and billing FAQ.
            size: sm
      - image: /src/assets/images/component-docs/sunset.jpg
        imageAlt: Coastal cliffs at dusk
        link: /examples/about/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: About
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Story, timeline, team, and a quote, plus latest posts from the demo blog.
            size: sm
      - image: /src/assets/images/component-docs/dunedin-cliff.jpg
        imageAlt: Sea cliffs above a bay
        link: /examples/services/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Services
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Service cards, a process, client marks, and a wall of quotes.
            size: sm
      - image: /src/assets/images/component-docs/sheep.jpg
        imageAlt: Sheep grazing on a headland
        link: /examples/portfolio/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Portfolio
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Image gallery, featured-project slider, and a contact split.
            size: sm
      - image: /src/assets/images/component-docs/quiet-street.jpg
        imageAlt: Quiet hillside street
        link: /examples/contact/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Contact
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Details beside a form, a typical contact page.
            size: sm
      - image: /src/assets/images/component-docs/castle.jpg
        imageAlt: Stone castle under a night sky
        link: /blog/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Blog
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Listing page and demo posts. Bodies stay placeholder Latin on purpose.
            size: sm
    layout: grid
    columns: 3
    gap: lg
    aspectRatio: landscape
    colorScheme: inherit
    backgroundColor: base
---
