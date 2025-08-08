---
title: Top Navigation
spacing: all
blocks:
  _bookshop_name: "layouts/content-selector"
  navigationPosition: top
  items:
    - title: FAQ
      sub_text: Common questions
      icon_name: question-mark-circle
      content_blocks:
        - _bookshop_name: elements/heading
          text: "Frequently asked questions"
          level: h2
          align: start
        - _bookshop_name: elements/rich-text
          text: |
            **Do you offer support?** Yes — email us anytime.

            **Can I cancel?** Yes, you can cancel anytime.
          align: start
          size: md
    - title: Shipping
      sub_text: How we deliver
      icon_name: truck
      content_blocks:
        - _bookshop_name: elements/paragraph
          text: |
            We ship worldwide. Orders leave within 2 business days.
            Delivery times vary by region.
          align: start
          size: md
        - _bookshop_name: elements/list
          items:
            - text: "NZ & AU: 2–5 days"
              icon: clock
            - text: "US & EU: 5–10 days"
              icon: globe-alt
          direction: vertical
          horizontalAlignment: start
          size: md
    - title: Returns
      sub_text: Easy and fair
      icon_name: arrow-path
      content_blocks:
        - _bookshop_name: elements/paragraph
          text: "30‑day returns. Unused items only. Full refund once received."
          align: start
          size: md
        - _bookshop_name: elements/button
          label: Start a return
          link: #
          variant: secondary
          size: md
---
