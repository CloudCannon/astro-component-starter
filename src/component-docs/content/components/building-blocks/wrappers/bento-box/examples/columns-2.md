---
title: 2 Columns
spacing: 'all'
blocks:
  _component: building-blocks/wrappers/bento-box
  columns: 2
  minRowHeight: 200
  items:
    - colSpan: 2
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Wide Item
          level: h3
        - _component: building-blocks/core-elements/text
          text: This item spans the full width of a two-column bento layout.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Item 2
          level: h3
        - _component: building-blocks/core-elements/text
          text: A half-width item in the two-column layout.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Item 3
          level: h3
        - _component: building-blocks/core-elements/text
          text: Another half-width item alongside Item 2.
  label: ''
  gap: md
---
