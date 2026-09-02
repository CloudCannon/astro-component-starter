---
title: 'Mega menu, columns only'
spacing: ''
blocks:
  _component: 'navigation/bar'
  navData:
    - name: 'Home'
      path: '#'
      children: []
    - name: 'Products'
      path: ''
      megaMenu:
        columns:
          - heading: 'Build'
            items:
              - name: 'Page sections'
                description: 'Full-width blocks for assembling pages'
                icon: 'rectangle-group'
                path: '#'
              - name: 'Building blocks'
                description: 'Small elements composed inside sections'
                icon: 'cube'
                path: '#'
          - heading: 'Learn'
            items:
              - name: 'Project tour'
                path: '#'
              - name: 'Component builder'
                path: '#'
              - name: 'Theming guide'
                path: '#'
    - name: 'Pricing'
      path: '#'
      children: []
---

Omit `feature` to render columns only. Icons and descriptions are optional per link, so a column can be a plain link list. This item also has a real `path`, so it renders as a split row: the text is a link and the chevron opens the panel.
