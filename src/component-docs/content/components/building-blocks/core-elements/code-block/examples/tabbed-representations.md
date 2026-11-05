---
title: 'Tabbed representations'
spacing: all
blocks:
  _component: building-blocks/core-elements/code-block
  tabs:
    - label: YAML
      language: YAML
      filename: install.yml
      code: |-
        package:
          name: starter
          manager: npm
    - label: JSON
      language: JSON
      filename: install.json
      description: The same installation settings in JSON.
      code: |-
        {
          "package": { "name": "starter", "manager": "npm" }
        }
  copyButton: true
---
