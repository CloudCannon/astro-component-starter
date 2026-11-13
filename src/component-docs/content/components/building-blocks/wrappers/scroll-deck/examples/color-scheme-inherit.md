---
title: 'Inherit color scheme'
spacing: null
blocks:
  _component: 'building-blocks/wrappers/scroll-deck'
  label: 'Scroll Deck, inherit color scheme'
  stickyOffset: md
  cardColorScheme: inherit
  showRail: true
  cards:
    - _component: 'building-blocks/wrappers/scroll-deck/scroll-deck-card'
      label: 'First'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'First card'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'Takes on whichever theme the page around it is using.'
    - _component: 'building-blocks/wrappers/scroll-deck/scroll-deck-card'
      label: 'Second'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'Second card'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'Switches with the site if a visitor toggles dark mode.'
---
