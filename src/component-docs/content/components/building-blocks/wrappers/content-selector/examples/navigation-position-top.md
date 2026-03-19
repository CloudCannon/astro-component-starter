---
title: Top Navigation
spacing: all
blocks:
  _component: 'building-blocks/wrappers/content-selector'
  navigationPosition: top
  items:
    - title: FAQ
      subtext: Common questions
      iconName: question-mark-circle
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: 'Frequently asked questions'
          level: h2
          alignX: start
        - _component: building-blocks/core-elements/text
          text: |
            **Do you offer support?** Yes — email us anytime.

            **Can I cancel?** Yes, you can cancel anytime.
          alignX: start
          size: md
    - title: Shipping
      subtext: How we deliver
      iconName: truck
      contentSections:
        - _component: building-blocks/core-elements/text
          text: |
            We ship worldwide. Orders leave within 2 business days.
            Delivery times vary by region.
          alignX: start
          size: md
        - _component: building-blocks/core-elements/list
          items:
            - text: 'NZ & AU: 2–5 days'
              iconName: clock
            - text: 'US & EU: 5–10 days'
              iconName: globe-alt
          direction: vertical
          alignX: start
          size: md
    - title: Returns
      subtext: Easy and fair
      iconName: arrow-path
      contentSections:
        - _component: building-blocks/core-elements/text
          text: '30‑day returns. Unused items only. Full refund once received.'
          alignX: start
          size: md
        - _component: building-blocks/core-elements/text
          text: Start a return
          link: #
          variant: secondary
          size: md
---
