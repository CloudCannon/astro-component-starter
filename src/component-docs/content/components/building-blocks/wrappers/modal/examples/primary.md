---
title: 'Primary Modal'
spacing: 'all'
blocks:
  _component: 'building-blocks/wrappers/modal'
  label: 'Modal'
  triggerText: 'Open modal'
  triggerVariant: 'secondary'
  triggerSize: 'md'
  size: 'md'
  contentSections:
    - _component: page-sections/builders/custom-section
      label: ''
      paddingHorizontal: lg
      paddingVertical: lg
      backgroundColor: surface
      contentSections:
        - _component: building-blocks/wrappers/split
          distributionMode: half
          alignmentVertical: center
          reverse: false
          label: ''
          minSplitWidth: 200
          firstColumnContentSections:
            - _component: building-blocks/core-elements/heading
              text: Let's get started
              level: h2
              size: md
            - _component: building-blocks/core-elements/text
              text: >-
                This modal skips the optional header and instead uses a split layout
                with supporting copy beside a simple contact form.
          secondColumnContentSections:
            - _component: building-blocks/forms/form
              action: './'
              formBlocks:
                - _component: building-blocks/forms/input
                  label: Name
                  name: name
                  type: text
                  placeholder: Your name
                  required: true
                - _component: building-blocks/forms/input
                  label: Email
                  name: email
                  type: email
                  placeholder: you@example.com
                  required: true
                - _component: building-blocks/forms/textarea
                  label: Message
                  name: message
                  placeholder: Tell us what you need
                  required: true
                - _component: building-blocks/forms/submit
                  text: Send message
                  variant: primary
---
