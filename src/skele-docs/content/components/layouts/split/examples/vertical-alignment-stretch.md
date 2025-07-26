---
title: Stretch Alignment
spacing:
blocks:
  _bookshop_name: "layouts/split"
  firstColumnContentBlocks:
    - _bookshop_name: "layouts/section"
      backgroundColor: "accent"
      content_blocks:
        - _bookshop_name: "elements/rich-text"
          text: |-
            ## Side A

            This is content for the side A. It's really long to make this column longer so we can highlight how the alignment works.

            Here's even more text to help illustrate the point we're trying to make with this demonstration.

            And even more to really drive the point home.
  firstColumnMinWidth: null
  secondColumnContentBlocks:
    - _bookshop_name: "layouts/section"
      backgroundColor: "highlight"
      content_blocks:
        - _bookshop_name: "elements/rich-text"
          text: |-
            ## Side B

            This is content for the side B
  secondColumnMinWidth: null
  distributionMode: "half"
  fixedWidth: null
  verticalAlignment: "stretch"
  reverse: false
---
