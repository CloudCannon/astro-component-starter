---
title: Card Grid
overview: "An exact-column row of cards — cover, optional tile link, and an open `contentSections` body. Grid mode is N columns above 640px (one below), not [Grid](/component-docs/components/building-blocks/wrappers/grid/)'s auto-fit. Masonry mode composes the [Masonry](/component-docs/components/building-blocks/wrappers/masonry/) wrapper and keeps each cover's own shape. [Card Collection](/component-docs/components/page-sections/collections/card-collection/), [Latest Posts](/component-docs/components/page-sections/collections/latest-posts/), and [Team Grid](/component-docs/components/page-sections/collections/team-grid/) are heading chrome around this wrapper. Do not use [Card](/component-docs/components/building-blocks/wrappers/card/)'s `link` here: that wraps the whole inner in an `<a>`, so a nested badge link would be invalid HTML."
slots:
  - title: default
    description: The cards in the grid. Pass `items` or slot CardGridItem children (Team Grid does this so name, role, and bio stay their own fields).
examples:
  - slugs: [masonry]
---
