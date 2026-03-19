---
title: Primary Bento Box
spacing: 'all'
blocks:
  _component: building-blocks/wrappers/bento-box
  columns: 3
  minRowHeight: 180
  items:
    - colSpan: 2
      rowSpan: 1
      contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Featured
              level: h3
            - _component: building-blocks/core-elements/text
              text: Spans two columns for a wide, prominent placement.
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
              text: Tall
              level: h3
            - _component: building-blocks/core-elements/text
              text: Spans two rows, creating a vertical emphasis alongside smaller items.
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
              text: Item 3
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
              text: Item 4
              level: h3
  label: ''
  gap: md
---
