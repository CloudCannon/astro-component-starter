---
title: Fixed Flexible Mode
spacing:
blocks:
  _component: "wrappers/split"
  firstColumnContentBlocks:
    - _component: "wrappers/container"
      backgroundColor: "accent"
      paddingHorizontal: sm
      paddingVertical: sm
      contentBlocks:
        - _component: "typography/rich-text"
          text: |-
            ## Fixed column

            This column has a fixed width.
  secondColumnContentBlocks:
    - _component: "wrappers/container"
      backgroundColor: "highlight"
      paddingHorizontal: sm
      paddingVertical: sm
      contentBlocks:
        - _component: "typography/rich-text"
          text: |-
            ## Flexible column

            This column takes up the remaining space.
  distributionMode: "fixed-flexible"
  fixedWidth: null
  minSplitWidth: 500
  verticalAlignment: "top"
  reverse: false
---
