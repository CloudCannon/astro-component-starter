---
title: Grid
order: 4
overview: 'A responsive grid layout for displaying multiple items in rows and columns. Supports adjustable spacing, layouts, and width bounds.'
slots:
  - title: default
    description: The contents for the the Grid.
    fallback_for: items
    child_component:
      name: GridItem
      props:
        - 'contentSections/slot'
examples:
  - title: Layouts
    slugs:
      - start
      - center

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
