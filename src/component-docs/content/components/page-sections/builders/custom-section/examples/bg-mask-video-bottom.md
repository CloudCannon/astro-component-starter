---
title: Fade the bottom of a video
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
    mask: bottom
    overlay: 0
  contentSections:
    - _component: building-blocks/core-elements/spacer
      size: 3xl
    - _component: building-blocks/core-elements/heading
      text: Video up top, text on solid ground
      level: h3
    - _component: building-blocks/core-elements/text
      text: 'The video fades downward into the background color, so the heading needs no overlay to stay readable. The reveal follows the theme in light and dark.'
---
