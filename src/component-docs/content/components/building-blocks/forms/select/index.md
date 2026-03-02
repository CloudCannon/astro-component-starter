---
title: Select
overview: 'A form field that lets users select one option from a dropdown list. Supports custom labels, placeholders, default selections, and required validation. Each option includes a label and a value used in the form submission.'
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
---
