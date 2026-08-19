---
title: Masonry
overview: 'A masonry (Pinterest-style) column layout for mixed-height content — reviews, cards, notes — that keeps reading order: items flow left-to-right into the shortest column, top-to-bottom. Tiles are pure layout; nest a [Card](/component-docs/components/building-blocks/wrappers/card/) inside an item for chrome. Without JavaScript the layout falls back to CSS columns, where reading order runs down each column instead; browsers with native CSS masonry use it directly. For photo grids with a lightbox, use [Gallery Grid](/component-docs/components/page-sections/collections/gallery-grid/) instead.'
slots:
  - title: default
    description: The tiles in the masonry.
    child_component:
      props:
        - 'contentSections/slot'
examples:
  - title: Columns
    slugs:
      - columns-2
      - columns-3
      - columns-4
      - columns-5
  - title: Gaps
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
