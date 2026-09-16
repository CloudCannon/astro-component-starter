---
title: Scroll Stepper
spacing: all
blocks:
  _component: building-blocks/wrappers/scroll-stepper
  label: Scroll Stepper
  mediaWidth: half
  reverse: false
  mediaAspectRatio: landscape
  progressStyle: bar
  stepHeight: content
  gap: 2xl
  steps:
    - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
      mediaSections:
        - _component: building-blocks/core-elements/image
          source: /src/assets/images/component-docs/sunset.jpg
          alt: Sun setting over a headland
          rounded: true
          aspectRatio: landscape
      contentSections:
        - _component: building-blocks/core-elements/simple-text
          text: Step one
          size: sm
        - _component: building-blocks/core-elements/heading
          text: Build visually
          level: h3
          size: lg
        - _component: building-blocks/core-elements/text
          text: Start with the page blocks and turn the first draft into something reviewers can use.
    - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
      mediaSections:
        - _component: building-blocks/core-elements/image
          source: /src/assets/images/component-docs/dunedin-cliff.jpg
          alt: Sea cliffs above a bay
          rounded: true
          aspectRatio: landscape
      contentSections:
        - _component: building-blocks/core-elements/simple-text
          text: Step two
          size: sm
        - _component: building-blocks/core-elements/heading
          text: Shape the brand
          level: h3
          size: lg
        - _component: building-blocks/core-elements/text
          text: Set the visual system, arrange the content, and send a working preview for feedback.
    - _component: building-blocks/wrappers/scroll-stepper/scroll-stepper-step
      mediaSections:
        - _component: building-blocks/core-elements/image
          source: /src/assets/images/component-docs/quiet-street.jpg
          alt: A quiet residential street
          rounded: true
          aspectRatio: landscape
      contentSections:
        - _component: building-blocks/core-elements/simple-text
          text: Step three
          size: sm
        - _component: building-blocks/core-elements/heading
          text: Publish the page
          level: h3
          size: lg
        - _component: building-blocks/core-elements/text
          text: Finish the page and ship the experience everyone approved.
---
