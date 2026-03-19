---
title: Row Spanning
spacing: 'all'
blocks:
  _component: building-blocks/wrappers/bento-box
  columns: 3
  minRowHeight: 150
  items:
    - colSpan: 1
      rowSpan: 2
      contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: accent
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 2 Rows
              level: h3
            - _component: building-blocks/core-elements/text
              text: This item spans two rows on the left side.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Top Middle
              level: h3
    - colSpan: 1
      rowSpan: 3
      contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: highlight
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 3 Rows
              level: h3
            - _component: building-blocks/core-elements/text
              text: This item spans three full rows on the right side of the grid.
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Bottom Middle
              level: h3
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Below Left
              level: h3
    - colSpan: 1
      rowSpan: 1
      contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Below Middle
              level: h3
  label: ''
  gap: md
---
