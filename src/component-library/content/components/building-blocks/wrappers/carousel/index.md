---
title: Carousel
overview: 'A carousel for displaying multiple slides of content. Supports autoplay and auto-scroll options, with configurable slide widths and minimum sizes to maintain responsive layouts.'

slots:
  - title: default
    description: The contents for the the Carousel.
    fallback_for: slides
    child_component:
      name: CarouselSlide
      props:
        - 'contentSections/slot'
examples:
  - slugs:
      - auto-play
    size: lg
  - slugs:
      - auto-scroll
    size: lg
  - slugs:
      - width-percentage
    size: lg
---
