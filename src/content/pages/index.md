---
_schema: default
title: Your Site
pageBlocks:
  - _bookshop_name: wrappers/container
    label: ""
    contentBlocks:
      - _bookshop_name: wrappers/split
        firstColumnContentBlocks:
          - _bookshop_name: typography/heading
            text: A left right
            type: h2
            size:
            align: start
            iconName:
            iconPosition: before
          - _bookshop_name: typography/simple-text
            text: >-
              A piece of text to display in the left right. A piece of text to
              display in the left right. A piece of text to display in the left
              right.
            align: start
            size: md
        secondColumnContentBlocks:
          - _bookshop_name: elements/smart-image
            source: /assets/images/component-library/sheep.jpg
            alt: A couple o sheep
            rounded: true
            aspectRatio: widescreen
            positionVertical: bottom
            positionHorizontal: center
        distributionMode: third-two-thirds
        fixedWidth:
        verticalAlignment: center
        reverse: false
      - _bookshop_name: wrappers/grid
        minItemWidth: 350
        maxItemWidth: 460
        verticalAlignment:
        horizontalAlignment: center
        equalWidth: true
        items:
          - contentBlocks:
              - _bookshop_name: wrappers/card
                label: ""
                contentBlocks:
                  - _bookshop_name: typography/simple-text
                    text: Some text in this here card.
                    align: start
                    size: md
                headerContentBlocks:
                  - _bookshop_name: typography/heading
                    text: A card in a grid
                    type: h2
                    size:
                    align: start
                    iconName:
                    iconPosition: before
                footerContentBlocks: []
                paddingHorizontal: md
                paddingVertical: sm
                colorScheme: default
                backgroundColor: accent
                backgroundImage:
                  source: ""
                  alt: ""
                  positionVertical: top
                  positionHorizontal: center
                link: ""
                rounded: true
                border: false
          - contentBlocks:
              - _bookshop_name: wrappers/card
                label: ""
                contentBlocks:
                  - _bookshop_name: typography/simple-text
                    text: Some text in this here card.
                    align: start
                    size: md
                headerContentBlocks:
                  - _bookshop_name: typography/heading
                    text: A card in a grid
                    type: h2
                    size:
                    align: start
                    iconName:
                    iconPosition: before
                footerContentBlocks: []
                paddingHorizontal: md
                paddingVertical: sm
                colorScheme: default
                backgroundColor: accent
                backgroundImage:
                  source: ""
                  alt: ""
                  positionVertical: top
                  positionHorizontal: center
                link: ""
                rounded: true
                border: false
          - contentBlocks:
              - _bookshop_name: wrappers/card
                label: ""
                contentBlocks:
                  - _bookshop_name: typography/simple-text
                    text: Some text in this here card.
                    align: start
                    size: md
                headerContentBlocks:
                  - _bookshop_name: typography/heading
                    text: A card in a grid
                    type: h2
                    size:
                    align: start
                    iconName:
                    iconPosition: before
                footerContentBlocks: []
                paddingHorizontal: md
                paddingVertical: sm
                colorScheme: default
                backgroundColor: accent
                backgroundImage:
                  source: ""
                  alt: ""
                  positionVertical: top
                  positionHorizontal: center
                link: ""
                rounded: true
                border: false
          - contentBlocks:
              - _bookshop_name: wrappers/card
                label: ""
                contentBlocks:
                  - _bookshop_name: typography/simple-text
                    text: Some text in this here card.
                    align: start
                    size: md
                headerContentBlocks:
                  - _bookshop_name: typography/heading
                    text: A card in a grid
                    type: h2
                    size:
                    align: start
                    iconName:
                    iconPosition: before
                footerContentBlocks: []
                paddingHorizontal: md
                paddingVertical: sm
                colorScheme: default
                backgroundColor: accent
                backgroundImage:
                  source: ""
                  alt: ""
                  positionVertical: top
                  positionHorizontal: center
                link: ""
                rounded: true
                border: false
          - contentBlocks:
              - _bookshop_name: wrappers/card
                label: ""
                contentBlocks:
                  - _bookshop_name: typography/simple-text
                    text: Some text in this here card.
                    align: start
                    size: md
                headerContentBlocks:
                  - _bookshop_name: typography/heading
                    text: A card in a grid
                    type: h2
                    size:
                    align: start
                    iconName:
                    iconPosition: before
                footerContentBlocks: []
                paddingHorizontal: md
                paddingVertical: sm
                colorScheme: default
                backgroundColor: accent
                backgroundImage:
                  source: ""
                  alt: ""
                  positionVertical: top
                  positionHorizontal: center
                link: ""
                rounded: true
                border: false
      - _bookshop_name: wrappers/content-selector
        items:
          - title: A content panel
            contentBlocks:
              - _bookshop_name: typography/definition-list
                items:
                  - _component: definition-list-item
                    title: HOI
                    text: HOI HOI HOI
                  - _component: definition-list-item
                    title: Another?
                    text: Have it
                  - _component: definition-list-item
                    title: Another?
                    text: Have it
                  - _component: definition-list-item
                    title: Another?
                    text: Have it
                horizontalAlignment: center
          - title: Another panel
            contentBlocks:
              - _bookshop_name: elements/smart-image
                source: /images/castle.jpg
                alt: Larnach castle in Dunedin
                rounded: true
                aspectRatio: golden
                positionVertical: center
                positionHorizontal: center
        navigationPosition: start
      - _bookshop_name: wrappers/carousel
        label: ""
        slides:
          - contentBlocks: []
        autoPlay: false
        autoScroll: false
        slideWidthPercent: 100
        minSlideWidth: 0
      - _bookshop_name: wrappers/button-group
        buttonBlocks:
          - _bookshop_name: elements/button
            text: View Components
            link: /component-library/
            iconPosition: before
            hideText: false
            variant: primary
            size: lg
          - _bookshop_name: elements/button
            text: GitHub
            link: https://github.com/
            iconName: social/github
            iconPosition: after
            hideText: false
            variant: tertiary
            size: lg
        direction: row
        align: center
      - _bookshop_name: typography/heading
        text: Welcome to your CloudCannon Starter Component site
        type: h1
        size:
        align: center
        iconName:
        iconPosition:
      - _bookshop_name: typography/counter
        number: 100
        prefix:
        suffix:
        horizontalAlignment: start
      - _bookshop_name: elements/smart-video
        video:
          _type: youtube
          source: /assets/videos/glass.mp4
          poster: /assets/images/video-placeholder.jpg
      - _bookshop_name: wrappers/card
        label: ""
        contentBlocks:
          - _bookshop_name: typography/counter
            number: 100
            prefix: $
            suffix: USD
            horizontalAlignment: start
          - _bookshop_name: typography/simple-text
            text: akljshdkajshdkjahsdkjahsd
            align: start
            size: md
        headerContentBlocks:
          - _bookshop_name: typography/heading
            text: This is interesting
            type: h3
            size: xl
            align: start
            iconName: arrow-down
            iconPosition: before
        footerContentBlocks: []
        paddingHorizontal: xl
        paddingVertical: xl
        colorScheme: contrast
        backgroundColor: highlight
        backgroundImage:
          source: ""
          alt: ""
          positionVertical: top
          positionHorizontal: center
        link: ""
        rounded: true
        border: false
      - _bookshop_name: typography/definition-list
        items:
          - _component: definition-list-item
            title: >-
              12345678901234567890123456 123456789012
              345678901234567890123456789078901234567890123456789012
              345678901234567890
            text: werwerwerwerwerwerwerwer
        horizontalAlignment: start
      - _bookshop_name: wrappers/accordion
        items:
          - title: Testing media
            contentBlocks:
              - _bookshop_name: elements/smart-image
                source: /assets/images/component-library/dunedin-cliff.jpg
                alt: Dunedin coastline
                rounded: true
                aspectRatio: landscape
                positionVertical: center
                positionHorizontal: center
              - _bookshop_name: elements/smart-video
                video:
                  _type: youtube
                  id: GOejI6c0CMQ
                  title: CC tutorial
              - _bookshop_name: elements/smart-video
                video:
                  _type: self-hosted
                  source: /assets/videos/glass.mp4
                  poster: /assets/images/video-placeholder.jpg
              - _bookshop_name: elements/smart-video
                video:
                  _type: vimeo
                  id: "1054665455"
                  title: A vimeo test vid
        openFirst: false
        singleOpen: false
      - _bookshop_name: forms/form
        action:
        formBlocks:
          - _bookshop_name: forms/choice-group
            title: Subscription
            name: subscription
            required: false
            options:
              - value: newsletter
                label: Subscribe to newsletter
                checked: false
              - value: updates
                label: Get product updates
                checked: false
            orientation: vertical
            multiple: true
          - _bookshop_name: forms/file-upload
            label: Upload a file
            name: file_upload
            required: false
            accept:
            multiple: true
          - _bookshop_name: forms/input
            label: Email Address
            name: email
            required: true
            type: email
            placeholder: youremail@email.com
            value:
          - _bookshop_name: forms/input
            label: Password
            name: password
            required: true
            type: password
            placeholder:
            value:
          - _bookshop_name: forms/input
            label: Your message
            name: message
            required: true
            type: text
            placeholder: Hello, I'd like one form and...
            value:
          - _bookshop_name: forms/input
            label: Telephone number
            name: telephone
            required: false
            type: tel
            placeholder: "+641234567"
            value:
          - _bookshop_name: forms/input
            label: Url
            name: url
            required: false
            type: url
            placeholder:
            value:
          - _bookshop_name: forms/input
            label: Age
            name: age
            required: false
            type: number
            placeholder:
            value:
          - _bookshop_name: forms/input
            label: Birth Date
            name: birthdate
            required: false
            type: date
            placeholder: 18/03/2025
            value:
          - _bookshop_name: forms/segments
            title: Which option would you like?
            name: options
            required: true
            options:
              - value: optionOne
                label: First Option
                checked: true
                icon: archive-box-arrow-down
              - value: optionTwo
                label: Second Option
                checked:
                icon: arrow-down
              - value: optionThree
                label: Last Option
                checked:
                icon: arrow-up-left
            iconOnly: false
            multiple: false
            keepStateOnRefresh: true
          - _bookshop_name: forms/select
            label: Which do you prefer?
            name: preferred_dinosaur
            required: true
            options:
              - value: option1
                label: Option 1
              - value: option2
                label: Option 2
              - value: option3
                label: Option 3
            placeholder:
            value:
          - _bookshop_name: forms/textarea
            label: The big message
            name: aBigMessage
            required: false
            placeholder: Hello, I'm writing here because...
            value:
    maxContentWidth: 2xl
    paddingHorizontal: lg
    paddingVertical: lg
    colorScheme: default
    backgroundColor: highlight
    backgroundImage:
      source: ""
      alt: ""
      positionVertical: top
      positionHorizontal: center
    rounded: false
---
