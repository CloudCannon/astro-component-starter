---
title: 'Text-only cards, two columns'
spacing: null
blocks:
  _component: 'page-sections/collections/card-collection'
  heading: 'Documentation'
  subtext: 'Cards without a cover image fall back to a badge, heading, and description — add a date or anything else.'
  layout: grid
  columns: 2
  items:
    - link: '#'
      contentSections:
        - _component: building-blocks/core-elements/badge
          text: Guide
          variant: plain
          size: sm
          showArrow: false
        - _component: building-blocks/core-elements/heading
          text: Getting started
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: 15 October 2025
          size: sm
        - _component: building-blocks/core-elements/simple-text
          text: Install the starter, run the dev server, and publish your first page.
          size: sm
    - link: '#'
      contentSections:
        - _component: building-blocks/core-elements/badge
          text: Guide
          variant: plain
          size: sm
          showArrow: false
        - _component: building-blocks/core-elements/heading
          text: Theming
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: Change the tokens every component inherits — colors, spacing, type scale.
          size: sm
    - link: '#'
      contentSections:
        - _component: building-blocks/core-elements/badge
          text: Reference
          variant: plain
          size: sm
          showArrow: false
        - _component: building-blocks/core-elements/heading
          text: Component library
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: Every page section and building block, with props and live examples.
          size: sm
    - link: '#'
      contentSections:
        - _component: building-blocks/core-elements/badge
          text: Reference
          variant: plain
          size: sm
          showArrow: false
        - _component: building-blocks/core-elements/heading
          text: Deployment
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: Take the site live on CloudCannon, including redirects and search.
          size: sm
---
