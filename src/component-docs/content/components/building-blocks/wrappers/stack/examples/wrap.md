---
title: 'Wrap'
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
      wrap: true
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

The Stack sits in a narrow card so the row runs out of room. With wrap on, children move to a new line.
