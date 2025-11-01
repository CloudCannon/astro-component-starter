---
title: Reversed
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
            ## Side A

            This is content for side A.
  secondColumnContentBlocks:
    - _component: "wrappers/container"
      backgroundColor: "highlight"
      paddingHorizontal: sm
      paddingVertical: sm
      contentBlocks:
        - _component: "typography/rich-text"
          text: |-
            ## Side B

            This is content for side B.
  distributionMode: "third-two-thirds"
  fixedWidth: null
  verticalAlignment: "top"
  reverse: true
---
