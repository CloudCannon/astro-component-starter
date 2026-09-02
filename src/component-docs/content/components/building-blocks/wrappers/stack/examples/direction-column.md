---
title: 'Column'
spacing: all
blocks:
  _component: building-blocks/wrappers/stack
  direction: column
  gap: lg
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: 'One gap, three kinds of block'
      level: h3
    - _component: building-blocks/core-elements/image
      source: '/src/assets/images/placeholder.jpg'
      alt: 'Placeholder image inside a column stack'
      aspectRatio: widescreen
      rounded: true
    - _component: building-blocks/core-elements/text
      text: 'In a Stack the children do not use the document flow. The gap you set is the only spacing, so a heading, an image, and this paragraph all sit exactly one step apart.'
---
