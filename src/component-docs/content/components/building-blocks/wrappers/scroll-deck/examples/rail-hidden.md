---
title: 'Without rail'
spacing: null
blocks:
  _component: 'building-blocks/wrappers/scroll-deck'
  label: 'Scroll Deck without rail'
  stickyOffset: md
  cardColorScheme: light
  showRail: false
  cards:
    - _component: 'building-blocks/wrappers/scroll-deck/scroll-deck-card'
      label: 'First'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'First card'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'No rail of anchor links alongside the deck.'
    - _component: 'building-blocks/wrappers/scroll-deck/scroll-deck-card'
      label: 'Second'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'Second card'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'Slides up and covers the first card as the deck continues.'
---
