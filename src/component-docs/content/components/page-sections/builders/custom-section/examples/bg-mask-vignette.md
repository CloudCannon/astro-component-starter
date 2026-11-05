---
title: Fade the edges of an image
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
    imageSource: /src/assets/images/component-docs/castle.jpg
    imageAlt: 'Stone castle under a night sky'
    mask: vignette
    overlay: -0.4
  colorScheme: dark
  lockColorScheme: true
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: The edges fade out
      level: h3
      alignmentHorizontal: center
    - _component: building-blocks/core-elements/text
      text: 'The inverse of Fade the middle: the image stays behind the content and dissolves into the background color at the edges, so the section has no hard photo edge.'
      alignmentHorizontal: center
---
