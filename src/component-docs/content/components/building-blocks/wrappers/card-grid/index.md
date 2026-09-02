---
title: Card Grid
overview: A row of cards with a set number of columns. Each card can have a cover, an optional link, and freeform content. Choose Grid or Masonry layout.
slots:
  - title: default
    description: The cards in the grid. Pass `items` or slot CardGridItem children (Team Grid does this so name, role, and bio stay their own fields).
    # Derivation would pick MasonryItem — the masonry branch's measurement
    # probe, imported from the masonry wrapper — not the real repeating child.
    child_component:
      name: CardGridItem
      props:
        - 'contentSections/slot'
examples:
  - title: Layout
    slugs:
      - layout-grid
      - layout-masonry
  - title: Cover Aspect Ratio
    slugs:
      - aspect-ratio-landscape
      - aspect-ratio-widescreen
      - aspect-ratio-square
      - aspect-ratio-portrait
      - aspect-ratio-none
  - title: Gap
    slugs:
      - gap-none
      - gap-xs
      - gap-sm
      - gap-md
      - gap-lg
      - gap-xl
      - gap-2xl
      - gap-3xl
---
