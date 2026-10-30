---
_schema: default
title: Examples
description: >-
  Template pages for a fictional web studio, built only from the component
  library: services, portfolio, pricing, about, contact, and a blog.
pageSections:
  - _component: page-sections/heroes/hero-center
    eyebrow: Examples
    heading: A small studio site, built from the library
    headingLevel: h1
    subtext: >-
      Every section on these pages is a stock component. Copy one, change the
      words, and it's yours.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Start with Services
        link: /examples/services/
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Browse components
        link: /component-docs/
        variant: secondary
        size: md
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/collections/card-collection
    eyebrow: ''
    heading: Pick a page to start from
    subtext: ''
    items:
      - image: /src/assets/images/component-docs/website-example-services.svg
        imageAlt: Service cards above process steps and a customer quote
        link: /examples/services/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Services
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              What the studio offers, tabbed detail on each engagement, a process,
              quotes, and an enquiry form.
            size: sm
      - image: /src/assets/images/component-docs/website-example-portfolio.svg
        imageAlt: A masonry image gallery with a featured tile and caption
        link: /examples/portfolio/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Portfolio
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              A case study, more projects in a slider, results in numbers, and a
              photo gallery that opens full size.
            size: sm
      - image: /src/assets/images/component-docs/website-example-pricing.svg
        imageAlt: Three pricing plan cards with a highlighted middle tier
        link: /examples/pricing/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Pricing
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Care plans with a monthly and annual switch, a comparison table,
              client quotes, and billing questions.
            size: sm
      - image: /src/assets/images/component-docs/website-example-about.svg
        imageAlt: An about page with a hero, a timeline, and a team card
        link: /examples/about/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: About
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              The studio's story, values, timeline, and team, with posts pulled in
              from the blog.
            size: sm
      - image: /src/assets/images/component-docs/website-example-contact.svg
        imageAlt: Contact details beside an enquiry form, above three next steps
        link: /examples/contact/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Contact
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Ways to get in touch, an enquiry form, what happens next, common
              questions, and a newsletter signup.
            size: sm
      - image: /src/assets/images/component-docs/website-example-blog.svg
        imageAlt: A blog listing with tag filters above a grid of post cards
        link: /blog/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Blog
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              A listing page, tag pages, and demo posts. The post bodies stay
              placeholder Latin on purpose.
            size: sm
    layout: grid
    columns: 3
    gap: lg
    aspectRatio: landscape
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/explainers/stats
    eyebrow: ''
    heading: What's in the set
    subtext: ''
    stats:
      - number: 6
        prefix: ''
        suffix: ''
        label: Pages
        sublabel: ''
      - number: 41
        prefix: ''
        suffix: ''
        label: Components in use
        sublabel: ''
      - number: 24
        prefix: ''
        suffix: ''
        label: Page sections
        sublabel: ''
      - number: 0
        prefix: ''
        suffix: ''
        label: Lines of custom CSS
        sublabel: ''
    dividers: true
    colorScheme: dark
    backgroundColor: surface
  - _component: page-sections/explainers/steps-section
    eyebrow: Make one yours
    heading: From example to your own page
    subtext: ''
    items:
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Copy the file
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Each page is one Markdown file. Copy it out of the examples folder.
            size: sm
          - _component: building-blocks/core-elements/code-block
            tabs:
              - label: Terminal
                language: Shell
                code: cp src/content/pages/examples/services.md src/content/pages/services.md
                filename: ''
                description: ''
            wrap: true
            copyButton: true
            lineNumbers: false
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Rewrite it in the editor
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Open your copy in CloudCannon and change the words, images, and
              links right on the page. Add or remove sections from the same view.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Clear out the demo
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              When you've taken what you need, remove the examples and the rest of
              the demo content.
            size: sm
          - _component: building-blocks/core-elements/code-block
            tabs:
              - label: Terminal
                language: Shell
                code: npm run reset:starter
                filename: ''
                description: ''
            wrap: true
            copyButton: true
            lineNumbers: false
    orientation: horizontal
    imageAspectRatio: landscape
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/conversion/cta-center
    heading: Need a section these pages don't use?
    subtext: >-
      Every component has its own page, with a live example, its options, and
      YAML you can paste.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Browse components
        link: /component-docs/
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Get started
        link: /start/
        variant: secondary
        size: md
    colorScheme: dark
    backgroundColor: surface
---
