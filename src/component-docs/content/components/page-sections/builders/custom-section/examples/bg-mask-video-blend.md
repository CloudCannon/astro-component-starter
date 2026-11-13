---
title: Fade a video top and bottom
spacing:
blocks:
  _component: 'page-sections/builders/custom-section'
  paddingVertical: 4xl
  paddingHorizontal: md
  backgroundColor: surface
  background:
    type: video
    positionVertical: center
    positionHorizontal: center
    videoSource: /videos/component-docs/glass.mp4
    mask: blend
    overlay: -0.4
  colorScheme: dark
  lockColorScheme: true
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Blends into its neighbors
      level: h3
      alignmentHorizontal: center
    - _component: building-blocks/core-elements/text
      text: 'Fade top and bottom dissolves full-bleed video into the sections above and below it, so the section has no hard media edges.'
      alignmentHorizontal: center
---
