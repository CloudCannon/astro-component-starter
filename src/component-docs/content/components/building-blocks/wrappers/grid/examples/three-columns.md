---
title: Three Columns
spacing:
blocks:
  _component: 'building-blocks/wrappers/grid'
  columns: 3
  items:
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 'Feature One'
              level: h3
            - _component: building-blocks/core-elements/text
              text: 'Pick a column count and every row lines up to the same lattice.'
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 'Feature Two'
              level: h3
            - _component: building-blocks/core-elements/text
              text: 'Items are centered if there is extra whitespace.'
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 'Feature Three'
              level: h3
            - _component: building-blocks/core-elements/text
              text: 'Numbered columns collapse to a single column below 640px, the same behavior as Card Grid.'
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 'Feature Four'
              level: h3
            - _component: building-blocks/core-elements/text
              text: "You can make it more flexible by using different min/max widths, but keep in mind the last row might be larger if there's an uneven number of items."
---
