---
title: Split
order: 3
overview: 'Displays two content areas side by side with adjustable widths. Supports different column ratios, vertical alignment, and the option to reverse column order.'
slots:
  - title: first
    description: The contents for the first side of the Split.
    fallback_for: firstColumnContentSections
    child_component:
  - title: second
    description: The contents for the second side of the Split.
    fallback_for: secondColumnContentSections
    child_component:
examples:
  - title: Mode
    size: lg
    slugs:
      - mode-quarter-three-quarters
      - mode-third-two-thirds
      - mode-half
      - mode-two-thirds-third
      - mode-three-quarters-quarter
      - mode-fixed-flexible
      - mode-flexible-fixed
  - title: Vertical Alignment
    size: lg
    slugs:
      - vertical-alignment-top
      - vertical-alignment-center
      - vertical-alignment-bottom
      - vertical-alignment-stretch
  - title: Reverse
    size: lg
    slugs:
      - reverse
      - reverse-false
---
