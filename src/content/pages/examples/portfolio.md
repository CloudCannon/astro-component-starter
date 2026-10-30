---
_schema: default
title: Portfolio
description: >-
  Example portfolio page for a web studio: a featured case study, more projects,
  results in numbers, and photography from client sites.
pageSections:
  - _component: page-sections/heroes/hero-split
    eyebrow: Portfolio
    heading: Sites our clients are still building on
    headingLevel: h1
    subtext: >-
      Five projects from the last two years. Each one launched, got handed over,
      and kept growing without us in the room.
    imageSource: /src/assets/images/component-docs/website-project-solstice.svg
    imageAlt: >-
      The Solstice Festival site: a night-sky homepage with a crescent moon and a
      row of lineup cards
    imageAspectRatio: landscape
    imageRounded: true
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Start a project
        link: /examples/contact/
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Read the case study
        link: '#case-study'
        variant: secondary
        size: md
    reverse: false
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/builders/custom-section
    label: Case study
    contentSections:
      - _component: building-blocks/core-elements/badge
        text: Case study
        variant: brand
        size: sm
        showArrow: false
      - _component: building-blocks/core-elements/heading
        text: Northwind Coastal Trust
        level: h2
        size: default
      - _component: building-blocks/core-elements/simple-text
        text: >-
          A membership site for a coastal conservation trust, rebuilt so the staff
          run it themselves.
        size: lg
      - _component: building-blocks/wrappers/split
        firstColumnContentSections:
          - _component: building-blocks/core-elements/heading
            text: The problem
            level: h3
            size: xs
          - _component: building-blocks/core-elements/text
            text: >-
              Every event, appeal, and member update went through one contractor,
              so the site was always a few weeks behind the trust.
          - _component: building-blocks/core-elements/heading
            text: What we did
            level: h3
            size: xs
          - _component: building-blocks/core-elements/list
            listType: icon
            items:
              - text: Two weeks of strategy with staff and volunteers
                iconName: check
                iconColor: green
              - text: A design system built from the trust's print brand
                iconName: check
                iconColor: green
              - text: Events, news, and the members area from one set of sections
                iconName: check
                iconColor: green
              - text: Training for the five people who now run it
                iconName: check
                iconColor: green
        secondColumnContentSections:
          - _component: building-blocks/core-elements/image
            source: /src/assets/images/component-docs/website-project-northwind.svg
            alt: >-
              The Northwind Coastal Trust site: a teal hero with a wave, a list of
              upcoming events, and a membership card
            rounded: true
            aspectRatio: landscape
        distributionMode: half
        alignmentVertical: center
        gap: 2xl
        spaceBefore: loose
      - _component: building-blocks/core-elements/testimonial
        text: >-
          We used to plan our events around the website. Now the website keeps up
          with the events.
        authorName: Priya Raman
        authorDescription: Head of Marketing, Northwind Coastal Trust
        authorImage: /src/assets/images/component-docs/profile1.jpg
        avatarSize: 56
        alignmentHorizontal: center
        spaceBefore: loose
    maxContentWidth: 2xl
    paddingHorizontal: md
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/explainers/feature-slider
    slides:
      - eyebrow: Globex Travel
        title: Campaign pages without a design ticket
        description: >-
          Marketing ships a landing page a week in campaign season. The guardrails
          hold, and every page still looks like Globex.
        imageSource: /src/assets/images/component-docs/website-project-globex.svg
        imageAlt: >-
          The Globex Travel site: a sunset hero over mountains and a row of
          destination cards
      - eyebrow: Umbra Stays
        title: A hotel site the front desk keeps current
        description: >-
          Rooms, seasonal offers, and a booking bar on every page. A new offer goes
          live the afternoon it's agreed.
        imageSource: /src/assets/images/component-docs/website-project-umbra.svg
        imageAlt: >-
          The Umbra Stays site: a warm split hero with an arched window and a
          booking bar for dates and guests
      - eyebrow: Vertex Growers
        title: A directory of two hundred local producers
        description: >-
          Growers add their own listings and the map updates itself. The co-op team
          just approves them.
        imageSource: /src/assets/images/component-docs/website-project-vertex.svg
        imageAlt: >-
          The Vertex Growers site: a search bar and filter chips above producer
          listings beside a map of pins
    imageAspectRatio: landscape
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/stats
    eyebrow: Results
    heading: What changed after launch
    subtext: Measured by our clients, a year after handoff.
    stats:
      - number: 52
        prefix: ''
        suffix: ''
        label: Pages Globex built itself
        sublabel: ''
      - number: 3
        prefix: ''
        suffix: ' days'
        label: Brief to live at Umbra
        sublabel: ''
      - number: 100
        prefix: ''
        suffix: ''
        label: Lighthouse at Northwind
        sublabel: ''
      - number: 0
        prefix: ''
        suffix: ''
        label: Solstice developer tickets
        sublabel: ''
    dividers: true
    colorScheme: dark
    backgroundColor: surface
  - _component: page-sections/collections/gallery-grid
    eyebrow: Photography
    heading: Shot for the sites
    subtext: >-
      We art-direct the photography as well as the pages. Select a frame to see it
      full size.
    images:
      - image: /src/assets/images/component-docs/dunedin-cliff.jpg
        alt: Sea cliffs above a turquoise bay, with gorse flowering in the foreground
        caption: 'Northwind Coastal Trust: membership campaign'
      - image: /src/assets/images/component-docs/castle.jpg
        alt: A ruined stone castle under a starry night sky
        caption: 'Solstice Festival: opening night'
      - image: /src/assets/images/component-docs/sheep.jpg
        alt: Two sheep grazing on a headland high above the ocean
        caption: 'Vertex Growers: producer profiles'
      - image: /src/assets/images/component-docs/sunset.jpg
        alt: Coastal cliffs at dusk with the sun low over the sea
        caption: 'Globex Travel: autumn campaign'
      - image: /src/assets/images/component-docs/quiet-street.jpg
        alt: A quiet hillside street lined with flowering shrubs
        caption: 'Umbra Stays: neighborhood guide'
      - image: /src/assets/images/component-docs/video-placeholder.jpg
        alt: Water poured into a glass tumbler on a dark stone counter
        caption: 'Umbra Stays: room details'
    layout: grid
    columns: 3
    gap: md
    aspectRatio: square
    lightbox: true
    showThumbnails: true
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/conversion/cta-center
    heading: Have a project like these?
    subtext: Tell us what you're working on. We reply within a working day.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Start a project
        link: /examples/contact/
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: How we work
        link: /examples/services/
        variant: secondary
        size: md
    colorScheme: dark
    backgroundColor: surface
---
