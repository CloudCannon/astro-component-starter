---
title: Fade the right of an image
spacing:
blocks:
  _component: 'page-sections/builders/custom-section'
  paddingVertical: 3xl
  paddingHorizontal: md
  backgroundColor: surface
  background:
    type: image
    positionVertical: center
    positionHorizontal: left
    imageSource: /src/assets/images/component-docs/quiet-street.jpg
    imageAlt: 'Quiet hillside street'
    mask: right
    overlay: 0
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Text on the right
      level: h3
      alignmentHorizontal: end
    - _component: building-blocks/core-elements/text
      text: 'The mirror of Fade the left: the image holds the left side and dissolves toward the text.'
      alignmentHorizontal: end
---
