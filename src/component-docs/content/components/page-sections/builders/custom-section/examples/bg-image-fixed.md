---
title: Fixed background image
spacing:
blocks:
  _component: 'page-sections/builders/custom-section'
  paddingVertical: 3xl
  paddingHorizontal: md
  colorScheme: dark
  background:
    type: image
    positionVertical: center
    positionHorizontal: center
    fixed: true
    priority: false
    imageSource: /src/assets/images/component-docs/dunedin-cliff.jpg
    imageAlt: 'Dunedin cliffside'
    overlay: -0.5
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Scroll to see the parallax
      level: h3
    - _component: building-blocks/core-elements/text
      text: 'The background image is pinned to the viewport, so the section scrolls over a still image. Falls back to a normal background image for visitors who prefer reduced motion.'
---
