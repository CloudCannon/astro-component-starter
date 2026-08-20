---
title: List
overview: A list with icons, bullets, or numbers. Layout can be vertical or horizontal.
slots:
  - title: default
    description: The content inside the List.
    child_component:
      props:
        - iconName
        - iconColor
        - showIcon
        - link
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
    title: Icon colors
  - slugs:
      - item-links
    title: Linked items
---
