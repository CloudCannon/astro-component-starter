---
title: Content Selector
overview: 'Displays content panels in CSS-only tabs. Supports slot-based composition with `ContentSelectorPanel` children and `items` fallback, with navigation positions at top or start.'
slots:
  - title: default
    description: The tab items inside the selector.
    fallback_for: items
    child_component:
      name: ContentSelectorPanel
      props:
        - title
        - contentSections/slot

examples:
  - title: 'Navigation Position'
    slugs:
      - navigation-position-top
      - navigation-position-start
    size: lg
---
