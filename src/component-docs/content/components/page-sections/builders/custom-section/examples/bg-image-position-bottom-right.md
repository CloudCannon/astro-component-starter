---
title: Bottom right background image
spacing:
blocks:
  _component: 'page-sections/builders/custom-section'
  paddingVertical: 2xl
  paddingHorizontal: md
  colorScheme: dark
  lockColorScheme: true
  background:
    type: image
    positionVertical: bottom
    positionHorizontal: right
    priority: false
    imageSource: /src/assets/images/component-docs/dunedin-cliff.jpg
    imageAlt: 'Dunedin cliffside'
    overlay: -0.3
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Build bold. Launch fast.
      level: h3
    - _component: building-blocks/core-elements/text
      text: 'The background image is anchored to the bottom-right corner, so that edge stays in view as the section crops.'
---
