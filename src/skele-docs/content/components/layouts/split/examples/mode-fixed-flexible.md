---
title: Fixed-Flexible
spacing:
blocks:
  _bookshop_name: "layouts/split"
  first:
    content_blocks:
      - _bookshop_name: "layouts/section"
        backgroundColor: "accent"
        content_blocks:
          - _bookshop_name: "elements/rich-text"
            text: |-
              ## Fixed Width Column

              This column has a fixed width of 300px.
    minWidth: null
  last:
    content_blocks:
      - _bookshop_name: "layouts/section"
        backgroundColor: "highlight"
        content_blocks:
          - _bookshop_name: "elements/rich-text"
            text: |-
              ## Flexible Column

              This column takes up the remaining space.
    minWidth: null
  distributionMode: "fixed-flexible"
  fixedWidth: 300
  verticalAlignment: "top"
  reverse: false
---
