---
title: Steps
overview: 'A numbered how-it-works sequence. Each step owns its own rail segment — horizontal columns run a connector from the marker to that column’s edge; vertical items use a left border that stops at the last marker. Optional featured images share one crop. Horizontal reading order is image → number → words; vertical puts the image beside the words so two markers stay in view. For a dated sequence, use [Timeline](/component-docs/components/building-blocks/wrappers/timeline/). For a full-width block with a heading, use the [Steps section](/component-docs/components/page-sections/explainers/steps/).'
slots:
  - title: default
    description: The steps in the sequence.
    child_component:
      props:
        - 'contentSections/slot'
examples:
  - title: Orientation
    slugs: [orientation-horizontal, orientation-vertical]
  - title: Images
    slugs: [images-horizontal, images-vertical]
---
