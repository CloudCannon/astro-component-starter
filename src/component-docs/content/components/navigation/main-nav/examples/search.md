---
title: 'Site search'
spacing: 'top'
blocks:
  _component: 'navigation/main-nav'
  logoSource: /src/assets/images/component-docs/logo.svg
  logoAlt: Logo
  search: true
  searchPlaceholder: 'Search the docs'
  navData:
    - name: 'Home'
      path: '#'
      children: []
    - name: 'Guides'
      path: '#'
      children:
        - name: 'Project tour'
          path: '#'
          children: []
        - name: 'Theming'
          path: '#'
          children: []
    - name: 'Blog'
      path: '#'
      children: []
  buttonSections:
    - _component: building-blocks/core-elements/button
      link: '#'
      text: 'Get started'
      iconName: 'arrow-right'
      iconPosition: 'after'
---

Turn on `search` to add the site-wide search button. The index is generated when the site builds, so results only appear on a built site.
