---
title: 'No Spacing'
spacing:
blocks:
  _component: 'building-blocks/wrappers/grid'
  gap: none
  minItemWidth: 200
  maxItemWidth: 300
  items:
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 'Item One'
              level: h3
              size: xs
            - _component: building-blocks/core-elements/text
              text: 'No gap: the cards touch, so let borders or backgrounds do the separating.'
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 'Item Two'
              level: h3
              size: xs
            - _component: building-blocks/core-elements/text
              text: 'Useful for tiled images or bordered cells.'
    - contentSections:
        - _component: building-blocks/wrappers/card
          paddingHorizontal: md
          paddingVertical: md
          rounded: true
          border: true
          contentSections:
            - _component: building-blocks/core-elements/heading
              text: 'Item Three'
              level: h3
              size: xs
            - _component: building-blocks/core-elements/text
              text: 'Useful for tiled images or bordered cells.'
---
