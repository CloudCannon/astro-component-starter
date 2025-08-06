---
title: Stretch Alignment
spacing:
blocks:
  _bookshop_name: "layouts/grid"
  minItemWidth: 200
  maxItemWidth: 250
  verticalAlignment: "stretch"
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
              text: "This is a short grid item that will stretch to match the height of the tallest item."
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Taller Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This grid item has more content and will be taller than the others. All items will stretch to match this height."
    - contentBlocks:
        - _bookshop_name: "layouts/container"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Medium Item"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This item has medium height content but will stretch to match the tallest item."
---
