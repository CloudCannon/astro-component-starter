---
title: Center Layout
spacing:
blocks:
  _component: 'building-blocks/wrappers/grid'
  layout: center
  minItemWidth: 350
  maxItemWidth: 350
  items:
    - contentSections:
        - paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - text: 'Feature One'
              level: h3
            - text: 'The center-aligned layout sizes items within the min/max width provided.'
    - contentSections:
        - paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - text: 'Feature Two'
              level: h3
            - text: 'Items are centered if there is extra whitespace.'
    - contentSections:
        - paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - text: 'Feature Three'
              level: h3
            - text: 'You can ensure all items are always equal in a center-aligned layout by giving it the same value for min and max width.'
    - contentSections:
        - paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - text: 'Feature Four'
              level: h3
            - text: "You can make it more flexible by using different min/max widths, but keep in mind the last row might be larger if there's an uneven number of items."
---
