---
title: 3 Columns
spacing: 'all'
blocks:
  _component: building-blocks/wrappers/bento-box
  columns: 3
  minRowHeight: 200
  items:
    - colSpan: 2
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Featured Item
          level: h3
        - _component: building-blocks/core-elements/text
          text: This item spans two columns in a three-column bento layout.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Item 2
          level: h3
        - _component: building-blocks/core-elements/text
          text: A single-column item.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Item 3
          level: h3
        - _component: building-blocks/core-elements/text
          text: Another single-column item.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Item 4
          level: h3
        - _component: building-blocks/core-elements/text
          text: A third single-column item.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Item 5
          level: h3
        - _component: building-blocks/core-elements/text
          text: Fills the remaining space in the row.
  label: ''
  gap: md
---
