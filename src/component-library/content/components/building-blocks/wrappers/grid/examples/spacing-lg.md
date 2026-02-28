---
title: Large Spacing
spacing:
blocks:
  _component: "building-blocks/wrappers/grid"
  layout: center
  gap: lg
  minItemWidth: 200
  maxItemWidth: 300
  items:
    - contentSections:
        - _component: "building-blocks/wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: "building-blocks/core-elements/heading"
              text: "Item 1"
              level: h3
            - _component: "building-blocks/core-elements/text"
              text: "Large spacing creates more visual separation."
    - contentSections:
        - _component: "building-blocks/wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: "building-blocks/core-elements/heading"
              text: "Item 2"
              level: h3
            - _component: "building-blocks/core-elements/text"
              text: "Good for emphasizing individual items."
    - contentSections:
        - _component: "building-blocks/wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: "building-blocks/core-elements/heading"
              text: "Item 3"
              level: h3
            - _component: "building-blocks/core-elements/text"
              text: "Helps create a more spacious, airy feel."
---
