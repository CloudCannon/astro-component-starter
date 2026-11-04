---
title: Card
description: Groups related content in a card.
order: 2
overview: Groups content with a background and padding. The before and after slots run edge to edge, for images or banners.

slots:
  - title: default
    description: Card body.
  - title: before
    description: Content above the card's padded body.
  - title: after
    description: Content below the card's padded body.
examples:
  - slugs:
      - link
  - slugs:
      - border
      - border-none
  - title: 'Max Content Width'
    slugs:
      - max-content-width-xs
      - max-content-width-sm
      - max-content-width-md
      - max-content-width-lg
      - max-content-width-xl
      - max-content-width-2xl
      - max-content-width-3xl
  - title: 'Padding Options'
    slugs:
      - padding-xs
      - padding-sm
      - padding-md
      - padding-lg
      - padding-xl
      - padding-2xl
    size: md
  - title: 'Background Options'
    slugs:
      - background-accent
      - background-highlight
      - background-surface
      - background-base
      - background-none
    size: md
  - title: 'Corner Options'
    slugs:
      - rounded
      - rounded-none
    size: md
  - title: 'Background image'
    slugs:
      - bg-image-position-top-left
      - bg-image-position-center-center
      - bg-image-position-bottom-right
    size: md
  - title: 'Fixed background image'
    slugs:
      - bg-image-fixed
    size: md
  - title: 'Background video'
    slugs:
      - bg-video
    size: md
  - title: 'Background pattern'
    slugs:
      - bg-pattern-natural
      - bg-pattern-sm
      - bg-pattern-md
      - bg-pattern-lg
    size: md
  - title: 'Background overlay'
    slugs:
      - bg-overlay-darken
      - bg-overlay-lighten
    size: md
  - title: 'Before & After Content'
    slugs:
      - before-content
      - after-content
    size: md
---
