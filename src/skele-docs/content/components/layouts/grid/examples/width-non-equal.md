---
title: Non equal width items
spacing:
blocks:
  _bookshop_name: "layouts/grid"
  equalWidth: false
  items:
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Short"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "Short content."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "accent"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Medium Length Content"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This item has medium length content that determines its natural width."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "highlight"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Longer Content Title"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "This item has significantly more content and will be wider."
    - contentBlocks:
        - _bookshop_name: "layouts/section"
          backgroundColor: "surface"
          content_blocks:
            - _bookshop_name: "elements/heading"
              text: "Tiny"
              level: h3
            - _bookshop_name: "elements/paragraph"
              text: "Small."
---
