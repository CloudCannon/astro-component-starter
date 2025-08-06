---
title: Horizontal Alignment - Space Evenly
spacing:
blocks:
  _bookshop_name: "layouts/grid"
  minItemWidth: 200
  maxItemWidth: 250
  horizontalAlignment: "space-evenly"
  equalWidth: true
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Item 1"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a grid item with sample content."
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Item 2"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a grid item with sample content."
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Item 3"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a grid item with sample content."
---
