---
title: 'Large sticky offset'
spacing: null
blocks:
  _component: 'building-blocks/wrappers/scroll-deck'
  label: 'Scroll Deck, large sticky offset'
  stickyOffset: lg
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
          text: 'Pins with a large gap below the top of the viewport — useful under a tall sticky header.'
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
