---
title: Fixed width items
spacing:
blocks:
  _bookshop_name: "layouts/cluster"
  minItemWidth: 270
  maxItemWidth: 270
  equalWidth: true
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Fixed Width"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "All items have exactly the same width (150px) regardless of content length. This creates a rigid, uniform grid."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Rigid Layout"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "Perfect for displaying cards or features that need to be exactly the same size."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Predictable Sizing"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "Items maintain their exact width and wrap to new rows when needed."
---
