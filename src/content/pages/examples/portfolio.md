---
_schema: default
title: Portfolio
description: 'Example portfolio page for a web studio: a featured case study,
  more projects, results in numbers, and photography from client sites.'
keywords: []
pageSections:
  - _component: page-sections/heroes/hero-split
    sectionLabel: ''
    eyebrow: Example Portfolio
    heading: Sites our clients are still building on
    headingLevel: h1
    subtext: Five example projects from the last two years. Each one launched, got
      handed over, and kept growing without us in the room.
    imageSource: /src/assets/images/component-docs/website-project-solstice.svg
    imageAlt: 'The Solstice Festival site: a night-sky homepage with a crescent moon
      and a row of lineup cards'
    imageAspectRatio: landscape
    imageBleed: false
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Start a project
        hideText: false
        link: /examples/contact/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Read the case study
        hideText: false
        link: '#case-study'
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    reverse: false
    imageRounded: true
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
  - _component: page-sections/builders/custom-section
    label: Case study
    contentSections:
      - _component: building-blocks/core-elements/badge
        text: Case study
        iconName: ''
        showDot: false
        link: ''
        showArrow: false
        variant: brand
        size: sm
        alignmentHorizontal: none
      - _component: building-blocks/core-elements/heading
        text: Northwind Coastal Trust
        level: h2
        size: default
        alignmentHorizontal: start
        iconColor: default
        iconPosition: before
      - _component: building-blocks/core-elements/simple-text
        text: A membership site for a coastal conservation trust, rebuilt so the staff
          run it themselves.
        alignmentHorizontal: start
        size: lg
      - _component: building-blocks/wrappers/split
        label: ''
        firstColumnContentSections:
          - _component: building-blocks/core-elements/heading
            text: The problem
            level: h3
            size: xs
            alignmentHorizontal: start
            iconColor: default
            iconPosition: before
          - _component: building-blocks/core-elements/text
            text: Every event, appeal, and member update went through one contractor, so the
              site was always a few weeks behind the trust.
            alignmentHorizontal: start
            size: md
          - _component: building-blocks/core-elements/heading
            text: What we did
            level: h3
            size: xs
            alignmentHorizontal: start
            iconColor: default
            iconPosition: before
          - _component: building-blocks/core-elements/list
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
            direction: vertical
            alignmentHorizontal: start
            size: md
            listType: icon
        secondColumnContentSections:
          - _component: building-blocks/core-elements/image
            source: /src/assets/images/component-docs/website-project-northwind.svg
            alt: 'The Northwind Coastal Trust site: a teal hero with a wave, a list of
              upcoming events, and a membership card'
            decorative: false
            rounded: true
            aspectRatio: landscape
            positionVertical: center
            positionHorizontal: center
            priority: false
        distributionMode: half
        minSplitWidth: 700
        alignmentVertical: center
        reverse: false
        reverseOrderOnMobile: false
        gap: 2xl
        spaceBefore: loose
      - _component: building-blocks/core-elements/testimonial
        text: We used to plan our events around the website. Now the website keeps up
          with the events.
        authorName: Priya Raman
        authorDescription: Head of Marketing, Northwind Coastal Trust
        authorImage: /src/assets/images/component-docs/profile1.jpg
        avatarSize: 56
        alignmentHorizontal: center
        spaceBefore: loose
    maxContentWidth: 2xl
    paddingHorizontal: md
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: surface
    rounded: false
  - _component: page-sections/explainers/feature-slider
    sectionLabel: ''
    slides:
      - _component: page-sections/explainers/feature-slider/feature-slider-item
        eyebrow: Globex Travel
        title: Campaign pages without a design ticket
        description: Marketing ships a landing page a week in campaign season. The
          guardrails hold, and every page still looks like Globex.
        imageSource: /src/assets/images/component-docs/website-project-globex.svg
        imageAlt: 'The Globex Travel site: a sunset hero over mountains and a row of
          destination cards'
      - _component: page-sections/explainers/feature-slider/feature-slider-item
        eyebrow: Umbra Stays
        title: A hotel site the front desk keeps current
        description: Rooms, seasonal offers, and a booking bar on every page. A new
          offer goes live the afternoon it's agreed.
        imageSource: /src/assets/images/component-docs/website-project-umbra.svg
        imageAlt: 'The Umbra Stays site: a warm split hero with an arched window and a
          booking bar for dates and guests'
      - _component: page-sections/explainers/feature-slider/feature-slider-item
        eyebrow: Vertex Growers
        title: A directory of two hundred local producers
        description: Growers add their own listings and the map updates itself. The
          co-op team just approves them.
        imageSource: /src/assets/images/component-docs/website-project-vertex.svg
        imageAlt: 'The Vertex Growers site: a search bar and filter chips above producer
          listings beside a map of pins'
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
    imageAspectRatio: landscape
  - _component: page-sections/explainers/stats
    sectionLabel: ''
    eyebrow: Results
    heading: What changed after launch
    headingLevel: h2
    subtext: Measured by our clients, a year after handoff.
    stats:
      - number: 52
        prefix: ''
        suffix: ''
        label: Pages Globex built itself
      - number: 3
        prefix: ''
        suffix: ' days'
        label: Brief to live at Umbra
      - number: 100
        prefix: ''
        suffix: ''
        label: Lighthouse at Northwind
      - number: 0
        prefix: ''
        suffix: ''
        label: Solstice developer tickets
    dividers: true
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: dark
    lockColorScheme: false
    backgroundColor: surface
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
  - _component: page-sections/collections/gallery-grid
    sectionLabel: ''
    eyebrow: Photography
    heading: Shot for the sites
    headingLevel: h2
    subtext: We art-direct the photography as well as the pages. Select a frame to
      see it full size.
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
    columns: 3
    gap: md
    aspectRatio: square
    lightbox: true
    showThumbnails: true
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: surface
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
  - _component: page-sections/conversion/cta-center
    sectionLabel: ''
    heading: Have a project like these?
    headingLevel: h2
    subtext: Tell us what you're working on. We reply within a working day.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Start a project
        hideText: false
        link: /examples/contact/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: How we work
        hideText: false
        link: /examples/services/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    maxContentWidth: lg
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: dark
    lockColorScheme: false
    backgroundColor: surface
    background:
      type: image
      imageSource: ''
      imageAlt: ''
      positionVertical: top
      positionHorizontal: center
      fixed: false
      priority: false
      mask: none
      overlay: 0
---
