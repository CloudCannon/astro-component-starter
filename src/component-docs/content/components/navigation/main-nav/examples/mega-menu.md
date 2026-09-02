---
title: 'Main Nav with a Mega Menu'
spacing: 'top'
blocks:
  _component: 'navigation/main-nav'
  logoSource: /src/assets/images/component-docs/logo.svg
  logoAlt: Logo
  navData:
    - name: 'Home'
      path: '#'
      children: []
    - name: 'Solutions'
      path: ''
      megaMenu:
        feature:
          image: /src/assets/images/component-docs/sunset.jpg
          imageAlt: 'Sunset over rolling hills'
          heading: 'Who is this for?'
          link: '#'
        columns:
          - heading: 'Client sites'
            items:
              - name: 'Agencies & freelancers'
                description: 'Quick launches & happy clients'
                icon: 'user-group'
                path: '#'
                highlight: true
              - name: 'Partner program'
                description: 'Earn points for every launch'
                icon: 'gift'
                path: '#'
          - heading: 'Your team'
            items:
              - name: 'Developers'
                description: 'Your stack + editing'
                icon: 'code-bracket'
                path: '#'
              - name: 'Content editors'
                description: 'Draft. Edit. Publish.'
                icon: 'pencil'
                path: '#'
          - heading: 'Site management'
            items:
              - name: 'Enterprise solutions'
                description: 'Built for how large teams actually work'
                icon: 'building-office'
                path: '#'
    - name: 'Pricing'
      path: '#'
      children: []
  buttonSections:
    - _component: building-blocks/core-elements/button
      link: '#'
      text: 'Get started'
      iconName: 'arrow-right'
      iconPosition: 'after'
---
