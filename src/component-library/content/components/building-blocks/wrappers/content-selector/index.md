---
title: Content Selector
overview: 'Displays multiple content panels within a tabbed interface. Each item includes a title and content area. Supports configurable tab navigation positions (top or start).'
slots:
  - title: default
    description: The content panels inside the selector.
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
