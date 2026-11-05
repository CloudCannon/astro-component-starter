---
title: Fade the left of an image
spacing:
blocks:
  _component: 'page-sections/builders/custom-section'
  paddingVertical: 3xl
  paddingHorizontal: md
  backgroundColor: surface
  background:
    type: image
    positionVertical: center
    positionHorizontal: right
    imageSource: /src/assets/images/component-docs/sheep.jpg
    imageAlt: 'Sheep grazing on a headland'
    mask: left
    overlay: 0
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Text on the left
      level: h3
    - _component: building-blocks/core-elements/text
      text: 'The left side fades out and the image holds the right, so split-style copy sits on the background color with no hard image edge.'
---
