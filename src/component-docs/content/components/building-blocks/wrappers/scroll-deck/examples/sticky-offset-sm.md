---
title: 'Small sticky offset'
spacing: null
blocks:
  _component: 'building-blocks/wrappers/scroll-deck'
  label: 'Scroll Deck, small sticky offset'
  stickyOffset: sm
  cardColorScheme: light
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
          text: 'Pins with a small gap below the top of the viewport.'
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
