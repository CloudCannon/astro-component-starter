---
title: Bottom Alignment
spacing:
blocks:
  _bookshop_name: "layouts/grid"
  minItemWidth: 250
  verticalAlignment: "bottom"
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Short Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a short grid item."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Taller Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This grid item has more content and will be taller than the others. It demonstrates how items align to the bottom when using bottom alignment."
            - _bookshop_name: "elements/paragraph"
              text: "Additional paragraph to make this item even taller."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Medium Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This item has medium height content."
---
