---
title: 'Primary Main Nav'
spacing: 'top'
blocks:
  _component: 'navigation/main-nav'
  logoSource: /src/assets/images/component-docs/logo.svg
  logoAlt: Logo
  navData:
    - name: 'Home'
      path: '#'
      children: []
    - name: 'Resources'
      path: '#'
      children:
        - name: 'Blog'
          path: '#'
          children: []
        - name: 'Documentation'
          path: '#'
          children: []
        - name: 'Support'
          path: '#'
          children: []
    - name: 'Contact'
      path: '#'
      children: []
  buttons:
    - link: '#'
      variant: 'ghost'
      size: lg
      text: Search
      hideText: true
      iconName: magnifying-glass
    - link: '#'
      text: 'Careers'
      variant: 'ghost'
      iconName: 'arrow-top-right-on-square'
      iconPosition: 'after'
      _target: 'blank'
      rel: 'noopener noreferrer'
---
