---
title: Small Spacing
spacing:
blocks:
  _component: "building-blocks/wrappers/grid"
  layout: center
  gap: sm
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
              text: "Small spacing provides subtle separation."
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
              text: "Good for related content groups."
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
              text: "Maintains visual connection between items."
---
