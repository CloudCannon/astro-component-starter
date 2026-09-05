---
title: 'Two cards, no rail'
spacing: null
blocks:
  _component: 'page-sections/builders/scroll-deck'
  sectionLabel: 'Scroll Deck no rail'
  stickyOffset: lg
  cardColorScheme: inherit
  showRail: false
  maxContentWidth: lg
  paddingHorizontal: lg
  paddingVertical: 4xl
  colorScheme: inherit
  backgroundColor: surface
  cards:
    - _component: 'page-sections/builders/scroll-deck/scroll-deck-card'
      label: 'Before'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'Before'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'Four years, two rebuilds, and a template folder nobody wanted to open.'
    - _component: 'page-sections/builders/scroll-deck/scroll-deck-card'
      label: 'After'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'After'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'One library, one token file, and pages the marketing team ships on their own.'
---
