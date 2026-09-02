---
_schema: default
title: About
description: Example about page with a studio story, timeline, team, and latest posts.
pageSections:
  - _component: page-sections/heroes/hero-split
    eyebrow: Our studio
    heading: We design and ship sites that editors can actually run
    subtext: >-
      We work with teams who need a marketing site that won't ossify the week
      after launch. Strategy, a component system, and a handoff your editors
      can live in.
    imageSource: /src/assets/images/component-docs/sunset.jpg
    imageAlt: Coastal cliffs at dusk
    imageAspectRatio: landscape
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: See our services
        hideText: false
        link: /examples/services/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
    reverse: false
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/stats
    eyebrow: ''
    heading: A few numbers from the work
    subtext: ''
    stats:
      - number: 40
        prefix: ''
        suffix: +
        label: Sites shipped
        sublabel: ''
      - number: 12
        prefix: ''
        suffix: ''
        label: Years
        sublabel: In this craft
      - number: 8
        prefix: ''
        suffix: ''
        label: People
        sublabel: Design and engineering
      - number: 2
        prefix: ''
        suffix: ''
        label: Offices
        sublabel: Dunedin and remote
    dividers: true
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/explainers/timeline
    eyebrow: History
    heading: How we got here
    subtext: ''
    layout: vertical
    entries:
      - year: ''
        date: '2014'
        title: Opened the studio
        body: Two of us, a spare room, and a handful of brochure sites.
      - year: ''
        date: '2018'
        title: First component library
        body: We stopped rebuilding the same hero for every client.
      - year: ''
        date: '2022'
        title: Visual editing as the handoff
        body: Editors started assembling pages without a ticket queue.
      - year: ''
        date: '2026'
        title: Still shipping
        body: Same craft, more of the system reused, fewer late nights on launch week.
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/collections/team-grid
    eyebrow: Our team
    heading: Meet the people
    subtext: Design, engineering, and the unglamorous work of keeping sites editable.
    teamMembers:
      - name: Alex Smith
        role: Lead Developer
        bio: >-
          Owns the component library and the build. Happiest when a new section
          lands without a follow-up CSS patch.
        imageSource: /src/assets/images/component-docs/profile1.jpg
        imageAlt: Alex Smith, Lead Developer
      - name: Tom Rodriguez
        role: Chief Technology Officer
        bio: >-
          Performance, accessibility, and saying no to a client-side framework
          when HTML would do.
        imageSource: /src/assets/images/component-docs/profile2.jpg
        imageAlt: Tom Rodriguez, Chief Technology Officer
      - name: Helen Kim
        role: Head of Design
        bio: >-
          Tokens, type, and the boring decisions that keep a ten-page site
          looking like one site.
        imageSource: /src/assets/images/component-docs/profile3.jpg
        imageAlt: Helen Kim, Head of Design
      - name: Emily Watson
        role: Director of Operations
        bio: >-
          Scopes, schedules, and making sure the handoff includes the editors,
          not just the repo.
        imageSource: /src/assets/images/component-docs/profile4.jpg
        imageAlt: Emily Watson, Director of Operations
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/proof/testimonial-section
    text: >-
      They gave us a site our marketing team can actually run. Six months in,
      we still haven't opened a ticket to change a heading.
    authorName: Priya Raman
    authorDescription: Head of Marketing
    authorImage: /src/assets/images/component-docs/profile.jpg
    alignmentHorizontal: center
    maxContentWidth: xl
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/collections/latest-posts
    eyebrow: Writing
    heading: From our blog
    subtext: ''
    count: 3
    tag: ''
    showViewAllButton: true
    viewAllLabel: View all posts
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/conversion/cta-split
    heading: Want to work together?
    subtext: Tell us about the site. We'll tell you if we're the right people for it.
    imageSource: /src/assets/images/component-docs/dunedin-cliff.jpg
    imageAlt: Sea cliffs above a bay
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: See our services
        hideText: false
        link: /examples/services/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
    reverse: false
    colorScheme: dark
    backgroundColor: surface
---
