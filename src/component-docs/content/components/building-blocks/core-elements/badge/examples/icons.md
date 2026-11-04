---
title: 'With icons'
spacing: 'all'
blocks:
  _component: 'building-blocks/wrappers/stack'
  direction: row
  gap: sm
  alignmentVertical: center
  stackOnMobile: false
  contentSections:
    - _component: 'building-blocks/core-elements/badge'
      variant: brand
      iconName: sparkles
      text: 'New'
    - _component: 'building-blocks/core-elements/badge'
      variant: success
      iconName: circle-check
      text: 'Shipped'
    - _component: 'building-blocks/core-elements/badge'
      variant: warning
      iconName: triangle-alert
      text: 'Deprecated'
---
