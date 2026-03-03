---
title: 'Primary Contact Form'
spacing: 'all'
blocks:
  _component: 'building-blocks/forms/form'
  action: '/contact'
  formBlocks:
    - label: 'Full Name'
      name: 'name'
      type: 'text'
      placeholder: 'Enter your full name'
      required: true
    - label: 'City'
      name: 'city'
      options:
        - value: 'auckland'
          label: 'Auckland'
        - value: 'wellington'
          label: 'Wellington'
        - value: 'christchurch'
          label: 'Christchurch'
        - value: 'hamilton'
          label: 'Hamilton'
        - value: 'dunedin'
          label: 'Dunedin'
        - value: 'tauranga'
          label: 'Tauranga'
    - label: 'Message'
      name: 'message'
      placeholder: 'Tell us about your project...'
      required: true
    - name: 'form-source'
      value: 'contact-page'
    - text: 'Send Message'
      variant: 'primary'
---
