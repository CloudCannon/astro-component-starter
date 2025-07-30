---
title: Equal width items
spacing:
blocks:
  _bookshop_name: "layouts/grid"
  minItemWidth: 100
  maxItemWidth: 300
  equalWidth: true
  verticalAlignment: "stretch"
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Equal Width"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "All items have the same width regardless of content length. This creates a uniform, grid-like appearance."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Consistent Layout"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "Perfect for displaying cards, features, or any content that should have consistent sizing."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Responsive Design"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "Items automatically wrap and adjust based on available space while maintaining equal widths."
---
