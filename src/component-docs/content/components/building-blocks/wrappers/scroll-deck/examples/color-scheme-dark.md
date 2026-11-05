---
title: 'Dark color scheme'
spacing: null
blocks:
  _component: 'building-blocks/wrappers/scroll-deck'
  label: 'Scroll Deck, dark color scheme'
  stickyOffset: md
  cardColorScheme: dark
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
          text: 'Stays dark regardless of the site theme — a locked color scheme.'
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
