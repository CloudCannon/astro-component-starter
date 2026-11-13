---
_schema: default
title: Services
description: 'Example services page for a web studio: what it offers, what each
  engagement includes, how a project runs, client quotes, an FAQ, and an enquiry
  form.'
keywords: []
pageSections:
  - _component: page-sections/heroes/hero-center
    sectionLabel: ''
    eyebrow: Example Services
    heading: From the first sitemap to the hundredth page
    headingLevel: h1
    subtext: Strategy, design systems, builds, and ongoing care for marketing sites
      that a whole team edits. Take one service, or all four.
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
        text: See care plans
        hideText: false
        link: /examples/pricing/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
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
  - _component: page-sections/explainers/feature-grid
    sectionLabel: ''
    eyebrow: What we do
    heading: Four services, one team
    headingLevel: h2
    subtext: ''
    alignmentHorizontal: start
    features:
      - title: Strategy
        description: Research, a content audit, and a sitemap you can build against. Two
          weeks, fixed price.
        iconName: map
        iconColor: blue
        iconBackground: true
      - title: Design systems
        description: A component library and token set your team can extend without
          another redesign.
        iconName: swatch-book
        iconColor: purple
        iconBackground: true
      - title: Build and migration
        description: Your content moved across page by page, with every redirect mapped
          and your search rankings kept.
        iconName: code
        iconColor: green
        iconBackground: true
      - title: Care
        description: Updates, fixes, and a few hours a month for new sections, on a plan
          that fits how often you publish.
        iconName: life-buoy
        iconColor: orange
        iconBackground: true
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
  - _component: page-sections/builders/custom-section
    label: Engagement details
    contentSections:
      - _component: building-blocks/core-elements/heading
        text: What's in each engagement
        level: h2
        size: default
        alignmentHorizontal: start
        iconColor: default
        iconPosition: before
      - _component: building-blocks/core-elements/simple-text
        text: Pick a service to see what you get at the end of it.
        alignmentHorizontal: start
        size: md
      - _component: building-blocks/wrappers/content-selector
        label: Services
        items:
          - title: Strategy
            subtext: Two weeks
            iconName: map
            iconColor: blue
            contentSections:
              - _component: building-blocks/core-elements/text
                text: Two weeks to agree on what the new site has to do, before anyone opens a
                  design tool.
                alignmentHorizontal: start
                size: md
              - _component: building-blocks/wrappers/steps
                label: ''
                orientation: vertical
                imageAspectRatio: landscape
                items:
                  - image: ''
                    imageAlt: ''
                    contentSections:
                      - _component: building-blocks/core-elements/heading
                        text: 'Week one: listen'
                        level: h3
                        size: xs
                      - _component: building-blocks/core-elements/simple-text
                        text: Interviews with the people who will use and edit the site, and a review of
                          your analytics.
                        size: sm
                  - image: ''
                    imageAlt: ''
                    contentSections:
                      - _component: building-blocks/core-elements/heading
                        text: 'Week two: plan'
                        level: h3
                        size: xs
                      - _component: building-blocks/core-elements/simple-text
                        text: A content audit, a sitemap, and a page-by-page plan you can build against.
                        size: sm
                  - image: ''
                    imageAlt: ''
                    contentSections:
                      - _component: building-blocks/core-elements/heading
                        text: 'Then: a fixed quote'
                        level: h3
                        size: xs
                      - _component: building-blocks/core-elements/simple-text
                        text: A price for the build that won't move once we start.
                        size: sm
          - title: Design systems
            subtext: Four to six weeks
            iconName: swatch-book
            iconColor: purple
            contentSections:
              - _component: building-blocks/wrappers/split
                label: ''
                firstColumnContentSections:
                  - _component: building-blocks/core-elements/text
                    text: Instead of a pile of one-off templates, you get a small set of sections
                      that combine into any page, styled from tokens that match
                      your brand.
                    alignmentHorizontal: start
                    size: md
                  - _component: building-blocks/core-elements/list
                    items:
                      - text: Color, type, and spacing tokens
                        iconName: check
                        iconColor: green
                      - text: Sections designed against your real content
                        iconName: check
                        iconColor: green
                      - text: Light and dark themes
                        iconName: check
                        iconColor: green
                      - text: A component reference your team can browse
                        iconName: check
                        iconColor: green
                    direction: vertical
                    alignmentHorizontal: start
                    size: md
                    listType: icon
                secondColumnContentSections:
                  - _component: building-blocks/core-elements/image
                    source: /src/assets/images/component-docs/website-step-brand.svg
                    alt: A theme panel with brand colors, a typeface, and corner radius beside a
                      page preview in the new brand
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
                gap: xl
          - title: Build and migration
            subtext: Six to ten weeks
            iconName: code
            iconColor: green
            contentSections:
              - _component: building-blocks/core-elements/text
                text: We build the site, move your content across, and keep every old URL
                  working. Your team starts writing in the new site on day one.
                alignmentHorizontal: start
                size: md
              - _component: building-blocks/core-elements/table
                caption: What moves, and how
                headerCells:
                  - What
                  - How we handle it
                rows:
                  - cells:
                      - Pages
                      - Moved one by one and checked by a person
                  - cells:
                      - Old URLs
                      - A redirect for every one, tested before launch
                  - cells:
                      - Images
                      - Resized for the web, with alt text written
                  - cells:
                      - Search rankings
                      - Titles, descriptions, and structure carried over
                  - cells:
                      - Your team
                      - Trained on the new site before it goes live
                firstColumnHeader: true
                striped: true
                compact: false
          - title: Care
            subtext: Monthly
            iconName: life-buoy
            iconColor: orange
            contentSections:
              - _component: building-blocks/core-elements/text
                text: After launch we keep the site patched and fast, and spend a few hours each
                  month on whatever your team needs next.
                alignmentHorizontal: start
                size: md
              - _component: building-blocks/core-elements/testimonial
                text: Every month there's something new on our site, and we've never had to
                  write a brief for it.
                authorName: Priya Raman
                authorDescription: Head of Marketing, Northwind Coastal Trust
                authorImage: /src/assets/images/component-docs/profile1.jpg
                avatarSize: 48
                alignmentHorizontal: start
              - _component: building-blocks/core-elements/button
                text: Compare care plans
                link: /examples/pricing/
                iconName: arrow-right
                iconPosition: after
                variant: secondary
                size: sm
        navigationPosition: start
    maxContentWidth: 2xl
    paddingHorizontal: md
    paddingVertical: 4xl
    colorScheme: inherit
    lockColorScheme: false
    backgroundColor: base
    rounded: false
  - _component: page-sections/explainers/steps-section
    sectionLabel: ''
    eyebrow: How we work
    heading: An engagement in four moves
    headingLevel: h2
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
            alignmentHorizontal: start
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Design
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Sections and a look, designed against the real sitemap.
            alignmentHorizontal: start
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Build
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Content in, redirects mapped, and a staging link to review.
            alignmentHorizontal: start
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Handoff
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Training, a short guide, and a calm launch day.
            alignmentHorizontal: start
            size: sm
    orientation: horizontal
    imageAspectRatio: landscape
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
  - _component: page-sections/proof/logo-cloud
    sectionLabel: ''
    heading: Teams we've worked with
    logos:
      - image: /src/assets/images/component-docs/logo-northwind.svg
        alt: Northwind
        url: ''
      - image: /src/assets/images/component-docs/logo-solstice.svg
        alt: Solstice
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
      - image: /src/assets/images/component-docs/logo-acme.svg
        alt: Acme
        url: ''
    grayscale: true
    scrolling: true
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: 2xl
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
  - _component: page-sections/proof/testimonial-wall
    sectionLabel: ''
    eyebrow: Testimonials
    heading: After the handoff
    headingLevel: h2
    subtext: ''
    testimonials:
      - text: We handed the site to our marketing team on a Friday and they had three
          new landing pages live by Monday. No tickets, no deploys, nothing
          broken.
        authorName: Priya Raman
        authorDescription: Head of Marketing, Northwind Coastal Trust
        authorImage: /src/assets/images/component-docs/profile1.jpg
      - text: The editing experience is the part that sold us. Everything is visual, and
          the guardrails mean nobody can wreck the design.
        authorName: Tom Alvarez
        authorDescription: Founder, Vertex Growers
        authorImage: /src/assets/images/component-docs/profile.jpg
      - text: Our festival program changes daily in the last month. The team updates it
          themselves now, and the site has stayed fast through every sellout.
        authorName: Dana Whitfield
        authorDescription: Program Director, Solstice Festival
        authorImage: ''
      - text: Two weeks from kickoff to a new landing page, content included. The
          component library did most of the work.
        authorName: Sam Okafor
        authorDescription: Marketing Manager, Umbra Stays
        authorImage: /src/assets/images/component-docs/profile2.jpg
      - text: They treated the CMS as part of the product, not an afterthought. Our
          editors noticed on day one.
        authorName: Jordan Hale
        authorDescription: Brand Lead, Globex Travel
        authorImage: ''
      - text: Six months after launch we asked for one new section. It arrived in a week
          and looked like it had always been there.
        authorName: Mei Tanaka
        authorDescription: Operations Lead, Acme
        authorImage: ''
    columns: 3
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
  - _component: page-sections/explainers/faq-section
    sectionLabel: ''
    heading: Before you get in touch
    headingLevel: h2
    items:
      - title: How long does a typical project take?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Most new sites take ten to sixteen weeks from the first strategy session
              to launch. A migration onto an existing design system can be done
              in six.
            alignmentHorizontal: start
            size: md
      - title: What does a project cost?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Builds start at around $3,000 and we quote a fixed price after strategy,
              so the number doesn't move. Ongoing care is on a [monthly
              plan](/examples/pricing/).
            alignmentHorizontal: start
            size: md
      - title: Who owns the site when you're done?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: You do. The code, content, and hosting account are in your name from the
              start, and you can take them to another team at any time.
            alignmentHorizontal: start
            size: md
      - title: Can you work with our in-house developers?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Yes. We often build the design system and hand it to an internal team to
              extend. We'll pair with them during the build so nothing is a
              mystery at handoff.
            alignmentHorizontal: start
            size: md
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
  - _component: page-sections/conversion/cta-form
    sectionLabel: ''
    heading: Tell us about the site
    headingLevel: h2
    subtext: A few lines on what you need and when. We'll reply within a working day
      with whether we're a fit and what a first phase would look like.
    formAction: ./
    formBlocks:
      - _component: building-blocks/forms/input
        label: Name
        name: name
        type: text
        required: true
        iconColor: default
        iconPosition: before
        autocomplete: name
      - _component: building-blocks/forms/input
        label: Email
        name: email
        type: email
        required: true
        iconColor: default
        iconPosition: before
        autocomplete: email
      - _component: building-blocks/forms/select
        label: What do you need?
        name: service
        required: true
        options:
          - value: strategy
            label: Strategy
          - value: design-system
            label: A design system
          - value: build
            label: A new site or migration
          - value: care
            label: A care plan
          - value: not-sure
            label: Not sure yet
        placeholder: Choose a service
        iconColor: default
      - _component: building-blocks/forms/textarea
        label: Message
        name: message
        required: true
        rows: 4
        hint: The site, the timeline, and who will run it.
      - _component: building-blocks/forms/submit
        text: Send enquiry
        variant: primary
        size: md
        iconColor: default
        iconPosition: before
        hideText: false
    imageSource: /src/assets/images/component-docs/quiet-street.jpg
    imageAlt: A quiet hillside street lined with flowering shrubs
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
