---
title: 'With a map embed'
spacing: null
blocks:
  _component: 'page-sections/conversion/contact-split'
  eyebrow: 'Contact'
  heading: 'Visit the studio'
  mapEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=170.4930%2C-45.8850%2C170.5150%2C-45.8700&layer=mapnik'
  details:
    - icon: map-pin
      label: Address
      value: '12 Vogel Street, Dunedin 9016, New Zealand'
      url: ''
    - icon: envelope
      label: Email
      value: 'hello@example.com'
      url: 'mailto:hello@example.com'
  formBlocks:
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
---
