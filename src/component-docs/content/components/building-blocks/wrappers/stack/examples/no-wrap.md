---
title: 'No Wrap'
spacing: all
blocks:
  _component: building-blocks/wrappers/card
  maxContentWidth: sm
  paddingHorizontal: md
  paddingVertical: md
  rounded: true
  border: true
  contentSections:
    - _component: building-blocks/wrappers/stack
      direction: row
      gap: sm
      wrap: false
      stackOnMobile: false
      contentSections:
        - _component: building-blocks/core-elements/badge
          text: 'Astro'
          showDot: true
        - _component: building-blocks/core-elements/badge
          text: 'CloudCannon'
          showDot: true
        - _component: building-blocks/core-elements/badge
          text: 'Static HTML'
          showDot: true
        - _component: building-blocks/core-elements/badge
          text: 'Visual editing'
          showDot: true
        - _component: building-blocks/core-elements/badge
          text: 'Design tokens'
          showDot: true
        - _component: building-blocks/core-elements/badge
          text: 'Components'
          showDot: true
---

With wrap off the children stay on one line and squeeze to fit, so long labels break inside their own box.
