---
title: Bottom Alignment
spacing:
blocks:
  _bookshop_name: "layouts/grid"
  minItemWidth: 200
  maxItemWidth: 250
  verticalAlignment: "end"
  equalWidth: true
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Short Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a short grid item."
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Taller Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This grid item has more content and will be taller than the others. It demonstrates how items align to the bottom when using end alignment."
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Medium Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This item has medium height content."
---
