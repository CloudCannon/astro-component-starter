---
title: Accordion
overview: 'Organizes content into expandable panels that users can open or close. Supports single or multiple open panels, and the ability to open the first panel when initalized. Renders using `<details>` and `<summary>` elements for accessibility.`.'

slots:
  - title: default
    description: The contents for the the Accordion.
    fallback_for: items
    child_component:
      name: AccordionItem
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
