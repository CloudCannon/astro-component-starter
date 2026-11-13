---
title: 'Keep Row on Mobile'
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
      stackOnMobile: false
      contentSections:
        - _component: building-blocks/core-elements/badge
          text: 'Docs'
          showDot: true
        - _component: building-blocks/core-elements/badge
          text: 'Guides'
          showDot: true
        - _component: building-blocks/core-elements/badge
          text: 'Changelog'
          showDot: true
---

With stacking off the row survives at any width and wraps instead.
