---
title: Bento Box
order: 8
overview: 'A grid layout where items can span multiple columns and rows, creating asymmetric, magazine-style arrangements. Supports configurable columns, spacing, and row height.'
slots:
  - title: default
    description: The contents for the Bento Box.
    fallback_for: items
    child_component:
      name: BentoBoxItem
      props:
        - 'contentSections/slot'
examples:
  - title: Columns
    slugs:
      - columns-2
      - columns-3
      - columns-4

  - title: Row Spanning
    slugs:
      - row-spanning

  - title: Spacing
    slugs:
      - spacing-xs
      - spacing-sm
      - spacing-md
      - spacing-lg
      - spacing-xl
      - spacing-2xl
      - spacing-3xl
---
