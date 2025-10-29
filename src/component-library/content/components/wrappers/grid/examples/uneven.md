---
title: Uneven Columns Layout
spacing:
blocks:
  _component: "wrappers/grid"
  layout: uneven
  minItemWidth: 0
  maxItemWidth: 320
  items:
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Short"
              level: h3
            - _component: "typography/simple-text"
              text: "Short content."
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Medium"
              level: h3
            - _component: "typography/simple-text"
              text: "This card is a little longer."
    - contentBlocks:
        - _component: "wrappers/card"
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentBlocks:
            - _component: "typography/heading"
              text: "Much Longer Card"
              level: h3
            - _component: "typography/simple-text"
              text: "This card demonstrates how the uneven-columns layout handles longer content."
---
