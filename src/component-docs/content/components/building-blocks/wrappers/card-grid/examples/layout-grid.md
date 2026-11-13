---
title: Grid Layout
spacing: all
blocks:
  _component: 'building-blocks/wrappers/card-grid'
  layout: grid
  columns: 3
  gap: lg
  aspectRatio: landscape
  items:
    - image: /src/assets/images/component-docs/dunedin-cliff.jpg
      imageAlt: Sea cliffs above a turquoise bay
      link: '#'
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Discovery and planning
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: Two weeks of research, a content audit, and a sitemap you can actually build against.
          size: sm
    - image: /src/assets/images/component-docs/castle.jpg
      imageAlt: Ruined stone castle under a starry night sky
      link: '#'
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Design systems
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: A component library and token set your team can extend without a redesign.
          size: sm
    - image: /src/assets/images/component-docs/sunset.jpg
      imageAlt: Coastal cliffs at dusk with the sun low over the sea
      link: '#'
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Site build
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: Content moved across, page by page, with redirects in place.
          size: sm
    - image: /src/assets/images/component-docs/sheep.jpg
      imageAlt: Two sheep grazing on a headland high above the ocean
      link: '#'
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Training
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: A short workshop so the team can keep shipping without a developer.
          size: sm
    - image: /src/assets/images/component-docs/quiet-street.jpg
      imageAlt: Quiet hillside street with flowering rhododendrons
      link: '#'
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Care
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: Hosting, updates, and a monthly pass over the content.
          size: sm
    - image: /src/assets/images/component-docs/dunedin-cliff.jpg
      imageAlt: Sea cliffs above a turquoise bay
      link: '#'
      contentSections:
        - _component: building-blocks/core-elements/heading
          text: Measurement
          level: h3
          size: xs
        - _component: building-blocks/core-elements/simple-text
          text: Analytics and search-console setup, plus a 30-day check-in after launch.
          size: sm
---

Grid crops every cover to the chosen aspect ratio so the rows line up. Masonry keeps each cover's natural shape instead.
