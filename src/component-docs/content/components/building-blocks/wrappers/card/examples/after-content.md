---
title: Card with After Content
spacing:
blocks:
  _component: 'building-blocks/wrappers/card'
  border: true
  paddingHorizontal: md
  paddingVertical: md
  rounded: true
  contentSections:
    - text: 'Card with After Content'
      level: h3
    - text: "The image below is placed in the afterContentSections area, which sits outside the card's internal padding. This is ideal for footer images or visual footers."
  afterContentSections:
    - source: '/src/assets/images/component-docs/dunedin-cliff.jpg'
      alt: 'Dunedin Cliff'
      aspectRatio: widescreen
  style: 'max-width: 400px; margin-inline: auto;'
---
