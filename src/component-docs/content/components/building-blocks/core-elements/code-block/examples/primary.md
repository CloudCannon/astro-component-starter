---
title: 'Tabbed code with line numbers'
spacing: all
blocks:
  _component: building-blocks/core-elements/code-block
  tabs:
    - label: HTML
      language: HTML
      filename: workshop.html
      description: 'A semantic image with alternative text'
      code: |-
        <img
          src="/images/workshop.jpg"
          alt="A woodworker shaping a chair leg"
        />
    - label: Astro
      language: Astro
      filename: Image.astro
      description: 'The same image in an Astro component'
      code: |-
        ---
        const { src, alt } = Astro.props;
        ---

        <img src={src} alt={alt} />
  wrap: true
  copyButton: true
  lineNumbers: true
---
