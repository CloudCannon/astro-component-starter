---
title: Min Width
spacing:
blocks:
  _bookshop_name: "layouts/split"
  firstColumnContentBlocks:
    - _bookshop_name: "layouts/section"
      backgroundColor: "accent"
      content_blocks:
        - _bookshop_name: "elements/rich-text"
          text: |-
            ## First Column

            This column will take up the available space and can shrink as needed.
  firstColumnMinWidth: null
  secondColumnContentBlocks:
    - _bookshop_name: "layouts/section"
      backgroundColor: "highlight"
      content_blocks:
        - _bookshop_name: "elements/rich-text"
          text: |-
            ## Second Column

            This column has a minimum width of 400px, so it will jump to a new line if it gets below that.
  secondColumnMinWidth: 400
  distributionMode: "third-two-thirds"
  fixedWidth: null
  verticalAlignment: "top"
  reverse: false
---
