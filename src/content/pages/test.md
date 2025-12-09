---
_schema: default
title: test custom sections
pageSections:
  - _component: page-sections/builders/custom-section
    label: ''
    contentSections:
      - _component: building-blocks/wrappers/accordion
        label: asd
        items:
          - _component: building-blocks/wrappers/accordion/accordion-item
            title: asd
            contentSections:
              - _component: building-blocks/core-elements/text
                text: My text goes here.
                alignX: start
          - _component: building-blocks/wrappers/accordion/accordion-item
            title: asd
            contentSections:
              - _component: building-blocks/core-elements/text
                text: My text goes here.
                alignX: start
          - _component: building-blocks/wrappers/accordion/accordion-item
            title: asd
            contentSections:
              - _component: building-blocks/core-elements/text
                text: My text goes here.
                alignX: start
        openFirst: true
        singleOpen: false
      - _component: building-blocks/wrappers/button-group
        label:
        buttonSections:
          - _component: building-blocks/core-elements/button
            text: My Button
            link: ''
            iconName: ''
            iconPosition: before
            hideText: false
            variant: secondary
            size: lg
          - _component: building-blocks/core-elements/button
            text: My Button
            link: ''
            iconName: ''
            iconPosition: before
            hideText: false
            variant: primary
            size: md
        direction: column
        alignX: center
      - _component: building-blocks/core-elements/counter
        number: 99
        prefix: '%'
        suffix: t
        alignX: center
        size: 4xl
      - _component: building-blocks/core-elements/heading
        text: My Heading
        level: h2
        size: default
        alignX: start
        iconName:
        iconPosition: before
      - _component: building-blocks/wrappers/card
        label:
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: 'My Headingqwe '
            level: h2
            size: default
            alignX: start
            iconName:
            iconPosition: before
          - _component: building-blocks/core-elements/counter
            number: 5
            prefix: 'Every week I get '
            suffix: ' dollars pocket money'
            alignX: center
            size: 2xl
        maxContentWidth:
        paddingHorizontal: sm
        paddingVertical: sm
        colorScheme:
        backgroundColor: base
        backgroundImage:
          source:
          alt:
          positionVertical: top
          positionHorizontal: center
        link:
        rounded: false
        border: false
        showBeforeAfter: false
        beforeContentSections: []
        afterContentSections: []
      - _component: building-blocks/core-elements/definition-list
        items:
          - _component: building-blocks/core-elements/definition-list/definition-list-item
            title: What's this?
            text: Who knows.
          - _component: building-blocks/core-elements/definition-list/definition-list-item
            title: What's this?
            text: Who knows.
          - _component: building-blocks/core-elements/definition-list/definition-list-item
            title: What's this?
            text: Who knows.
          - _component: building-blocks/core-elements/definition-list/definition-list-item
            title: What's this?
            text: Who knows.
        alignX: start
      - _component: building-blocks/core-elements/divider
        paddingVertical: lg
      - _component: building-blocks/core-elements/embed
        source: https://cloudcannon.com
        title: ''
        aspectRatio: landscape
    maxContentWidth: 2xl
    paddingHorizontal: md
    paddingVertical: md
    colorScheme:
    backgroundColor: base
    backgroundImage:
      source: ''
      alt: ''
      positionVertical: top
      positionHorizontal: center
    rounded: false
---
