---
_schema: default
title: Performance
pageBlocks:
  - _component: blocks/main-hero
    eyebrow: Performance
    heading: Load instantly. Rank higher.
    subtitle: >-
      Fast sites win: deliver structured content that makes your visitors (and
      Google) smile. CloudCannon's optional hosting gives you speed that
      scales.
    buttonBlocks:
      - _component: elements/button
        text: Demo CloudCannon
        link: ""
        iconName: ""
        iconPosition: before
        hideText: false
        variant: primary
        size: md
      - _component: elements/button
        text: Start with a trial
        link: ""
        iconName: arrow-right
        iconPosition: after
        hideText: false
        variant: tertiary
        size: md
  - _component: blocks/page-container
    label: Below Hero
    contentBlocks:
      - _component: elements/smart-image
        source: /src/assets/images/performance-dashboard.png
        alt: Performance Dashboard
        rounded: false
        aspectRatio: none
        positionVertical: center
        positionHorizontal: center
    backgroundColor: base
    colorScheme: default
  - _component: blocks/page-container
    label: Proof
    contentBlocks:
      - _component: typography/testimonial
        text: >-
          Within the first few weeks after CloudCannon migrated the site, we'd
          already moved from the 4th page of Google to the first page. And we
          hadn't even added fresh content yet.
        authorName: Roy Gabriel
        authorDescription: Gabriel Maggio Construction
        authorImage: /src/assets/images/roy-gabriel-gm-construction.png
        alignX: center
      - _component: elements/spacer
        size: xl
      - _component: blocks/feature-grid
        items:
          - iconName: arrow-trending-up
            iconColor: green
            title: From 50 to 90+
            subtitle: PageSpeed scores
            description: Fast load times turn visitors into customers.
          - iconName: currency-dollar
            iconColor: orange
            title: $4000 monthly savings
            subtitle: On lead gen and maintenance
            description: More leads, less spending, zero headaches.
          - iconName: chart-bar
            iconColor: blue
            title: Front page search results
            subtitle: Improved ranking on Google
            description: Want to find out more? Read the case study.
    colorScheme: default
    style: "padding-bottom: 3rem;"
  - _component: blocks/page-container
    label: Main Block
    contentBlocks:
      - _component: blocks/feature
        heading: SEO built in, not bolted on
        subtitle: >-
          Put your SEO on autopilot. Build titles, meta tags, and structured
          data right into your templates for clean HTML that ranks without the
          fuss
        image: /src/assets/images/seo-dots-final.png
        reverse: false
      - _component: elements/spacer
        size: 2xl
      - _component: blocks/feature
        heading: Build features, not fixes
        subtitle: >-
          Growth without growing pains. Add features, add traffic, add content
          — your speed stays constant. No server crashes, no database
          slowdowns!
        image: /src/assets/images/accessibility-dots-final.png
        reverse: true
      - _component: elements/spacer
        size: 2xl
      - _component: blocks/case-study
        image: /src/assets/images/abi-noda-transparent-bg.png
        imageAlt: Abi Noda
        quote: >-
          Not only do we require much less overhead to keep things running with
          CloudCannon, we're able to iterate much faster because our developers
          can a lot more productive.
        authorName: Abi Noda
        authorDescription: CEO
        authorImage: ""
        ctaText: Read case study
        ctaHref: "#"
        reverse: false
        colorScheme: default
      - _component: typography/heading
        text: Global speed. Zero setup.
        level: h2
        size: default
        alignX: center
        iconPosition: before
      - _component: typography/simple-text
        text: >-
          Whether someone’s browsing from Amsterdam or Oakland, they get the
          same fast experience with CloudCannon's hosting. Closest-location
          delivery happens automatically — no CDN wrestling, no speed
          compromises.
        alignX: center
        size: default
        style: "max-width: 700px; margin-inline: auto;"
      - _component: elements/spacer
        size: xl
      - _component: blocks/feature-grid
        items:
          - iconName: presentation-chart-line
            iconColor: yellow
            title: The rise of static-first websites
            description: Why major websites are increasingly turning to a static-first approach.
            buttonBlock:
              _component: elements/button
              text: Learn more
              link: "#"
              iconName: arrow-right
              iconPosition: after
              hideText: false
              variant: text
              size: md
          - iconName: bolt
            iconColor: blue
            title: Improving your Core Web Vitals
            description: How three major metrics help determine your ranking — and how to fix them!
            buttonBlock:
              _component: elements/button
              text: Learn more
              link: "#"
              iconName: arrow-right
              iconPosition: after
              hideText: false
              variant: text
              size: md
          - iconName: trophy
            iconColor: cyan
            title: No time to migrate? We're here to help.
            description: We'll do the work — and your whole team can enjoy an optimized experience.
            buttonBlock:
              _component: elements/button
              text: Learn more
              link: "#"
              iconName: arrow-right
              iconPosition: after
              hideText: false
              variant: text
              size: md
    backgroundColor: accent
    colorScheme: default
    style: "padding-block: 3rem;"
  - _component: blocks/page-container
    label: CTA Section
    contentBlocks:
      - _component: elements/spacer
        size: 3xl
      - _component: typography/heading
        text: For teams who want to ship, not suffer
        level: h2
        size: default
        alignX: center
        iconPosition: before
        style: "margin-bottom: 3rem; margin-top: 0;"
      - _component: blocks/persona-cta
        colorScheme: default
      - _component: elements/spacer
        size: 2xl
      - _component: blocks/cta
        heading: Leave slow sites behind
        colorScheme: default
        text: >-
          See how CloudCannon's static-first approach delivers the speed boost
          your business needs.
        image: /src/assets/images/adon-portrait.jpeg
        alt: Adon
        buttonBlocks:
          - _component: elements/button
            text: Discover the difference
            link: "#"
            iconName: arrow-right
            iconPosition: after
            hideText: false
            variant: primary
            size: md
    backgroundColor: base
    colorScheme: contrast
    paddingVertical: none
---
