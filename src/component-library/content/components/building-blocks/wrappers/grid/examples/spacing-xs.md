---
title: Extra Small Spacing
spacing:
blocks:
  _component: "building-blocks/wrappers/grid"
  layout: center
  gap: xs
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
              text: "Extra small spacing creates tight, compact layouts."
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
              text: "Perfect for dense information displays."
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
              text: "Minimal gaps between grid items."
---
