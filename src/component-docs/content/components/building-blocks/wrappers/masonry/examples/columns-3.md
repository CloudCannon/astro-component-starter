---
title: 3 Columns
spacing: 'all'
blocks:
  _component: building-blocks/wrappers/masonry
  columns: 3
  items:
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Item 1
              level: h3
            - _component: building-blocks/core-elements/text
              text: Three columns create a balanced masonry layout.
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Item 2
              level: h3
            - _component: building-blocks/core-elements/text
              text: A taller card that fills more vertical space in its column. The adjacent columns continue independently.
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Item 3
              level: h3
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Item 4
              level: h3
            - _component: building-blocks/core-elements/text
              text: Items flow top-to-bottom within each column.
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Item 5
              level: h3
            - _component: building-blocks/core-elements/text
              text: Fills the remaining space.
  label: ''
  gap: md
---
