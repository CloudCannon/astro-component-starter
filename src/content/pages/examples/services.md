---
_schema: default
title: Services
description: Example services page with cards, a process, client logos, testimonials, and a form.
pageSections:
  - _component: page-sections/collections/card-collection
    headingLevel: h1
    eyebrow: What we do
    heading: Services built for the long run
    subtext: ''
    items:
      - image: /src/assets/images/component-docs/dunedin-cliff.jpg
        imageAlt: Sea cliffs above a turquoise bay
        link: ''
        contentSections:
          - _component: building-blocks/core-elements/badge
            text: Strategy
            variant: plain
            size: sm
            showArrow: false
          - _component: building-blocks/core-elements/heading
            text: Discovery and planning
            level: h2
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Two weeks of research, a content audit, and a sitemap you can
              actually build against.
            size: sm
      - image: /src/assets/images/component-docs/castle.jpg
        imageAlt: Ruined stone castle under a starry night sky
        link: ''
        contentSections:
          - _component: building-blocks/core-elements/badge
            text: Design
            variant: plain
            size: sm
            showArrow: false
          - _component: building-blocks/core-elements/heading
            text: Design systems
            level: h2
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              A component library and token set your team can extend without a
              redesign.
            size: sm
      - image: /src/assets/images/component-docs/sunset.jpg
        imageAlt: Coastal cliffs at dusk
        link: ''
        contentSections:
          - _component: building-blocks/core-elements/badge
            text: Build
            variant: plain
            size: sm
            showArrow: false
          - _component: building-blocks/core-elements/heading
            text: Site build and migration
            level: h2
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Your content moved across, page by page, with redirects and no
              lost search rankings.
            size: sm
    layout: grid
    columns: 3
    gap: lg
    aspectRatio: landscape
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/feature-split
    eyebrow: Design systems
    heading: A library your team can keep
    subtext: >-
      We don't hand over a pile of unique page templates. You get a small set of
      sections, tokens that match your brand, and enough documentation that the
      next landing page doesn't need us.
    buttonSections: []
    imageSource: /src/assets/images/component-docs/website-feature.svg
    imageAlt: Component layout
    imageAspectRatio: none
    imageRounded: false
    reverse: false
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/explainers/feature-split
    eyebrow: Migrations
    heading: Move the site without losing the plot
    subtext: >-
      Redirects, metadata, and the unglamorous inventory of URLs. Editors keep
      writing in the new system on day one, not after a six-week freeze.
    buttonSections: []
    imageSource: /src/assets/images/component-docs/website-split.svg
    imageAlt: Split page layout
    imageAspectRatio: none
    imageRounded: false
    reverse: true
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/explainers/steps
    eyebrow: How we work
    heading: An engagement in four moves
    subtext: ''
    items:
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Scope
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Pages, content, and who will edit the site after we leave.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: System
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Tokens and sections, designed against the real sitemap.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Build
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Content in, redirects mapped, editors in the preview.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Handoff
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Training, a short guide, and a clean repo, not a war room.
            size: sm
    orientation: horizontal
    imageAspectRatio: landscape
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/proof/logo-cloud
    heading: Teams we work with
    logos:
      - image: /src/assets/images/component-docs/logo-acme.svg
        alt: Acme
        url: ''
      - image: /src/assets/images/component-docs/logo-northwind.svg
        alt: Northwind
        url: ''
      - image: /src/assets/images/component-docs/logo-globex.svg
        alt: Globex
        url: ''
      - image: /src/assets/images/component-docs/logo-vertex.svg
        alt: Vertex
        url: ''
      - image: /src/assets/images/component-docs/logo-umbra.svg
        alt: Umbra
        url: ''
      - image: /src/assets/images/component-docs/logo-solstice.svg
        alt: Solstice
        url: ''
    grayscale: true
    scrolling: true
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/proof/testimonial-wall
    eyebrow: Testimonials
    heading: After the handoff
    subtext: ''
    testimonials:
      - text: >-
          We handed the site to our marketing team on a Friday and they had three
          new landing pages live by Monday. No tickets, no deploys, nothing broken.
        authorName: Priya Raman
        authorDescription: Head of Marketing, Northwind
        authorImage: /src/assets/images/component-docs/profile.jpg
      - text: >-
          The editing experience is the part that sold us. Everything is visual,
          and the guardrails mean nobody can wreck the design.
        authorName: Tom Alvarez
        authorDescription: Founder, Fieldnote
        authorImage: /src/assets/images/component-docs/profile1.jpg
      - text: >-
          Our Lighthouse scores went up without anyone working on performance.
          That never happens on a redesign.
        authorName: Dana Whitfield
        authorDescription: Engineering Lead, Cascade
        authorImage: /src/assets/images/component-docs/profile2.jpg
      - text: >-
          Two weeks from kickoff to launch, including content. The component
          library did most of the work for us.
        authorName: Sam Okafor
        authorDescription: Design Director, Loam Studio
        authorImage: /src/assets/images/component-docs/profile3.jpg
      - text: >-
          They treated the CMS as part of the product, not an afterthought. Our
          editors noticed on day one.
        authorName: Jordan Hale
        authorDescription: Digital Lead, Harbor & Co
        authorImage: /src/assets/images/component-docs/profile4.jpg
    columns: 3
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/conversion/cta-form
    heading: Tell us about the site
    subtext: >-
      A few lines on what you need and when. We'll reply with whether we're a
      fit, and what a first phase would look like.
    formAction: ./
    formBlocks:
      - _component: building-blocks/forms/input
        label: Name
        name: name
        type: text
        required: true
      - _component: building-blocks/forms/input
        label: Email
        name: email
        type: email
        required: true
      - _component: building-blocks/forms/textarea
        label: Message
        name: message
        required: true
      - _component: building-blocks/forms/submit
        text: Send message
        variant: primary
        size: md
        iconPosition: before
        hideText: false
        disabled: false
    imageSource: /src/assets/images/component-docs/castle.jpg
    imageAlt: Coastal castle at night
    reverse: false
    colorScheme: inherit
    backgroundColor: surface
---
