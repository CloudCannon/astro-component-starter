---
title: 'Mega menu'
spacing: ''
blocks:
  _component: 'navigation/bar'
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
---

A top-level item with a `megaMenu` object opens a full-width panel instead of a dropdown: an optional feature card beside columns of grouped links, each with an optional icon and description. `highlight: true` gives a link a surface background.
