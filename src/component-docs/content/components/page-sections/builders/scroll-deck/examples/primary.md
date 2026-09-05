---
title: Scroll Deck
spacing: all
blocks:
  _component: 'page-sections/builders/scroll-deck'
  sectionLabel: 'Scroll Deck'
  stickyOffset: md
  cardColorScheme: light
  showRail: true
  maxContentWidth: xl
  paddingHorizontal: lg
  paddingVertical: 4xl
  colorScheme: dark
  backgroundColor: base
  cards:
    - _component: 'page-sections/builders/scroll-deck/scroll-deck-card'
      label: 'Build'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'Build the page from blocks'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'Every section in the library is a block an editor can drop in, reorder, and fill.'
        - _component: 'building-blocks/wrappers/button-group'
          buttonSections:
            - _component: 'building-blocks/core-elements/button'
              text: 'See the library'
              link: '/component-docs/'
              variant: primary
    - _component: 'page-sections/builders/scroll-deck/scroll-deck-card'
      label: 'Brand'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'Set the brand in one file'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'Colors, type and spacing are tokens. Change them once and every block follows.'
        - _component: 'building-blocks/wrappers/button-group'
          buttonSections:
            - _component: 'building-blocks/core-elements/button'
              text: 'Read about theming'
              link: '/component-docs/'
              variant: secondary
    - _component: 'page-sections/builders/scroll-deck/scroll-deck-card'
      label: 'Ship'
      contentSections:
        - _component: 'building-blocks/core-elements/heading'
          text: 'Hand it over and ship'
          level: h3
          size: xl
        - _component: 'building-blocks/core-elements/text'
          text: 'The team edits real pages in the browser, inside the guardrails you shipped.'
        - _component: 'building-blocks/wrappers/button-group'
          buttonSections:
            - _component: 'building-blocks/core-elements/button'
              text: 'Get started'
              link: '/'
              variant: primary
---
