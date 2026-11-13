---
_schema: default
title: Contact
description: 'Example contact page for a web studio: ways to get in touch, an
  enquiry form, what happens next, common questions, and a newsletter signup.'
keywords: []
pageSections:
  - _component: page-sections/heroes/hero-center
    sectionLabel: ''
    eyebrow: Contact
    heading: Let's talk about your site
    headingLevel: h1
    subtext: Tell us what you're building. A real person reads every message and
      replies within a working day.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Send an enquiry
        hideText: false
        link: '#enquiry'
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: hello@example.com
        hideText: false
        link: mailto:hello@example.com
        iconName: mail
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
    eyebrow: ''
    heading: Find the right way in
    headingLevel: h2
    subtext: ''
    alignmentHorizontal: center
    features:
      - title: Starting a project
        description: Use the enquiry form below. It takes about two minutes, and a lead
          from the studio reads it.
        iconName: rocket
        iconColor: blue
        iconBackground: true
      - title: Already a client
        description: Email support@example.com. Care plan clients hear back within their
          plan's response time.
        iconName: life-buoy
        iconColor: orange
        iconBackground: true
      - title: Press and speaking
        description: We talk about sites teams can run themselves at meetups and
          conferences. Email hello@example.com.
        iconName: megaphone
        iconColor: purple
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
  - _component: page-sections/conversion/contact-split
    sectionLabel: Enquiry
    eyebrow: Start a project
    heading: Tell us about the work
    headingLevel: h2
    subtext: A few lines on the site, the timeline, and who will run it after launch.
    details:
      - icon: map-pin
        label: Studio
        value: 1A Example Street, Dunedin 9016, New Zealand
        url: ''
      - icon: mail
        label: Email
        value: hello@example.com
        url: mailto:hello@example.com
      - icon: phone
        label: Phone
        value: +64 3 555 0142
        url: tel:+6435550142
      - icon: clock
        label: Hours
        value: Mon–Fri, 9am–5pm NZT
        url: ''
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
      - _component: building-blocks/forms/choice-group
        title: Rough budget
        name: budget
        required: false
        options:
          - value: under-20k
            label: Under $20k
            checked: false
          - value: 20k-50k
            label: $20k to $50k
            checked: false
          - value: over-50k
            label: Over $50k
            checked: false
          - value: not-sure
            label: Not sure yet
            checked: false
        orientation: horizontal
        multiple: false
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
    mapEmbedUrl: ''
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
  - _component: page-sections/explainers/steps-section
    sectionLabel: ''
    eyebrow: After you send it
    heading: What happens next
    headingLevel: h2
    subtext: ''
    items:
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: We reply
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Within a working day, from a person, with a time for a call if it looks
              like a fit.
            alignmentHorizontal: start
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: A thirty-minute call
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: We ask about the site, the team, and the deadline. You ask us anything.
            alignmentHorizontal: start
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: A written proposal
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: Scope, timeline, and a fixed price for the first phase, usually within a
              week of the call.
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
  - _component: page-sections/explainers/faq-section
    sectionLabel: ''
    heading: Questions before you write
    headingLevel: h2
    items:
      - title: Do you work with teams outside New Zealand?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Yes. Most of our clients are in New Zealand and Australia, and we work
              across time zones with one standing call a week.
            alignmentHorizontal: start
            size: md
      - title: Is there a minimum project size?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Builds usually start around $18,000. For smaller pieces of work, a [care
              plan](/examples/pricing/) is often the better fit.
            alignmentHorizontal: start
            size: md
      - title: Can we just book a call?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Of course. Send the form with a line saying so, and we'll reply with a few
              times that suit.
            alignmentHorizontal: start
            size: md
      - title: Will you sign an NDA?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Yes, before the first call if you need one.
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
  - _component: page-sections/conversion/newsletter-signup
    sectionLabel: ''
    eyebrow: Not ready yet?
    heading: Get a short note when we publish something useful
    headingLevel: h2
    subtext: Studio news and practical site advice, about once a month.
    formAction: ''
    formMethod: post
    formName: newsletter
    emailName: email
    emailLabel: Email address
    emailPlaceholder: you@example.com
    buttonText: Subscribe
    disclaimer: By subscribing, you agree to our [privacy policy](/privacy/).
    layout: card
    panelBackgroundColor: base
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 3xl
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
---
