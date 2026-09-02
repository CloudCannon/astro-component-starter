---
title: 'Stack on Mobile'
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
      stackOnMobile: true
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

The Stack measures its own container, not the viewport, so inside this narrow card the row already collapses to a column.
