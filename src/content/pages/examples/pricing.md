---
_schema: default
title: Pricing
description: Example pricing page with plan cards, a comparison table, and billing FAQ.
pageSections:
  - _component: page-sections/conversion/pricing-tiers
    headingLevel: h1
    eyebrow: Plans
    heading: Simple pricing that scales with you
    subtext: Every plan includes hosting, SSL, and visual editing for your team.
    showAnnualPricing: true
    monthlyLabel: Monthly
    annualLabel: Annual
    annualBadge: Save 20%
    defaultInterval: monthly
    tiers:
      - name: Starter
        price: $19
        priceSuffix: /month
        annualPrice: $190
        annualPriceSuffix: /year
        description: For a single marketing site.
        features:
          - text: 1 site
            included: true
          - text: 1 seat
            included: true
          - text: CDN + SSL
            included: true
          - text: Form endpoints
            included: false
          - text: Staging environment
            included: false
        buttonText: Get started
        buttonLink: /examples/services/
        highlight: false
        badgeText: ''
      - name: Studio
        price: $59
        priceSuffix: /month
        annualPrice: $590
        annualPriceSuffix: /year
        description: For small teams shipping several sites.
        features:
          - text: 10 sites
            included: true
          - text: 5 seats
            included: true
          - text: Form endpoints
            included: true
          - text: Staging environment
            included: true
          - text: SSO
            included: false
        buttonText: Get started
        buttonLink: /examples/services/
        highlight: true
        badgeText: Most popular
      - name: Agency
        price: $149
        priceSuffix: /month
        annualPrice: $1,490
        annualPriceSuffix: /year
        description: For agencies running client fleets.
        features:
          - text: Unlimited sites
            included: true
          - text: SSO + audit log
            included: true
          - text: Named support contact
            included: true
          - text: 99.95% uptime SLA
            included: true
        buttonText: Talk to us
        buttonLink: /examples/services/
        highlight: false
        badgeText: ''
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/conversion/pricing-comparison
    eyebrow: Compare
    heading: Feature by feature
    subtext: ''
    plans:
      - name: Starter
        price: $19/mo
        highlight: false
        buttonText: Choose Starter
        buttonLink: /examples/services/
      - name: Studio
        price: $59/mo
        highlight: true
        buttonText: Choose Studio
        buttonLink: /examples/services/
      - name: Agency
        price: $149/mo
        highlight: false
        buttonText: Talk to us
        buttonLink: /examples/services/
    rows:
      - feature: Sites
        values:
          - '1'
          - '10'
          - Unlimited
      - feature: Seats
        values:
          - '1'
          - '5'
          - Unlimited
      - feature: Visual editing
        values:
          - 'yes'
          - 'yes'
          - 'yes'
      - feature: Form endpoints
        values:
          - 'no'
          - 'yes'
          - 'yes'
      - feature: Staging
        values:
          - 'no'
          - 'yes'
          - 'yes'
      - feature: SSO and audit log
        values:
          - 'no'
          - 'no'
          - 'yes'
      - feature: Support
        values:
          - Email
          - Priority email
          - Named contact
    striped: true
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/proof/testimonial-bento
    eyebrow: Customers
    heading: Teams that switched, in their words
    headingLevel: h2
    subtext: ''
    testimonials:
      - text: We moved twelve client sites onto Studio in a quarter. The per-seat pricing meant we could bring every editor along without a budget conversation.
        authorName: Priya Raman
        authorDescription: Head of Marketing, Northwind
        authorImage: /src/assets/images/component-docs/profile1.jpg
        size: featured
        tone: surface
      - text: Starter covered our launch. Upgrading later took one click.
        authorName: Dana Whitfield
        authorDescription: Engineering Lead, Cascade
        authorImage: /src/assets/images/component-docs/profile3.jpg
        size: standard
        tone: base
      - text: Annual billing paid for our staging environment.
        authorName: Tom Alvarez
        authorDescription: Founder, Fieldnote
        authorImage: /src/assets/images/component-docs/profile2.jpg
        size: standard
        tone: inverse
      - text: The SLA on Agency is the reason our procurement team said yes. Everything else was already there.
        authorName: Sam Okafor
        authorDescription: Design Director, Loam Studio
        authorImage: /src/assets/images/component-docs/profile4.jpg
        size: wide
        tone: base
      - text: No surprise invoices, ever.
        authorName: Richard Johnson
        authorDescription: CEO, Tech Innovations
        authorImage: /src/assets/images/component-docs/profile.jpg
        size: standard
        tone: accent
    columns: '3'
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/faq-section
    heading: Billing questions
    items:
      - title: Can we change plans later?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Yes. Upgrade or downgrade at the end of the billing period. Unused
              time on the old plan is credited.
            size: md
      - title: What happens if we go over the site limit?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              We'll prompt you to move up a plan before a new site can go live.
              Existing sites keep serving.
            size: md
      - title: Do you offer annual billing?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Yes, use the monthly/annual switch on the plans above. Annual
              billing is two months free.
            size: md
      - title: Is there a contract?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Month to month on Starter and Studio. Agency can be monthly or a
              twelve-month term if you want the SLA in writing.
            size: md
    maxContentWidth: xl
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/conversion/cta-center
    heading: Not sure which plan?
    subtext: Tell us how many sites and editors you have. We'll point you at the right one.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: Talk to us
        hideText: false
        link: /examples/services/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
    colorScheme: dark
    backgroundColor: surface
---
