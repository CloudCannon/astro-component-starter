---
title: Masonry
order: 9
overview: 'A column-based layout where items flow into columns with varying heights, creating a Pinterest-style arrangement. Supports configurable columns and spacing.'
slots:
  - title: default
    description: The contents for the Masonry layout.
    fallback_for: items
    child_component:
      name: MasonryItem
      props:
        - 'contentSections/slot'
examples:
  - title: Columns
    slugs:
      - columns-2
      - columns-3
      - columns-4

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
