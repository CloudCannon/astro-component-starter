---
title: Fade the bottom of an image
spacing:
blocks:
  _component: 'page-sections/builders/custom-section'
  paddingVertical: 3xl
  paddingHorizontal: md
  backgroundColor: surface
  background:
    type: image
    positionVertical: top
    positionHorizontal: center
    imageSource: /src/assets/images/component-docs/sunset.jpg
    imageAlt: 'Coastal cliffs at dusk'
    mask: bottom
    overlay: 0
  contentSections:
    - _component: building-blocks/core-elements/spacer
      size: 3xl
    - _component: building-blocks/core-elements/heading
      text: The bottom fades out
      level: h3
    - _component: building-blocks/core-elements/text
      text: 'The image holds the top of the section and fades downward, so content lower in the section sits on a clean surface.'
---
