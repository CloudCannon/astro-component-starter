---
title: Card
description: A container component that provides card layout with background options, padding controls, and optional link.
order: 2
overview: "A card for grouping related content within a section. Provides background, and padding. Includes before and after slots that render outside the card’s inner padding (ideal for edge-to-edge images or banners), plus a padded body area for regular content."

slots:
  - title: default
    description: The contents for the body of the Card.
    fallback_for: contentBlocks
    child_component:
  - title: before
    description: The contents to display before the Card content.
    fallback_for: beforeContentBlocks
    child_component:
  - title: after
    description: The contents to display after the Card content.
    fallback_for: afterContentBlocks
    child_component:
examples:
  - slugs:
      - link
  - slugs:
      - border
      - border-none
  - title: "Padding Options"
    slugs:
      - padding-xs
      - padding-sm
      - padding-md
      - padding-lg
      - padding-xl
      - padding-2xl
    size: md
  - title: "Gap Options"
    slugs:
      - gap-xs
      - gap-sm
      - gap-md
      - gap-lg
      - gap-xl
    size: md
  - title: "Background Options"
    slugs:
      - background-accent
      - background-highlight
      - background-surface
      - background-base
      - background-none
    size: md
  - title: "Corner Options"
    slugs:
      - rounded
      - rounded-none
    size: md
  - title: "Background image"
    slugs:
      - bg-image-position-top-left
      - bg-image-position-center-center
      - bg-image-position-bottom-right
    size: md
  - title: "Before & After Content"
    slugs:
      - before-content
      - after-content
    size: md
---
