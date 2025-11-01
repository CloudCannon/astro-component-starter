---
title: Start Navigation
spacing: all
blocks:
  _component: "wrappers/content-selector"
  navigationPosition: start
  items:
    - title: FAQ
      sub_text: Common questions
      icon_name: question-mark-circle
      contentBlocks:
        - _component: typography/heading
          text: "Frequently asked questions"
          level: h2
          alignX: start
        - _component: typography/rich-text
          text: |
            **Do you offer support?** Yes — email us anytime.

            **Can I cancel?** Yes, you can cancel anytime.
          alignX: start
          size: md
    - title: Shipping
      sub_text: How we deliver
      icon_name: truck
      contentBlocks:
        - _component: typography/simple-text
          text: |
            We ship worldwide. Orders leave within 2 business days.
            Delivery times vary by region.
          alignX: start
          size: md
        - _component: typography/list
          items:
            - text: "NZ & AU: 2–5 days"
              iconName: clock
            - text: "US & EU: 5–10 days"
              iconName: globe-alt
          direction: vertical
          alignX: start
          size: md
    - title: Returns
      sub_text: Easy and fair
      icon_name: arrow-path
      contentBlocks:
        - _component: typography/simple-text
          text: "30‑day returns. Unused items only. Full refund once received."
          alignX: start
          size: md
        - _component: elements/button
          text: Start a return
          link: #
          variant: secondary
          size: md
---
