---
_schema: default
title: Why
pageSections:
  - _component: page-sections/heroes/hero-split
    eyebrow:
    heading: Why build another Astro component library?
    subtext: >-
      At CloudCannon, we're big fans of the static web. And we love what the
      Astro team is building!


      As more <a href="https://cloudcannon.com/partner-program/" target="_blank"
      rel="noopener">partner agencies</a> are building client sites with
      CloudCannon, we wanted to provide a component library for Astro that
      outputs static HTML and CSS, for the fastest delivery possible —&nbsp;all
      unbranded and adaptable for any project.
    imageSource: /src/assets/images/component-library/sunset.jpg
    imageAlt: Sunset
    imageAspectRatio: portrait
    buttonSections: []
    reverse: true
    colorScheme: default
    backgroundColor: base
    paddingVertical: 4xl
  - _component: page-sections/info-blocks/faq-section
    heading: Frequently asked questions
    headingLevel: h2
    headingSize: lg
    singleOpen: true
    openFirst: false
    items:
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: How does the component library work?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              We give you [straightforward building blocks](/component-library/)
              without hiding anything behind layers of abstraction. You see
              everything that's happening, and stay in control.
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: What's included in the component library?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Lean HTML, CSS, and small touches of vanilla JavaScript. No dead
              weight, no surprise dependencies, just the pieces you actually
              need to build great pages.
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: How is the component library so fast?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Performance comes from keeping things lightweight. The framework
              handles image optimization and responsive patterns so your site
              stays quick without extra work.
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: Can I customize the component library?
        contentSections:
          - _component: building-blocks/core-elements/text
            text: >-
              Every part of the component library is meant to be opened, read,
              and edited. You shape it to fit your project instead of working
              around someone else's opinions. Start by [browsing the
              components](/component-library/) to see how they're set up!
    maxContentWidth: xl
    paddingHorizontal: xl
    paddingVertical: 4xl
    colorScheme: default
    backgroundColor: none
  - _component: page-sections/builders/custom-section
    label: ""
    contentSections:
      - _component: building-blocks/core-elements/spacer
        size: md
      - _component: building-blocks/core-elements/heading
        text: Mix and match your components
        level: h2
        size: default
        alignX: center
        iconName:
        iconPosition: before
      - _component: building-blocks/core-elements/text
        text: >-
          With custom sections, you can create components for almost any use
          case.
        alignX: center
    maxContentWidth: 2xl
    paddingHorizontal: md
    paddingVertical: md
    colorScheme: contrast
    backgroundColor: surface
    backgroundImage:
      source: ""
      alt: ""
      positionVertical: top
      positionHorizontal: center
    rounded: false
  - _component: page-sections/features/feature-slider
    slides:
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: First slide demonstration
        title: Welcome to the carousel component
        description: >-
          This initial slide introduces visitors to the rotating content
          display. You'll notice how the text hierarchy works with the eyebrow,
          headline, and body copy creating clear visual distinction. The
          component is designed to guide users through multiple messages without
          overwhelming the page.
        imageSource: /src/assets/images/component-library/quiet-street.jpg
        imageAlt: High Performance
        minSplitWidth: 0
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: Content transition example
        title: Seamless navigation between slides
        description: >-
          As you move to the second position, observe how the previous content
          gracefully exits while this new information appears. The navigation
          controls below allow users to move at their own pace. This slide
          exists purely to demonstrate the component's ability to handle
          sequential content delivery.
        imageSource: /src/assets/images/component-library/sheep.jpg
        imageAlt: Easy Maintenance
        minSplitWidth: 0
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: Third position showcase
        title: Maintaining consistent formatting
        description: >-
          By the third slide, the pattern becomes clear. Each rotation maintains
          the same structural hierarchy and spacing, ensuring visual coherence
          throughout the carousel. This consistency helps users understand what
          to expect as they progress through the available content.
        imageSource: /src/assets/images/component-library/castle.jpg
        imageAlt: Move Faster
        minSplitWidth: 300
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: Final slide
        title: Completing the carousel loop
        description: >-
          This fourth and final slide demonstrates how the component handles the
          end of its sequence. Users can either cycle back to the beginning or
          pause here to absorb the information. The carousel has now
          successfully shown its capacity to present multiple content blocks in
          a compact, navigable format.
        imageSource: /src/assets/images/component-library/dunedin-cliff.jpg
        imageAlt: Long-Term Stability
        minSplitWidth: 0
    colorScheme: contrast
    backgroundColor: surface
    eyebrow: Why Carousel
    heading: Why this approach works
    subtext: Highlight the core reasons in a simple, swipeable format.
    paddingVertical: 4xl
  - _component: page-sections/people/testimonial-section
    text: >-
      This testimonial component has completely changed the way I present my
      quotations on Astro sites. I couldn't be happier with the results.
    authorName: John Convincingname
    authorDescription: Founder
    authorImage: /src/assets/images/component-library/profile.jpg
    alignX: center
    maxContentWidth: xl
    paddingHorizontal: xl
    paddingVertical: 2xl
    colorScheme: contrast
    backgroundColor: surface
  - _component: page-sections/people/team-grid
    eyebrow: Our Team
    heading: Meet the people
    subtext: We're a group of stock photography faces that fill out this team grid.
    teamMembers:
      - _component: page-sections/people/team-grid/team-item
        name: "Alex Smith "
        role: Lead Developer
        bio: >-
          As a fictional representation of a real employee, I exist solely to
          demonstrate how profile information appears in this layout. My
          headshot is perfectly lit, and my description maintains the ideal
          length for this component.
        imageSource: /src/assets/images/component-library/profile1.jpg
        imageAlt: Alex Smith, CEO
      - _component: page-sections/people/team-grid/team-item
        name: Tom Rodriguez
        role: Chief Technology Officer
        bio: >-
          I'm here to show how multiple team members look when displayed
          together. My expertise includes being professionally photographed and
          having exactly two sentences of biographical text.
        imageSource: /src/assets/images/component-library/profile2.jpg
        imageAlt: Tom Rodriguez, CTO
      - _component: page-sections/people/team-grid/team-item
        name: Helen Kim
        role: Head of Design
        bio: >-
          I demonstrate how the component handles a third profile entry. My
          carefully crafted placeholder text ensures the layout remains
          consistent, regardless of whether you're viewing on a tablet or
          desktop display.
        imageSource: /src/assets/images/component-library/profile3.jpg
        imageAlt: Helen Kim, Head of Design
      - _component: page-sections/people/team-grid/team-item
        name: Emily Watson
        role: Director of Operations
        bio: >-
          I round out the team grid to demonstrate how the layout adapts to a
          fourth member. My presence here confirms that the component scales
          appropriately, maintaining visual balance across different screen
          sizes.
        imageSource: /src/assets/images/component-library/profile4.jpg
        imageAlt: Emily Watson, Director of Operations
    colorScheme: contrast
    backgroundColor: surface
    paddingVertical: 2xl
  - _component: page-sections/ctas/cta-form
    heading: Form and function!
    subtext: >-
      This is a sample form component, so it's not wired up yet, but it's all
      ready to <a
      href="https://cloudcannon.com/documentation/articles/getting-started-with-forms-on-cloudcannon/"
      target="_blank" rel="noopener">configure with CloudCannon</a>.
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
        label: Message
        name: message
        required: true
      - _component: building-blocks/forms/submit
        text: Send message
        variant: primary
        size: md
        iconPosition: before
        hideText: false
        disabled: false
    imageSource: /src/assets/images/component-library/castle.jpg
    imageAlt: Get in touch
    reverse: false
    colorScheme: contrast
    backgroundColor: surface
    paddingVertical: 4xl
---
