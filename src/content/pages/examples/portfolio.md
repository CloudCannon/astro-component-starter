---
_schema: default
title: Portfolio
description: Example portfolio page with a gallery, featured projects, and a contact split.
pageSections:
  - _component: page-sections/collections/gallery-grid
    headingLevel: h1
    eyebrow: Selected work
    heading: Recent projects
    subtext: A handful of sites from the last two years.
    images:
      - image: /src/assets/images/component-docs/dunedin-cliff.jpg
        alt: Sea cliffs above a turquoise bay, gorse flowering in the foreground
        caption: 'Coastal trust: membership site'
      - image: /src/assets/images/component-docs/sheep.jpg
        alt: Two sheep grazing on a headland high above the ocean
        caption: 'North pasture: producer directory'
      - image: /src/assets/images/component-docs/castle.jpg
        alt: Ruined stone castle under a starry night sky
        caption: 'Heritage nights: events calendar'
      - image: /src/assets/images/component-docs/sunset.jpg
        alt: Coastal cliffs at dusk with the sun low over the sea
        caption: 'Harbor line: campaign landing pages'
      - image: /src/assets/images/component-docs/quiet-street.jpg
        alt: Quiet hillside street with flowering rhododendrons
        caption: 'Hillside rooms: hospitality brochure'
    layout: masonry
    columns: 3
    gap: md
    aspectRatio: square
    lightbox: true
    showThumbnails: false
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/feature-slider
    slides:
      - eyebrow: Coastal trust
        title: A membership site the staff can update
        description: >-
          Events, news, and a members area, assembled from the same sections as
          the public pages, so a new campaign doesn't mean a new template.
        imageSource: /src/assets/images/component-docs/dunedin-cliff.jpg
        imageAlt: Sea cliffs above a bay
      - eyebrow: Harbor line
        title: Landing pages without a design ticket
        description: >-
          Marketing ships a page a week during campaign season. The guardrails
          hold; the brand still looks like itself.
        imageSource: /src/assets/images/component-docs/sunset.jpg
        imageAlt: Coastal cliffs at dusk
      - eyebrow: Heritage nights
        title: An events calendar that survived launch week
        description: >-
          Dates, venues, and tickets in the CMS. The night-of page is a section
          they duplicate, not a one-off.
        imageSource: /src/assets/images/component-docs/castle.jpg
        imageAlt: Castle under a night sky
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/proof/testimonial-section
    text: >-
      They treated the CMS as part of the product, not an afterthought. Our
      editors noticed on day one.
    authorName: Jordan Hale
    authorDescription: Digital Lead, Harbor & Co
    authorImage: /src/assets/images/component-docs/profile5.jpg
    maxContentWidth: xl
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/conversion/contact-split
    eyebrow: Start a project
    heading: Tell us about the work
    subtext: A few lines on the site, the timeline, and who will edit it.
    details:
      - icon: map-pin
        label: Studio
        value: 12 Vogel Street, Dunedin 9016, New Zealand
        url: ''
      - icon: envelope
        label: Email
        value: hello@example.com
        url: mailto:hello@example.com
      - icon: phone
        label: Phone
        value: +64 3 555 0142
        url: tel:+6435550142
      - icon: clock
        label: Hours
        value: Mon–Fri, 9am–5pm NZST
        url: ''
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
        label: Project
        name: message
        required: true
      - _component: building-blocks/forms/submit
        text: Send message
        variant: primary
        size: md
        iconPosition: before
        hideText: false
        disabled: false
    mapEmbedUrl: ''
    colorScheme: inherit
    backgroundColor: surface
---
