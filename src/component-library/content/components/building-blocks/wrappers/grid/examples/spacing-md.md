---
title: Medium Spacing
spacing:
blocks:
  _component: "building-blocks/wrappers/grid"
  layout: center
  gap: md
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
              text: "Medium spacing is the default option."
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
              text: "Provides balanced visual breathing room."
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
              text: "Works well for most content layouts."
---
