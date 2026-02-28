---
title: Card with After Content
spacing:
blocks:
  _component: "building-blocks/wrappers/card"
  border: true
  paddingHorizontal: md
  paddingVertical: md
  rounded: true
  contentSections:
    - _component: "building-blocks/core-elements/heading"
      text: "Card with After Content"
      level: h3
    - _component: "building-blocks/core-elements/text"
      text: "The image below is placed in the afterContentSections area, which sits outside the card's internal padding. This is ideal for footer images or visual footers."
  afterContentSections:
    - _component: "building-blocks/core-elements/image"
      source: "/src/assets/images/component-library/dunedin-cliff.jpg"
      alt: "Dunedin Cliff"
      aspectRatio: widescreen
  style: "max-width: 400px; margin-inline: auto;"
---
