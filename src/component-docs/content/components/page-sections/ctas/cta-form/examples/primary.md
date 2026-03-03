---
title: Form CTA
spacing: all
blocks:
  _component: 'page-sections/ctas/cta-form'
  heading: 'Get in touch with us'
  subtext: "Fill out the form below and we'll get back to you as soon as possible."
  formAction: './'
  formBlocks:
    - label: 'Name'
      name: 'name'
      type: text
      required: true
    - label: 'Email'
      name: 'email'
      type: email
      required: true
    - label: 'Message'
      name: 'message'
      required: true
    - text: 'Send message'
      variant: primary
  imageSource: /src/assets/images/component-docs/sunset.jpg
  imageAlt: 'Contact us.'
---
