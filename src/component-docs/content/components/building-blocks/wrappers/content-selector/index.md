---
title: Content Selector
overview: Tabs that switch between content panels. Navigation can sit at the top or the start.
slots:
  - title: default
    description: The tab items inside the selector.
    child_component:
      props:
        - title
        - contentSections/slot

examples:
  - title: 'Navigation Position'
    slugs:
      - navigation-position-top
      - navigation-position-start
    size: lg
  - title: 'Icon Colors'
    slugs:
      - icon-colors
    size: lg
---
