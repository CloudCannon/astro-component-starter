---
title: Accordion
overview: Expandable panels that users can open or close. Allow one open panel or several.

slots:
  - title: default
    description: The contents for the the Accordion.
    child_component:
      props:
        - 'contentSections/slot'
        - 'title'
examples:
  - title: Open First Item
    slugs:
      - open-first
  - title: Single Open
    slugs:
      - single-open
---
