---
title: No Gap
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
            ## gap: none

            The gap sets the space between the two columns.
  secondColumnContentSections:
    - _component: building-blocks/wrappers/card
      backgroundColor: 'highlight'
      paddingHorizontal: sm
      paddingVertical: sm
      contentSections:
        - _component: building-blocks/core-elements/text
          text: |-
            ## Second column

            It uses the same size steps as the rest of the layout.
  distributionMode: 'half'
  gap: none
  alignmentVertical: 'top'
  reverse: false
---
