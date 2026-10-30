---
_schema: default
title: Get started
description: >-
  Create a site with the Astro Component Starter, make it yours, and put it
  live, with guides for each step.
pageSections:
  - _component: page-sections/heroes/hero-center
    eyebrow: Get started
    heading: Your first hour with the starter
    headingLevel: h1
    subtext: >-
      Clone it, make it yours, and put it live. This page is a map. The README
      and component docs are the source of truth.
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: View on GitHub
        link: https://github.com/CloudCannon/astro-component-starter
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Browse components
        link: /component-docs/
        variant: secondary
        size: md
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/explainers/steps-section
    eyebrow: First hour
    heading: From clone to a site you own
    subtext: ''
    items:
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Create
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Scaffold the latest starter and install its dependencies. Needs Node 24 or later.
            size: sm
          - _component: building-blocks/core-elements/code-block
            tabs:
              - label: Terminal
                language: Shell
                code: npx create-astro-component-starter my-site-name
                filename: ''
                description: ''
            wrap: true
            copyButton: true
            lineNumbers: false
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Run and check
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Start the dev server at localhost:4321. Run npm run check before you call a change done.
            size: sm
          - _component: building-blocks/core-elements/code-block
            tabs:
              - label: Terminal
                language: Shell
                code: npm run dev
                filename: ''
                description: ''
            wrap: true
            copyButton: true
            lineNumbers: false
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Make it yours
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Set your colors in src/styles/themes/ and your fonts in site-fonts.mjs. Every component follows.
            size: sm
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Edit visually
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Try CloudCannon's visual editor on your machine, then connect your repository to CloudCannon.
            size: sm
          - _component: building-blocks/core-elements/code-block
            tabs:
              - label: Terminal
                language: Shell
                code: npm run editor
                filename: ''
                description: ''
            wrap: true
            copyButton: true
            lineNumbers: false
      - image: ''
        imageAlt: ''
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Go live
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Clear out the demo content, set your production URL, and deploy.
            size: sm
          - _component: building-blocks/core-elements/code-block
            tabs:
              - label: Terminal
                language: Shell
                code: npm run reset:starter
                filename: ''
                description: ''
            wrap: true
            copyButton: true
            lineNumbers: false
    orientation: horizontal
    imageAspectRatio: landscape
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/collections/card-collection
    eyebrow: Guides
    heading: Follow the learning path
    subtext: Six short guides, from the project tour to putting your site live.
    items:
      - image: ''
        imageAlt: ''
        link: /component-docs/project-tour/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Project tour
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              How the project is laid out, what a component is made of, and working with an AI agent.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/editing-a-page/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Editing a page
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Change and create pages in code, then make the same edits in the visual editor.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/customizing-your-brand/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Customizing your brand
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Colors, fonts, and spacing for the whole site, set once in design tokens.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/building-a-page-section/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Building a page section
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              A new component from scratch: its files, its styles, and how visual editing works.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/editing-the-blog/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Editing the blog
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Reference for posts, the listing page, and components inside a post.
            size: sm
      - image: ''
        imageAlt: ''
        link: /component-docs/going-live/
        contentSections:
          - _component: building-blocks/core-elements/heading
            text: Going live
            level: h3
            size: xs
          - _component: building-blocks/core-elements/simple-text
            text: >-
              Remove the demo content, set your URL and site details, and deploy.
            size: sm
    layout: grid
    columns: 3
    gap: lg
    aspectRatio: none
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/builders/custom-section
    label: Working with an AI agent
    contentSections:
      - _component: building-blocks/wrappers/split
        label: ''
        firstColumnContentSections:
          - _component: building-blocks/core-elements/simple-text
            text: AI agents
            size: sm
          - _component: building-blocks/core-elements/heading
            text: Hand the work to an agent
            level: h2
            size: xl
          - _component: building-blocks/core-elements/text
            text: >-
              The starter is written for coding agents as well as people.
              AGENTS.md and CLAUDE.md describe the project and its rules, and
              .agents/skills/ holds a step-by-step playbook for each common job.
          - _component: building-blocks/core-elements/list
            items:
              - text: Create a component, or turn a screenshot into one
                iconName: squares-plus
                iconColor: default
                link:
              - text: Migrate an existing site
                iconName: arrow-right-end-on-rectangle
                iconColor: default
                link:
              - text: Retheme the whole site
                iconName: paint-brush
                iconColor: default
                link:
              - text: Debug the visual editor
                iconName: wrench-screwdriver
                iconColor: default
                link:
            direction: vertical
            alignmentHorizontal: start
            size: md
            listType: icon
        secondColumnContentSections:
          - _component: building-blocks/core-elements/code-block
            tabs:
              - label: Prompt
                language: Markdown
                code: >-
                  Use the create-component skill to build a pricing FAQ section
                  from this screenshot. Run npm run check before you say it's done.
                filename: ''
                description: Name the skill, and ask for the check.
            wrap: true
            copyButton: true
            lineNumbers: false
        distributionMode: half
        fixedWidth: null
        minSplitWidth: 700
        alignmentVertical: center
        reverse: false
        reverseOrderOnMobile: false
        gap: lg
    maxContentWidth: xl
    paddingHorizontal: lg
    paddingVertical: 4xl
    colorScheme: inherit
    backgroundColor: surface
  - _component: page-sections/conversion/cta-split
    heading: Prefer to read the source?
    subtext: >-
      The repo is the starter. Every component's docs page is built from the code
      beside it, with a live example, its options, and YAML you can paste into a
      page.
    imageSource: /src/assets/images/component-docs/website-source.svg
    imageAlt: >-
      A code editor open on a component's folder, beside that component's docs
      page with a live example, an options table, and a copyable YAML snippet
    buttonSections:
      - _component: building-blocks/core-elements/button
        text: View on GitHub
        hideText: false
        link: https://github.com/CloudCannon/astro-component-starter
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: primary
        size: md
      - _component: building-blocks/core-elements/button
        text: Open the docs
        hideText: false
        link: /component-docs/
        iconName: ''
        iconColor: default
        iconPosition: before
        variant: secondary
        size: md
    reverse: false
    colorScheme: dark
    backgroundColor: surface
---
