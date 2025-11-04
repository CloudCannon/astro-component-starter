---
title: Container
order: 1
overview: "Defines the primary sections of a page and manages their appearance. Controls background, padding, and overall page width to keep layouts consistent."
slots:
  - title: default
    description: The contents of the Container.
    fallback_for: contentBlocks
    child_component:
examples:
  - title: Background color
    slugs:
      - bg-color-accent
      - bg-color-highlight
      - bg-color-surface
      - bg-color-base
      - bg-color-none
  - title: Background image
    slugs:
      - bg-image-position-top-left
      - bg-image-position-center-center
      - bg-image-position-bottom-right
  - title: Max Width
    slugs:
      - max-content-width-xs
      - max-content-width-sm
      - max-content-width-md
      - max-content-width-lg
      - max-content-width-xl
      - max-content-width-2xl
      - max-content-width-3xl
  - title: Padding
    slugs:
      - padding-xs
      - padding-sm
      - padding-md
      - padding-lg
      - padding-2xl
      - padding-3xl
  - title: Gap
    slugs:
      - gap-xs
      - gap-sm
      - gap-md
      - gap-lg
      - gap-xl
  - title: Color Scheme
    slugs:
      - scheme-contrast
      - scheme-default
    size: md
  - title: Rounded Corners
    slugs:
      - rounded
      - rounded-none
    size: md
---
