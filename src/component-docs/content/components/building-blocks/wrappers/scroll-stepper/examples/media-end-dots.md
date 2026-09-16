---
title: Reversed media with dot progress
spacing: all
blocks:
  _component: building-blocks/wrappers/scroll-stepper
  label: Scroll Stepper media end
  mediaWidth: half
  reverse: true
  mediaAspectRatio: square
  progressStyle: dots
  stepHeight: screen
  gap: xl
  steps:
    - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
      mediaSections:
        - _component: building-blocks/core-elements/image
          source: /src/assets/images/component-docs/castle.jpg
          alt: A stone castle on a hillside
          rounded: true
          aspectRatio: square
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Audit what exists
          level: h3
          size: lg
        - _component: building-blocks/core-elements/text
          text: Begin by seeing the current site and the work it needs.
    - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
      mediaSections:
        - _component: building-blocks/core-elements/image
          source: /src/assets/images/component-docs/sunset.jpg
          alt: Sun setting over a headland
          rounded: true
          aspectRatio: square
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Establish the system
          level: h3
          size: lg
        - _component: building-blocks/core-elements/text
          text: Make the patterns and visual choices that the team can keep using.
    - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
      mediaSections:
        - _component: building-blocks/core-elements/image
          source: /src/assets/images/component-docs/quiet-street.jpg
          alt: A quiet residential street
          rounded: true
          aspectRatio: square
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Hand it over
          level: h3
          size: lg
        - _component: building-blocks/core-elements/text
          text: Deliver a completed site that the people running it can edit with confidence.
---
