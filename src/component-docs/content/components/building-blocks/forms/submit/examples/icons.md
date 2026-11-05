---
title: 'Submit Button with Icons'
spacing: 'all'
blocks:
  _component: 'building-blocks/forms/form'
  action: './'
  formBlocks:
    - _component: 'building-blocks/forms/submit'
      text: 'Submit with Icon'
      iconName: 'check'
      iconPosition: 'before'
      variant: tertiary
    - _component: 'building-blocks/forms/submit'
      text: 'Submit with Icon After'
      iconName: 'arrow-right'
      iconPosition: 'after'
      variant: tertiary
    - _component: 'building-blocks/forms/submit'
      iconName: 'check'
      hideText: true
      variant: tertiary
---
