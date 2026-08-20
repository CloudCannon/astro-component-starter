---
title: Carousel
overview: A sliding gallery of content. Supports autoplay, indicators, and slide widths.

slots:
  - title: default
    description: The contents for the the Carousel.
    child_component:
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
  - title: Fraction indicator
    slugs:
      - fraction
    size: lg
  - title: Gap between slides
    slugs:
      - gap
    size: lg
---
