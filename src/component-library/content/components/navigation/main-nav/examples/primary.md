---
title: "Primary Main Nav"
spacing: "top"
blocks:
  _component: "navigation/main-nav"
  logoSource: /src/assets/images/component-library/logo.svg
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
  buttonSections:
    - _component: "building-blocks/core-elements/button"
      link: "#"
      variant: "ghost"
      size: lg
      text: Search
      hideText: true
      iconName: magnifying-glass
    - _component: "building-blocks/core-elements/button"
      link: "#"
      text: "Careers"
      variant: "ghost"
      iconName: "arrow-top-right-on-square"
      iconPosition: "after"
      _target: "blank"
      rel: "noopener noreferrer"
---
