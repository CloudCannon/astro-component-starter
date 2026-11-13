---
_schema: default
title: About
description: 'Example about page for a web studio: story, values, timeline,
  team, a client quote, and the latest posts.'
keywords: []
pageSections:
  - _component: page-sections/heroes/hero-split
    sectionLabel: ''
    eyebrow: About the Example studio
    heading: We build sites that editors can actually run
    headingLevel: h1
    subtext: We're a small studio in New Zealand working with teams who need a
      marketing site that keeps up with them. We plan it, design it, build it,
      and then step back so your editors can take over.
    imageSource: /src/assets/images/component-docs/sunset.jpg
    imageAlt: Coastal cliffs at dusk above a calm sea
    imageAspectRatio: landscape
    imageBleed: false
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: See our work
        hideText: false
        link: /examples/portfolio/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Get in touch
        hideText: false
        link: /examples/contact/
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
  - _component: page-sections/explainers/stats
    sectionLabel: ''
    eyebrow: ''
    heading: Twelve years, in numbers
    headingLevel: h2
    subtext: ''
    stats:
      - number: 40
        prefix: ''
        suffix: +
        label: Sites shipped since 2014
      - number: 6
        prefix: ''
        suffix: ''
        label: People on the team
      - number: 3
        prefix: ''
        suffix: ' days'
        label: To a client's first solo page
      - number: 98
        prefix: ''
        suffix: ''
        label: Median Lighthouse score
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
  - _component: page-sections/explainers/feature-grid
    sectionLabel: ''
    eyebrow: How we work
    heading: Three things we won't trade away
    headingLevel: h2
    subtext: ''
    alignmentHorizontal: start
    features:
      - title: Editors come first
        description: We design the editing experience alongside the pages. If your
          marketing team can't change it, it isn't finished.
        iconName: square-pen
        iconColor: blue
        iconBackground: true
      - title: Plain, fast pages
        description: Static HTML, small stylesheets, and JavaScript only where a
          component needs it. Fast on a phone in a field, not just on our
          laptops.
        iconName: zap
        iconColor: yellow
        iconBackground: true
      - title: Handoffs, not hostages
        description: You own the code, the content, and the hosting account. We leave
          you documentation, not a dependency.
        iconName: key
        iconColor: green
        iconBackground: true
    maxContentWidth: 2xl
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
  - _component: page-sections/explainers/timeline-section
    sectionLabel: ''
    eyebrow: History
    heading: How we got here
    headingLevel: h2
    subtext: ''
    layout: split
    entries:
      - year: ''
        date: '2014'
        title: Opened the studio
        body: Two of us, a spare room, and a handful of brochure sites for local shops.
        iconName: rocket
      - year: ''
        date: '2018'
        title: First full-time hires
        body: A designer and a developer joined, and we signed our first care-plan
          clients.
        iconName: user-plus
      - year: ''
        date: '2022'
        title: A studio of our own
        body: Out of the spare room and into a shopfront on Vogel Street.
        iconName: store
      - year: ''
        date: '2026'
        title: Still shipping
        body: Six people, clients across New Zealand and Australia, and far fewer late
          nights on launch week.
        iconName: sparkles
    maxContentWidth: 2xl
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
  - _component: page-sections/collections/team-grid
    sectionLabel: ''
    eyebrow: Our team
    heading: The people you'll work with
    headingLevel: h2
    subtext: Every project is led by one of us, start to finish.
    teamMembers:
      - name: Helen Kim
        role: Founder and design director
        bio: Tokens, type, and the quiet decisions that keep a forty-page site looking
          like one site.
        imageSource: /src/assets/images/component-docs/profile3.jpg
        imageAlt: Helen Kim
      - name: Tom Rodriguez
        role: Lead developer
        bio: Owns the component library and the build. Happiest when a new section ships
          without a follow-up CSS patch.
        imageSource: /src/assets/images/component-docs/profile5.jpg
        imageAlt: Tom Rodriguez
      - name: Emily Watson
        role: Head of delivery
        bio: Scopes, schedules, and training. Makes sure the handoff includes the
          editors, not just the repository.
        imageSource: /src/assets/images/component-docs/profile4.jpg
        imageAlt: Emily Watson
    maxContentWidth: 2xl
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
  - _component: page-sections/proof/testimonial-section
    sectionLabel: ''
    text: They gave us a site our marketing team can actually run. Six months in, we
      still haven't opened a ticket to change a heading.
    authorName: Priya Raman
    authorDescription: Head of Marketing, Northwind Coastal Trust
    authorImage: /src/assets/images/component-docs/profile1.jpg
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
  - _component: page-sections/collections/latest-posts
    sectionLabel: ''
    eyebrow: Writing
    heading: Notes from the studio
    headingLevel: h2
    subtext: ''
    count: 3
    tag: ''
    showViewAllButton: true
    viewAllLabel: View all posts
    maxContentWidth: 2xl
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
  - _component: page-sections/conversion/cta-split
    sectionLabel: ''
    heading: Have a site that needs to outlast its launch?
    headingLevel: h2
    subtext: Tell us about it. We'll tell you honestly whether we're the right
      people for it.
    imageSource: /src/assets/images/component-docs/dunedin-cliff.jpg
    imageAlt: Sea cliffs above a turquoise bay
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
        text: Our services
        hideText: false
        link: /examples/services/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    reverse: false
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
---
