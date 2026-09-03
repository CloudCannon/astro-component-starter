---
_schema: default
title: Contact
description: Example contact page with details beside a form.
pageSections:
  - _component: page-sections/conversion/contact-split
    headingLevel: h1
    eyebrow: Start a project
    heading: Tell us about the work
    subtext: A few lines on the site, the timeline, and who will edit it.
    details:
      - icon: map-pin
        label: Studio
        value: 12 Vogel Street, Dunedin 9016, New Zealand
        url: ''
      - icon: envelope
        label: Email
        value: hello@example.com
        url: mailto:hello@example.com
      - icon: phone
        label: Phone
        value: +64 3 555 0142
        url: tel:+6435550142
      - icon: clock
        label: Hours
        value: Mon–Fri, 9am–5pm NZST
        url: ''
    formAction: ./
    formBlocks:
      - _component: building-blocks/forms/input
        label: Name
        name: name
        type: text
        required: true
      - _component: building-blocks/forms/input
        label: Email
        name: email
        type: email
        required: true
      - _component: building-blocks/forms/textarea
        label: Message
        name: message
        required: true
      - _component: building-blocks/forms/submit
        text: Send message
        variant: primary
        size: md
        iconPosition: before
        hideText: false
        disabled: false
    mapEmbedUrl: ''
    colorScheme: inherit
    backgroundColor: base
---
