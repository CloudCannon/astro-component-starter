---
title: Three Quarters-Quarter
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
            ## Three quarters column

            This column takes up 75% of the available space.
  secondColumnContentBlocks:
    - _component: "wrappers/container"
      backgroundColor: "highlight"
      paddingHorizontal: sm
      paddingVertical: sm
      contentBlocks:
        - _component: "typography/rich-text"
          text: |-
            ## Quarter column

            This column takes up 25% of the available space.
  distributionMode: "three-quarters-quarter"
  fixedWidth: null
  verticalAlignment: "top"
  reverse: false
---
