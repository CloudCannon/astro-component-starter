---
title: Flexible Fixed Mode
spacing:
blocks:
  _component: 'building-blocks/wrappers/split'
  firstColumnContentSections:
    - _component: building-blocks/wrappers/card
      backgroundColor: 'accent'
      paddingHorizontal: sm
      paddingVertical: sm
      contentSections:
        - _component: building-blocks/core-elements/text
          text: |-
            ## Flexible column

            This column takes up the remaining space.
  secondColumnContentSections:
    - _component: building-blocks/wrappers/card
      paddingHorizontal: sm
      paddingVertical: sm
      backgroundColor: 'highlight'
      contentSections:
        - _component: building-blocks/core-elements/text
          text: |-
            ## Fixed column

            This column has a fixed width.
  distributionMode: 'flexible-fixed'
  fixedWidth: null
  minSplitWidth: 500
  verticalAlignment: 'top'
  reverse: false
---
