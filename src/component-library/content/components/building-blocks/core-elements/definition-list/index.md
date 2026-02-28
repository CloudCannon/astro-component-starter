---
title: Definition List
overview: 'A semantic `<dl>` component for displaying term/definition pairs. Ideal for glossaries, FAQs, and other label–description content. Supports markdown formatting in definitions.'
slots:
  - title: default
    description: The content inside the DefinitionList.
    fallback_for: items
    child_component:
      name: DefinitionListItem
      props:
        - 'text/slot'
examples:
  - slugs:
      - alignment-start
      - alignment-center
      - alignment-end
    title: AlignX
    size: md
---
