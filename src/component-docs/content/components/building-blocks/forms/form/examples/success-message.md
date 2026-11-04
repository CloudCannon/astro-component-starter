---
title: 'Success message'
spacing: 'all'
blocks:
  _component: 'building-blocks/forms/form'
  action: './'
  successMessage: 'Thanks — your message is on its way. We usually reply within a day.'
  formBlocks:
    - _component: 'building-blocks/forms/input'
      label: 'Email'
      name: 'email'
      type: 'email'
      placeholder: 'you@example.com'
      required: true
    - _component: 'building-blocks/forms/textarea'
      label: 'Message'
      name: 'message'
      placeholder: 'Tell us what you need'
      required: true
    - _component: 'building-blocks/forms/submit'
      text: 'Send Message'
      variant: 'primary'
---
