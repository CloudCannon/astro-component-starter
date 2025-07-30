---
title: Horizontal Alignment - Space Between
spacing:
blocks:
  _bookshop_name: "layouts/grid"
  minItemWidth: 200
  maxItemWidth: 250
  horizontalAlignment: "space-between"
  equalWidth: true
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Item 1"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a grid item with sample content."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Item 2"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a grid item with sample content."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Item 3"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a grid item with sample content."
---
