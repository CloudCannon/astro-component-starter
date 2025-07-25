---
title: Flexible-Fixed
spacing:
blocks:
  _bookshop_name: "layouts/split"
  firstColumnContentBlocks:
    - _bookshop_name: "layouts/section"
      backgroundColor: "accent"
      content_blocks:
        - _bookshop_name: "elements/rich-text"
          text: |-
            ## Flexible Column

            This column takes up the available space.
  firstColumnMinWidth: null
  secondColumnContentBlocks:
    - _bookshop_name: "layouts/section"
      backgroundColor: "highlight"
      content_blocks:
        - _bookshop_name: "elements/rich-text"
          text: |-
            ## Fixed Width Column

            This column has a fixed width of 300px.
  secondColumnMinWidth: null
  distributionMode: "flexible-fixed"
  fixedWidth: 300
  verticalAlignment: "top"
  reverse: false
---
