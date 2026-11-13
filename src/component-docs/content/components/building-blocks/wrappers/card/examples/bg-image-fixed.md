---
title: Fixed background image
spacing:
blocks:
  _component: 'building-blocks/wrappers/card'
  paddingVertical: 2xl
  paddingHorizontal: sm
  colorScheme: dark
  lockColorScheme: true
  rounded: true
  background:
    type: image
    positionVertical: center
    positionHorizontal: center
    fixed: true
    imageSource: /src/assets/images/component-docs/dunedin-cliff.jpg
    imageAlt: 'Dunedin cliffside'
    overlay: -0.5
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: 'Fixed Background'
      level: h3
    - _component: building-blocks/core-elements/text
      text: 'The image is pinned to the viewport, so the card scrolls over a still image. Linked cards drop their hover scale, and the effect is disabled for visitors who prefer reduced motion.'
---
