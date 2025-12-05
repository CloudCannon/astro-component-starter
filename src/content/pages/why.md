---
_schema: default
title: Why
pageSections:
  - _component: page-sections/heroes/hero-split
    eyebrow:
    heading: Why this Starter exists
    subtext: Build websites with small, predictable pieces and only the essentials so everything stays fast and easy to manage.
    imageSource: /src/assets/images/component-library/sunset.jpg
    imageAlt: Sunset
    imageAspectRatio: "portrait"
    buttonSections: []
    reverse: true
    colorScheme: default
    backgroundColor: base
    paddingVertical: 4xl

  - _component: page-sections/features/feature-slider
    colorScheme: contrast
    backgroundColor: surface
    paddingVertical: 4xl
    slides:
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: Speed
        title: High Performance
        description: Great performance starts with what you choose not to load. The component starter keeps everything lean with simple HTML, CSS, and vanilla JavaScript, plus built-in tools that squeeze every drop of performance out of your images.
        imageSource: /src/assets/images/component-library/quiet-street.jpg
        imageAlt: High Performance
        minSplitWidth: 0
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: Simplicity
        title: Easy Maintenance
        description: Maintaining a site is easier when the pieces stay small and predictable. With the component starter, you build on top of highly polished building blocks that stay clear, focused, and easy to work with as your site grows.
        imageSource: /src/assets/images/component-library/sheep.jpg
        imageAlt: Easy Maintenance
        minSplitWidth: 0
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: Collaboration
        title: Team Friendly
        description: Teams move faster when everything feels obvious. Clear names, simple patterns, and consistent structure mean anyone can open the project and immediately know where things live and how they work. No handoff drama. No onboarding tour.
        imageSource: /src/assets/images/component-library/castle.jpg
        imageAlt: Move Faster
        minSplitWidth: 300
      - _component: page-sections/features/feature-slider/feature-slider-item
        eyebrow: Future
        title: Long-Term Stability
        description: This stack isn't chasing trends, and it won't age out. It's built to last. You're using the same basics the web has relied on from the start. It's a set of solid tools that stay understandable and easy to improve, no matter how much time passes.
        imageSource: /src/assets/images/component-library/dunedin-cliff.jpg
        imageAlt: Long-Term Stability
        minSplitWidth: 0

  - _component: page-sections/people/testimonial-section
    text: "This framework has completely changed the way we build. The sites come together fast, they run even faster, and the whole process feels effortless. I couldn't be happier with the results."
    authorName: Richard Johnson
    authorDescription: CEO, Tech Innovations
    authorImage: /src/assets/images/component-library/profile.jpg
    paddingVertical: 2xl
    colorScheme: contrast
    backgroundColor: surface
  - _component: page-sections/people/team-grid
    eyebrow: Our Team
    heading: Meet the People
    subtext: We're a group of faces that fill out this team grid.
    paddingVertical: 2xl
    teamMembers:
      - _component: page-sections/people/team-grid/team-item
        name: Alex Smith
        role: Chief Executive Officer
        bio: Alex brings over 15 years of leadership experience and a vision for innovation that drives our company forward.
        imageSource: /src/assets/images/component-library/profile1.jpg
        imageAlt: Alex Smith, CEO
      - _component: page-sections/people/team-grid/team-item
        name: Tom Rodriguez
        role: Chief Technology Officer
        bio: Tom is a technology visionary with expertise in building scalable solutions that transform businesses.
        imageSource: /src/assets/images/component-library/profile2.jpg
        imageAlt: Tom Rodriguez, CTO
      - _component: page-sections/people/team-grid/team-item
        name: Helen Kim
        role: Head of Design
        bio: Helen combines creativity with strategic thinking to create beautiful, user-centered experiences.
        imageSource: /src/assets/images/component-library/profile3.jpg
        imageAlt: Helen Kim, Head of Design
      - _component: page-sections/people/team-grid/team-item
        name: Emily Watson
        role: Director of Operations
        bio: Emily ensures everything runs smoothly, bringing efficiency and excellence to every project we undertake.
        imageSource: /src/assets/images/component-library/profile4.jpg
        imageAlt: Emily Watson, Director of Operations
    colorScheme: contrast
    backgroundColor: surface
  - _component: page-sections/info-blocks/faq-section
    heading: Frequently Asked Questions
    items:
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: How does the component starter work?
        contentSections:
          - _component: building-blocks/core-elements/simple-text
            text: The framework gives you straightforward building blocks without hiding anything behind layers of abstraction. You see what's happening and you stay in control.
            size: md
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: What's included in the component starter?
        contentSections:
          - _component: building-blocks/core-elements/simple-text
            text: Lean HTML, CSS, and small touches of vanilla JavaScript. No dead weight, no surprise dependencies, just the pieces you actually need to build great pages.
            size: md
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: How is the component starter so fast?
        contentSections:
          - _component: building-blocks/core-elements/simple-text
            text: Performance comes from keeping things lightweight. The framework handles image optimization and responsive patterns so your site stays quick without extra work.
            size: md
      - _component: building-blocks/wrappers/accordion/accordion-item
        title: How can I make the component starter my own?
        contentSections:
          - _component: building-blocks/core-elements/simple-text
            text: Every part of the component starter is meant to be opened, read, and edited. You shape it to fit your project instead of working around someone else's opinions.
            size: md
    maxContentWidth: xl
    paddingHorizontal: xl
    paddingVertical: 4xl
    colorScheme: contrast
    backgroundColor: surface
  - _component: page-sections/ctas/cta-form
    heading: Get in touch
    subtext: Have questions? We'd love to hear from you.
    formAction: "./"
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
    imageSource: /src/assets/images/component-library/castle.jpg
    imageAlt: Get in touch
    reverse: false
    colorScheme: default
    backgroundColor: base
    paddingVertical: 4xl
---
