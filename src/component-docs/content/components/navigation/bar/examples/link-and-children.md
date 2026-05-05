---
title: 'Link and children on the same item'
spacing: ''
blocks:
  _component: 'navigation/bar'
  navData:
    - name: 'Home'
      path: '/'
      children: []
    - name: 'Component library'
      path: '/component-docs/'
      children:
        - name: 'Project tour'
          path: '/component-docs/project-tour/'
          children: []
        - name: 'Customizing your brand'
          path: '/component-docs/customizing-your-brand/'
          children: []
    - name: 'Support hub'
      path: '/why/'
      children:
        - name: 'Guides'
          path: '/why/'
          children:
            - name: 'Site search'
              path: '/search/'
            - name: 'Blog'
              path: '/blog/'
        - name: 'Blog listing'
          children:
            - name: 'Blog Post'
              path: '/'
    - name: 'Label-only parent'
      path: '#'
      children:
        - name: 'Opens from row tap only'
          path: '/search/'
          children: []
        - name: 'Another link'
          path: '/why/'
          children: []
---
