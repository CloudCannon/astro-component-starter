---
title: Top Alignment
spacing:
blocks:
  _bookshop_name: "layouts/cluster"
  minItemWidth: 200
  maxItemWidth: 250
  verticalAlignment: "start"
  equalWidth: true
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Short Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This is a short cluster item."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Taller Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This cluster item has more content and will be taller than the others. It demonstrates how items align to the top when using start alignment."
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
