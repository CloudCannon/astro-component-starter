---
title: 4 Columns
spacing: 'all'
blocks:
  _component: building-blocks/wrappers/bento-box
  columns: 4
  minRowHeight: 180
  items:
    - colSpan: 2
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Wide Item
          level: h3
        - _component: building-blocks/core-elements/text
          text: This item spans two columns in a four-column bento layout.
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
          text: A compact item.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Item 5
          level: h3
        - _component: building-blocks/core-elements/text
          text: Another compact item.
    - colSpan: 2
      rowSpan: 1
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Bottom Wide Item
          level: h3
        - _component: building-blocks/core-elements/text
          text: A wide item at the bottom of the bento layout.
  label: ''
  gap: md
---
