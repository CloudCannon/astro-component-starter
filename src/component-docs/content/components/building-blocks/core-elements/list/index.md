---
title: List
overview: 'Displays a list with icons, bullets, or numbers as markers. Supports vertical or horizontal layouts, custom styling, alignment, and markdown formatting.'
slots:
  - title: default
    description: The content inside the List.
    fallback_for: items
    child_component:
      name: ListItem
      props:
        - iconName
        - iconColor
        - showIcon
        - text/slot
examples:
  - slugs:
      - type-icon
      - type-bullet
      - type-numbered
    title: List Types
  - slugs:
      - direction-vertical
      - direction-horizontal
      - direction-horizontal-bullet
      - direction-horizontal-numbered
    title: Directions
  - slugs:
      - alignment-start-vertical
      - alignment-center-vertical
      - alignment-end-vertical
      - alignment-start-horizontal
      - alignment-center-horizontal
      - alignment-end-horizontal
      - alignment-center-vertical-bullet
      - alignment-end-horizontal-numbered
    title: AlignX
  - slugs:
      - size-xs
      - size-sm
      - size-md
      - size-lg
      - size-xl
      - size-2xl
      - size-3xl
      - size-4xl
      - size-lg-numbered
      - size-3xl-bullet
    title: Sizes
  - slugs:
      - icon-colors
---
