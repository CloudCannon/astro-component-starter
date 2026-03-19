---
title: 2 Columns
spacing: 'all'
blocks:
  _component: building-blocks/wrappers/masonry
  columns: 2
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
              text: A two-column masonry layout works well for wider content areas.
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
              text: This taller item demonstrates how the masonry layout fills columns without forcing uniform row heights. Content flows naturally.
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
            - _component: building-blocks/core-elements/text
              text: A shorter item that tucks in below the first.
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
  label: ''
  gap: md
---
