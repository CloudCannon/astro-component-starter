---
title: Primary Masonry
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
              text: Short Item
              level: h3
            - _component: building-blocks/core-elements/text
              text: A compact card in the masonry layout.
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: accent
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Tall Item
              level: h3
            - _component: building-blocks/core-elements/text
              text: This card has more content, making it taller than its neighbors. The masonry layout places items in columns, filling vertical space efficiently without leaving gaps.
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Medium Item
              level: h3
            - _component: building-blocks/core-elements/text
              text: A mid-height card that fits neatly into the column flow.
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Another Tall Item
              level: h3
            - _component: building-blocks/core-elements/text
              text: Items naturally flow into the shortest column, creating an organic, staggered arrangement. This avoids the uniform row heights of a traditional grid.
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Compact
              level: h3
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          backgroundColor: surface
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: Item 6
              level: h3
            - _component: building-blocks/core-elements/text
              text: The last item in this example, filling the remaining column space.
  label: ''
  gap: md
---
