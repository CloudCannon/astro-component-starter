---
title: Start Aligned Layout
spacing:
blocks:
  _component: "wrappers/grid"
  layout: start
  minItemWidth: 200
  maxItemWidth: 300
  items:
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Item 1"
              level: h3
            - _component: "typography/simple-text"
              text: "The start-aligned layout uses CSS Grid to pack as many items as possible per row while respecting minimum width constraints."
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Item 2"
              level: h3
            - _component: "typography/simple-text"
              text: "Perfect for image galleries, portfolio items, or any content where you want to maximize space utilization."
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Item 3"
              level: h3
            - _component: "typography/simple-text"
              text: "Items stretch to fill their grid cells and align to the start horizontally for a clean, organized appearance."
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Item 4"
              level: h3
            - _component: "typography/simple-text"
              text: "Each item maintains consistent sizing within the min width constraints while maximizing items per row."
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Item 5"
              level: h3
            - _component: "typography/simple-text"
              text: "It's great for showcasing multiple items like products, blog posts, team members, or portfolio pieces in a grid format."
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Item 6"
              level: h3
            - _component: "typography/simple-text"
              text: "It adapts to different screen sizes while maintaining alignment between grid items."
---
