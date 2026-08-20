---
title: Bento Box
order: 8
overview: A grid where items can span more than one column or row, for uneven magazine-style layouts. Set columns, spacing, and row height.
slots:
  - title: default
    description: The contents for the Bento Box.
    child_component:
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
