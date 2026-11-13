---
_schema: default
title: Pricing
description: "Example pricing page for a web studio's care plans: plan cards
  with a monthly/annual switch, a comparison table, client quotes, and billing
  FAQ."
keywords: []
pageSections:
  - _component: page-sections/conversion/pricing-tiers
    sectionLabel: ''
    eyebrow: Example Pricing
    heading: Keep your site sharp after launch
    headingLevel: h1
    subtext: A set number of studio hours each month, plus updates, fixes, and
      people who already know your site. New builds are quoted separately.
    showAnnualPricing: true
    monthlyLabel: Monthly
    annualLabel: Annual
    annualBadge: Two months free
    defaultInterval: monthly
    tiers:
      - name: Essentials
        price: $290
        priceSuffix: /month
        annualPrice: $2,900
        annualPriceSuffix: /year
        description: For a site that mostly needs to stay current.
        features:
          - text: Security and dependency updates
            included: true
          - text: A monthly health check
            included: true
          - text: 2 hours of design and development
            included: true
          - text: Fixes within two working days
            included: true
          - text: New sections each quarter
            included: false
          - text: Performance reviews
            included: false
        buttonText: Choose Essentials
        buttonLink: /examples/contact/
        highlight: false
        badgeText: ''
      - name: Growth
        price: $790
        priceSuffix: /month
        annualPrice: $7,900
        annualPriceSuffix: /year
        description: For teams that publish every week.
        features:
          - text: Everything in Essentials
            included: true
          - text: 8 hours of design and development
            included: true
          - text: A new section each quarter
            included: true
          - text: Quarterly performance reviews
            included: true
          - text: Fixes by the next working day
            included: true
          - text: A named lead at the studio
            included: false
        buttonText: Choose Growth
        buttonLink: /examples/contact/
        highlight: true
        badgeText: Most popular
      - name: Partner
        price: $1,900
        priceSuffix: /month
        annualPrice: $19,000
        annualPriceSuffix: /year
        description: For organizations running several sites.
        features:
          - text: Everything in Growth
            included: true
          - text: Covers up to 5 sites
            included: true
          - text: 24 hours of design and development
            included: true
          - text: New sections on request
            included: true
          - text: Urgent fixes within four hours
            included: true
          - text: A named lead at the studio
            included: true
        buttonText: Talk to us
        buttonLink: /examples/contact/
        highlight: false
        badgeText: ''
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
  - _component: page-sections/conversion/pricing-comparison
    sectionLabel: ''
    eyebrow: Compare
    heading: Plan by plan
    headingLevel: h2
    subtext: ''
    plans:
      - name: Essentials
        price: $290/mo
        highlight: false
        buttonText: Choose Essentials
        buttonLink: /examples/contact/
      - name: Growth
        price: $790/mo
        highlight: true
        buttonText: Choose Growth
        buttonLink: /examples/contact/
      - name: Partner
        price: $1,900/mo
        highlight: false
        buttonText: Talk to us
        buttonLink: /examples/contact/
    rows:
      - feature: Sites covered
        values:
          - '1'
          - '1'
          - Up to 5
      - feature: Design and development hours a month
        values:
          - '2'
          - '8'
          - '24'
      - feature: Security and dependency updates
        values:
          - yes
          - yes
          - yes
      - feature: Monthly health check
        values:
          - yes
          - yes
          - yes
      - feature: New sections
        values:
          - no
          - One a quarter
          - On request
      - feature: Performance reviews
        values:
          - no
          - Quarterly
          - Monthly
      - feature: Fix response time
        values:
          - Two working days
          - Next working day
          - Four hours
      - feature: Named studio lead
        values:
          - no
          - no
          - yes
    striped: true
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
  - _component: page-sections/proof/testimonial-bento
    sectionLabel: ''
    eyebrow: Clients
    heading: Why they stayed on a plan
    headingLevel: h2
    subtext: ''
    testimonials:
      - text: Growth pays for itself in the hours we don't spend chasing developers. The
          new section each quarter means the site keeps up with whatever
          marketing wants to try next.
        authorName: Priya Raman
        authorDescription: Head of Marketing, Northwind Coastal Trust
        authorImage: /src/assets/images/component-docs/profile1.jpg
        size: featured
        tone: surface
      - text: Essentials covered our first year. Upgrading took one email.
        authorName: Tom Alvarez
        authorDescription: Founder, Vertex Growers
        authorImage: /src/assets/images/component-docs/profile.jpg
        size: standard
        tone: base
      - text: Annual billing paid for our festival microsite.
        authorName: Dana Whitfield
        authorDescription: Program Director, Solstice Festival
        authorImage: ''
        size: standard
        tone: inverse
      - text: The four-hour fix window on Partner is what got our procurement team to
          sign. Everything else was already there.
        authorName: Jordan Hale
        authorDescription: Brand Lead, Globex Travel
        authorImage: ''
        size: wide
        tone: base
      - text: No surprise invoices, ever.
        authorName: Sam Okafor
        authorDescription: Marketing Manager, Umbra Stays
        authorImage: /src/assets/images/component-docs/profile2.jpg
        size: standard
        tone: accent
    columns: '3'
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
    heading: Billing questions
    headingLevel: h2
    items:
      - title: Can we change plans later?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Yes. Move up or down at the end of any billing period, and unused time on
              the old plan is credited to the new one.
            alignmentHorizontal: start
            size: md
      - title: What can we use our hours for?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: 'Any design or development work: a new layout, an integration, a
              performance fix, or a change that runs across the whole site.'
            alignmentHorizontal: start
            size: md
      - title: Do unused hours roll over?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: For one month. Save them up for a bigger change, or let them go in a quiet
              month.
            alignmentHorizontal: start
            size: md
      - title: Do you offer annual billing?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Yes, use the monthly and annual switch on the plans above. Paying annually
              gets you two months free.
            alignmentHorizontal: start
            size: md
      - title: Is there a contract?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: Essentials and Growth are month to month. Partner can be monthly or a
              twelve-month term if you want the response times in writing.
            alignmentHorizontal: start
            size: md
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
    heading: Not sure which plan fits?
    headingLevel: h2
    subtext: Tell us what your site needs from month to month. We'll point you at
      the right plan.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Talk to us
        hideText: false
        link: /examples/contact/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
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
