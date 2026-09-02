---
title: 'Mega menu'
spacing: ''
blocks:
  _component: 'navigation/mobile'
  logoSource:
  logoAlt:
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

A top-level item with a `megaMenu` renders as an expandable section here: each column becomes a headed group of links, keeping the icons and dropping the feature card and descriptions. Use the same `navData` for [Bar](/component-docs/components/navigation/bar/) and Mobile and both stay in step.
