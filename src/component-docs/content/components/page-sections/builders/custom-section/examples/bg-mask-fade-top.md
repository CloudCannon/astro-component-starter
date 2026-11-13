---
title: Fade the top of an image
spacing:
blocks:
  _component: 'page-sections/builders/custom-section'
  paddingVertical: 3xl
  paddingHorizontal: md
  backgroundColor: surface
  background:
    type: image
    positionVertical: center
    positionHorizontal: center
    imageSource: /src/assets/images/component-docs/dunedin-cliff.jpg
    imageAlt: 'Dunedin cliffside'
    mask: top
    overlay: 0
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: The top fades out
      level: h3
    - _component: building-blocks/core-elements/text
      text: 'The image dissolves upward into the background color, so text near the top sits on a theme-correct surface with no hardcoded scrim.'
---
