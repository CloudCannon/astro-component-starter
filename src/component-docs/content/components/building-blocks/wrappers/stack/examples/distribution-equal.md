---
title: 'Equal'
spacing: all
blocks:
  _component: building-blocks/wrappers/stack
  direction: row
  distribution: equal
  gap: md
  contentSections:
    - _component: building-blocks/wrappers/card
      paddingHorizontal: md
      paddingVertical: md
      rounded: true
      border: true
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: 'Short'
          level: h3
          size: xs
        - _component: building-blocks/core-elements/text
          text: 'One line of content.'
    - _component: building-blocks/wrappers/card
      paddingHorizontal: md
      paddingVertical: md
      rounded: true
      border: true
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: 'Tall'
          level: h3
          size: xs
        - _component: building-blocks/core-elements/text
          text: 'This card has more text so the row has something to align against. Start, center, and end move the shorter cards; stretch makes them match.'
    - _component: building-blocks/wrappers/card
      paddingHorizontal: md
      paddingVertical: md
      rounded: true
      border: true
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: 'Medium'
          level: h3
          size: xs
        - _component: building-blocks/core-elements/text
          text: 'Two lines of content, roughly. Enough to sit between the other two.'
---

Equal gives every child the same width, so cards and other container-sized blocks fill the row. Equal rows never wrap.
