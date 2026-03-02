---
title: Form CTA
spacing: all
blocks:
  _component: 'page-sections/ctas/cta-form'
  heading: 'Get in touch with us'
  subtext: "Fill out the form below and we'll get back to you as soon as possible."
  formAction: './'
  formBlocks:
    - _component: 'building-blocks/forms/input'
      label: 'Name'
      name: 'name'
      type: text
      required: true
    - _component: 'building-blocks/forms/input'
      label: 'Email'
      name: 'email'
      type: email
      required: true
    - _component: 'building-blocks/forms/textarea'
      label: 'Message'
      name: 'message'
      required: true
    - _component: 'building-blocks/forms/submit'
      text: 'Send message'
      variant: primary
  imageSource: /src/assets/images/component-docs/sunset.jpg
  imageAlt: 'Contact us.'
---
