---
title: 'Modal With Header'
spacing: 'all'
blocks:
  _component: 'building-blocks/wrappers/modal'
  label: 'Learn more modal'
  heading: 'Explore next steps'
  triggerVariant: 'primary'
  triggerText: 'Open modal'
  triggerSize: 'md'
  size: 'md'
  contentSections:
    - _component: page-sections/builders/custom-section
      label: ''
      maxContentWidth: md
      paddingHorizontal: lg
      paddingVertical: lg
      contentSections:
        - _component: building-blocks/core-elements/text
          text: >-
            Use this modal pattern to highlight key details, guide someone toward a next
            action, or present supporting information without leaving the current page.
        - _component: building-blocks/core-elements/list
          items:
            - text: Summarize the main value or context in a compact space.
              iconName: check
            - text: Reinforce the message with a short checklist or supporting points.
              iconName: check
            - text: Offer clear follow-up actions that fit the page context.
              iconName: check
          direction: vertical
          alignmentHorizontal: start
          size: md
          listType: icon
        - _component: building-blocks/wrappers/button-group
          direction: row
          alignmentHorizontal: start
          buttonSections:
            - _component: building-blocks/core-elements/button
              text: View details
              variant: primary
            - _component: building-blocks/core-elements/button
              text: Dismiss
              variant: secondary
          label: ''
---
