---
title: Card with Before Content
spacing:
blocks:
  _component: 'building-blocks/wrappers/card'
  border: true
  paddingHorizontal: lg
  paddingVertical: lg
  rounded: true
  beforeContentSections:
    - source: '/src/assets/images/component-docs/dunedin-cliff.jpg'
      alt: 'Dunedin Cliff'
      aspectRatio: widescreen
  contentSections:
    - text: 'Card with Before Content'
      level: h3
    - text: "The image above is placed in the beforeContentSections area, which sits outside the card's internal padding. This is perfect for hero images or visual headers."
  style: 'max-width: 400px; margin-inline: auto;'
---
