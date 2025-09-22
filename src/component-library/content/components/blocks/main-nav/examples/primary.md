---
title: "Primary Main Nav"
spacing: "top"
blocks:
  _bookshop_name: "blocks/main-nav"
  logoSource: /component-library/images/logo.svg
  logoAlt: Logo
  navData:
    - name: "Home"
      path: "#"
      children: []
    - name: "Resources"
      path: "#"
      children:
        - name: "Blog"
          path: "#"
          children: []
        - name: "Documentation"
          path: "#"
          children: []
        - name: "Support"
          path: "#"
          children: []
    - name: "Contact"
      path: "#"
      children: []
  buttonBlocks:
    - _bookshop_name: "elements/button"
      link: "#"
      variant: "ghost"
      size: lg
      text: Search
      iconName: magnifying-glass
      hideText: true
    - _bookshop_name: "elements/button"
      link: "#"
      text: "Careers"
      variant: "ghost"
      iconName: "arrow-top-right-on-square"
      iconPosition: "after"
      _target: "blank"
      rel: "noopener noreferrer"
---
