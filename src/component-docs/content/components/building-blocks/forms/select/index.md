---
title: Select
overview: A dropdown for choosing one option.
slots:
  - title: default
    description: Select options.
    fallback_for: options
    child_component:
      name: SelectOption
      props:
        - label
        - 'value'
        - 'selected'
        - 'disabled'
examples:
  - slugs:
      - placeholder
    size: md
  - slugs:
      - required
    size: md
  - slugs:
      - icon
    size: md
  - slugs:
      - icon-color
    size: md
---
