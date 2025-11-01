---
title: Half
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
            ## Half column

            This column takes up 50% of the available space.
  secondColumnContentBlocks:
    - _component: "wrappers/container"
      backgroundColor: "highlight"
      paddingHorizontal: sm
      paddingVertical: sm
      contentBlocks:
        - _component: "typography/rich-text"
          text: |-
            ## Half column

            This column also takes up 50% of the available space.
  distributionMode: "half"
  fixedWidth: null
  minSplitWidth: 500
  verticalAlignment: "top"
  reverse: false
---
