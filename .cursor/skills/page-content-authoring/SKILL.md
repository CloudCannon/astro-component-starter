---
name: page-content-authoring
description: Assemble pages from existing components in the Astro + CloudCannon component library. Use when building new pages, populating pageSections YAML, choosing which components to use, or understanding how page content files work.
---

# Page Content Authoring

Build pages by composing existing page section components in YAML frontmatter. This skill covers the page file format, the full component catalog, and common assembly patterns.

## Page file format

Pages live in `src/content/pages/` as Markdown files with YAML frontmatter. The body is rarely used — almost all content goes in `pageSections`.

```yaml
---
_schema: default
title: Page Title
description: Meta description for SEO.
pageSections:
  - _component: page-sections/heroes/hero-center
    heading: Welcome
    subtext: Supporting text here.
    buttonSections: []
    colorScheme: inherit
    backgroundColor: base
  - _component: page-sections/features/feature-grid
    heading: Features
    features: []
    colorScheme: inherit
    backgroundColor: surface
---
```

### Required fields

| Field          | Type   | Purpose                                                |
| -------------- | ------ | ------------------------------------------------------ |
| `title`        | string | Page title (used in `<title>` via `seo.json` template) |
| `pageSections` | array  | Ordered list of section blocks to render               |

### Optional fields

| Field         | Type     | Purpose                            |
| ------------- | -------- | ---------------------------------- |
| `_schema`     | string   | CloudCannon schema (use `default`) |
| `description` | string   | Meta description                   |
| `keywords`    | string[] | Meta keywords                      |
| `image`       | string   | OG image path                      |
| `canonical`   | string   | Canonical URL override             |

### How pages render

```
src/content/pages/*.md
  → src/pages/[...slug].astro (loads collection, passes to Page layout)
    → src/layouts/Page.astro (extracts pageSections, wraps in MainComponent)
      → src/components/utils/MainComponent.astro (editable array container)
        → src/components/utils/renderBlock.astro (resolves _component → Astro component)
```

The `_component` value in each section is a path key that `renderBlock.astro` uses to look up the component from its `import.meta.glob` registry. It must match the component's directory path under `src/components/`.

### File naming and URLs

| File path                                  | URL                     |
| ------------------------------------------ | ----------------------- |
| `src/content/pages/index.md`               | `/`                     |
| `src/content/pages/about.md`               | `/about/`               |
| `src/content/pages/services/consulting.md` | `/services/consulting/` |

The `blog` slug is excluded from the catch-all route (it has its own route).

---

## Component catalog

Every page section and its key props. Use `_component` exactly as shown.

### Heroes

#### hero-center

Full-width centered hero with heading, subtext, and buttons.

```yaml
- _component: page-sections/heroes/hero-center
  eyebrow: ''
  heading: Main headline
  subtext: >-
    Supporting paragraph with markdown support.
  buttonSections:
    - _component: building-blocks/core-elements/button
      text: Get Started
      link: /contact/
      variant: primary
      size: md
  colorScheme: inherit
  backgroundColor: base
```

| Prop              | Type     | Options / Notes                                  |
| ----------------- | -------- | ------------------------------------------------ |
| `eyebrow`         | text     | Small text above heading                         |
| `heading`         | text     | Main headline                                    |
| `subtext`         | markdown | Supporting text                                  |
| `buttonSections`  | array    | Button components                                |
| `colorScheme`     | select   | `inherit`, `light`, `dark`                       |
| `backgroundColor` | select   | `none`, `base`, `surface`, `accent`, `highlight` |

#### hero-split

Split layout hero with text on one side and image on the other.

```yaml
- _component: page-sections/heroes/hero-split
  eyebrow: ''
  heading: Main headline
  subtext: >-
    Supporting paragraph.
  imageSource: /src/assets/images/hero.jpg
  imageAlt: Hero image description
  imageAspectRatio: none
  buttonSections:
    - _component: building-blocks/core-elements/button
      text: Learn More
      link: /about/
      variant: primary
      size: md
  reverse: false
  colorScheme: inherit
  backgroundColor: base
```

| Prop               | Type     | Options / Notes                                         |
| ------------------ | -------- | ------------------------------------------------------- |
| `eyebrow`          | text     | Small text above heading                                |
| `heading`          | text     | Main headline                                           |
| `subtext`          | markdown | Supporting text                                         |
| `imageSource`      | image    | Path to image                                           |
| `imageAlt`         | text     | Alt text                                                |
| `imageAspectRatio` | select   | `none`, `square`, `landscape`, `portrait`, `widescreen` |
| `buttonSections`   | array    | Button components                                       |
| `reverse`          | switch   | Flip image/text sides                                   |
| `colorScheme`      | select   | `inherit`, `light`, `dark`                              |
| `backgroundColor`  | select   | `none`, `base`, `surface`, `accent`, `highlight`        |

---

### Features

#### feature-grid

Responsive grid of feature items with icons and descriptions.

```yaml
- _component: page-sections/features/feature-grid
  eyebrow: Why Us
  heading: Key benefits
  subtext: >-
    Supporting text.
  align: center
  gap: xl
  minItemWidth: 280
  maxItemWidth: 360
  features:
    - title: Fast
      description: >-
        Lightning fast performance.
      iconName: bolt
      iconColor: yellow
    - title: Secure
      description: >-
        Enterprise-grade security.
      iconName: shield-check
      iconColor: green
  colorScheme: inherit
  backgroundColor: surface
```

| Prop                            | Type     | Options / Notes                                            |
| ------------------------------- | -------- | ---------------------------------------------------------- |
| `eyebrow`                       | text     | Small text above heading                                   |
| `heading`                       | text     | Section headline                                           |
| `subtext`                       | markdown | Supporting text                                            |
| `align`                         | select   | `start`, `center`                                          |
| `gap`                           | select   | `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`                       |
| `minItemWidth` / `maxItemWidth` | number   | Grid item size constraints (px)                            |
| `features`                      | array    | Items with `title`, `description`, `iconName`, `iconColor` |
| `colorScheme`                   | select   | `inherit`, `light`, `dark`                                 |
| `backgroundColor`               | select   | `none`, `base`, `surface`, `accent`, `highlight`           |

Feature item fields: `title` (text), `description` (markdown), `iconName` (from icon set), `iconColor` (`default`, `blue`, `green`, `yellow`, `orange`, `red`, `purple`, `pink`, `cyan`).

#### feature-split

Split layout pairing text with an image.

```yaml
- _component: page-sections/features/feature-split
  eyebrow: Built for Speed
  heading: Fast by design
  subtext: >-
    Explanation text.
  buttonSections: []
  imageSource: /src/assets/images/feature.jpg
  imageAlt: Feature illustration
  imageAspectRatio: portrait
  imageRounded: true
  reverse: false
  colorScheme: inherit
  backgroundColor: base
```

| Prop               | Type     | Options / Notes                                         |
| ------------------ | -------- | ------------------------------------------------------- |
| `eyebrow`          | text     | Small text above heading                                |
| `heading`          | text     | Section headline                                        |
| `subtext`          | markdown | Supporting text                                         |
| `buttonSections`   | array    | Button components                                       |
| `imageSource`      | image    | Path to image                                           |
| `imageAlt`         | text     | Alt text                                                |
| `imageAspectRatio` | select   | `none`, `portrait`, `square`, `landscape`, `widescreen` |
| `imageRounded`     | switch   | Round image corners                                     |
| `reverse`          | switch   | Flip image/text sides                                   |
| `colorScheme`      | select   | `inherit`, `light`, `dark`                              |
| `backgroundColor`  | select   | `none`, `base`, `surface`, `accent`, `highlight`        |

#### feature-slider

Carousel of feature cards with images.

```yaml
- _component: page-sections/features/feature-slider
  eyebrow: Highlights
  heading: Why this works
  subtext: Key reasons in a swipeable format.
  slides:
    - eyebrow: First
      title: Slide one
      description: >-
        Description text.
      imageSource: /src/assets/images/slide1.jpg
      imageAlt: Slide one
      minSplitWidth: 0
  colorScheme: inherit
  backgroundColor: surface
```

| Prop              | Type     | Options / Notes                                  |
| ----------------- | -------- | ------------------------------------------------ |
| `eyebrow`         | text     | Small text above heading                         |
| `heading`         | text     | Section headline                                 |
| `subtext`         | textarea | Supporting text                                  |
| `slides`          | array    | Slide items (see below)                          |
| `colorScheme`     | select   | `inherit`, `light`, `dark`                       |
| `backgroundColor` | select   | `none`, `base`, `surface`, `accent`, `highlight` |

Slide item fields: `eyebrow` (text), `title` (text), `description` (markdown), `imageSource` (image), `imageAlt` (text), `minSplitWidth` (number).

---

### CTAs

#### cta-center

Centered call-to-action with headline, text, and buttons.

```yaml
- _component: page-sections/ctas/cta-center
  heading: Ready to start?
  subtext: >-
    Take the next step today.
  buttonSections:
    - _component: building-blocks/core-elements/button
      text: Contact Us
      link: /contact/
      variant: primary
      size: md
  colorScheme: dark
  backgroundColor: surface
```

| Prop              | Type     | Options / Notes                                  |
| ----------------- | -------- | ------------------------------------------------ |
| `heading`         | text     | CTA headline                                     |
| `subtext`         | markdown | Supporting text                                  |
| `buttonSections`  | array    | Button components                                |
| `colorScheme`     | select   | `inherit`, `light`, `dark`                       |
| `backgroundColor` | select   | `none`, `base`, `surface`, `accent`, `highlight` |

#### cta-split

Split layout CTA with image on one side.

```yaml
- _component: page-sections/ctas/cta-split
  heading: Get in touch
  subtext: >-
    We'd love to hear from you.
  imageSource: /src/assets/images/cta.jpg
  imageAlt: Contact us
  buttonSections:
    - _component: building-blocks/core-elements/button
      text: Contact
      link: /contact/
      variant: primary
      size: md
  reverse: false
  colorScheme: inherit
  backgroundColor: base
```

| Prop              | Type     | Options / Notes                                  |
| ----------------- | -------- | ------------------------------------------------ |
| `heading`         | text     | CTA headline                                     |
| `subtext`         | markdown | Supporting text                                  |
| `imageSource`     | image    | Path to image                                    |
| `imageAlt`        | text     | Alt text                                         |
| `buttonSections`  | array    | Button components                                |
| `reverse`         | switch   | Flip sides                                       |
| `colorScheme`     | select   | `inherit`, `light`, `dark`                       |
| `backgroundColor` | select   | `none`, `base`, `surface`, `accent`, `highlight` |

#### cta-form

Split layout with a form and an image.

```yaml
- _component: page-sections/ctas/cta-form
  heading: Get in touch
  subtext: >-
    Fill out the form and we'll get back to you.
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
  imageSource: /src/assets/images/contact.jpg
  imageAlt: Contact image
  reverse: false
  colorScheme: inherit
  backgroundColor: base
```

| Prop              | Type     | Options / Notes                                  |
| ----------------- | -------- | ------------------------------------------------ |
| `heading`         | text     | Form section headline                            |
| `subtext`         | markdown | Supporting text                                  |
| `formAction`      | url      | Form submission URL                              |
| `formBlocks`      | array    | Form field components                            |
| `imageSource`     | image    | Path to image                                    |
| `imageAlt`        | text     | Alt text                                         |
| `reverse`         | switch   | Flip form/image sides                            |
| `colorScheme`     | select   | `inherit`, `light`, `dark`                       |
| `backgroundColor` | select   | `none`, `base`, `surface`, `accent`, `highlight` |

---

### Info blocks

#### faq-section

Accordion-style FAQ section.

```yaml
- _component: page-sections/info-blocks/faq-section
  heading: Frequently asked questions
  headingLevel: h2
  headingSize: lg
  singleOpen: true
  openFirst: false
  items:
    - title: What is this?
      contentSections:
        - _component: building-blocks/core-elements/text
          text: >-
            Answer text with [markdown links](/page/).
    - title: How does it work?
      contentSections:
        - _component: building-blocks/core-elements/text
          text: >-
            Another answer.
  maxContentWidth: xl
  paddingHorizontal: xl
  paddingVertical: 4xl
  colorScheme: inherit
  backgroundColor: none
```

| Prop                                    | Type   | Options / Notes                                  |
| --------------------------------------- | ------ | ------------------------------------------------ |
| `heading`                               | text   | Section headline                                 |
| `headingLevel`                          | select | `h1`–`h6`                                        |
| `headingSize`                           | select | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`              |
| `singleOpen`                            | switch | Only one item open at a time                     |
| `openFirst`                             | switch | First item open by default                       |
| `items`                                 | array  | FAQ items with `title` and `contentSections`     |
| `maxContentWidth`                       | select | `sm`–`2xl`                                       |
| `paddingHorizontal` / `paddingVertical` | select | Spacing sizes                                    |
| `colorScheme`                           | select | `inherit`, `light`, `dark`                       |
| `backgroundColor`                       | select | `none`, `base`, `surface`, `accent`, `highlight` |

Each FAQ item has `title` (text) and `contentSections` (array of building blocks, typically `building-blocks/core-elements/text`).

---

### People

#### team-grid

Responsive grid of team member cards.

```yaml
- _component: page-sections/people/team-grid
  eyebrow: Our Team
  heading: Meet the people
  subtext: A short intro about the team.
  teamMembers:
    - name: Jane Doe
      role: CEO
      bio: >-
        Short biography text.
      imageSource: /src/assets/images/team/jane.jpg
      imageAlt: Jane Doe
  colorScheme: inherit
  backgroundColor: surface
```

| Prop              | Type     | Options / Notes                                  |
| ----------------- | -------- | ------------------------------------------------ |
| `eyebrow`         | text     | Small text above heading                         |
| `heading`         | text     | Section headline                                 |
| `subtext`         | textarea | Supporting text                                  |
| `teamMembers`     | array    | Team member items (see below)                    |
| `colorScheme`     | select   | `inherit`, `light`, `dark`                       |
| `backgroundColor` | select   | `none`, `base`, `surface`, `accent`, `highlight` |

Team member fields: `name` (text), `role` (text), `bio` (textarea), `imageSource` (image), `imageAlt` (text).

#### testimonial-section

Single testimonial with author info.

```yaml
- _component: page-sections/people/testimonial-section
  text: >-
    This product changed everything for us.
  authorName: John Smith
  authorDescription: CEO, Acme Corp
  authorImage: /src/assets/images/testimonial.jpg
  alignmentHorizontal: center
  maxContentWidth: xl
  paddingHorizontal: xl
  paddingVertical: 2xl
  colorScheme: dark
  backgroundColor: surface
```

| Prop                                    | Type     | Options / Notes                                  |
| --------------------------------------- | -------- | ------------------------------------------------ |
| `text`                                  | markdown | Testimonial quote                                |
| `authorName`                            | text     | Author name                                      |
| `authorDescription`                     | text     | Author title/role                                |
| `authorImage`                           | image    | Author photo                                     |
| `alignmentHorizontal`                                | select   | `center`, `start`, `end`                         |
| `maxContentWidth`                       | select   | `sm`–`2xl`                                       |
| `paddingHorizontal` / `paddingVertical` | select   | Spacing sizes                                    |
| `colorScheme`                           | select   | `inherit`, `light`, `dark`                       |
| `backgroundColor`                       | select   | `none`, `base`, `surface`, `accent`, `highlight` |

---

### Builders

#### custom-section

Flexible container for composing any building blocks. Use when no specific page section fits.

```yaml
- _component: page-sections/builders/custom-section
  label: ''
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Custom content
      level: h2
      size: lg
      alignmentHorizontal: center
    - _component: building-blocks/core-elements/text
      text: >-
        Any combination of building blocks.
      alignmentHorizontal: center
  maxContentWidth: 2xl
  paddingHorizontal: md
  paddingVertical: md
  colorScheme: inherit
  backgroundColor: base
  background:
    type: image
    positionVertical: top
    positionHorizontal: center
    priority: false
    imageSource: ''
    imageAlt: ''
    videoSource: null
    overlay: 0
```

| Prop                                    | Type   | Options / Notes                                                                                                                                 |
| --------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`                                 | text   | Section label (also becomes anchor ID)                                                                                                          |
| `contentSections`                       | array  | Any building blocks                                                                                                                             |
| `maxContentWidth`                       | select | `xs`–`3xl`                                                                                                                                      |
| `paddingHorizontal` / `paddingVertical` | select | Spacing sizes                                                                                                                                   |
| `colorScheme`                           | select | `inherit`, `light`, `dark`                                                                                                                      |
| `backgroundColor`                       | select | `none`, `base`, `surface`, `accent`, `highlight`                                                                                                |
| `background`                            | object | `type`: `image` \| `video`; shared `positionVertical` / `positionHorizontal`; `overlay` (-1 to 1, darken/lighten); image: `imageSource`, `imageAlt`, `priority`; video: `videoSource` |

---

## Button component reference

Buttons appear in `buttonSections` arrays across many page sections.

```yaml
- _component: building-blocks/core-elements/button
  text: Button Text
  hideText: false
  link: /target-page/
  iconName: ''
  iconPosition: before
  variant: primary
  size: md
```

| Prop           | Values                                      |
| -------------- | ------------------------------------------- |
| `variant`      | `primary`, `secondary`, `tertiary`, `ghost` |
| `size`         | `sm`, `md`, `lg`                            |
| `iconPosition` | `before`, `after`                           |
| `hideText`     | `true` / `false` (icon-only button)         |

---

## Common page patterns

### Marketing landing page

```yaml
pageSections:
  - _component: page-sections/heroes/hero-center # or hero-split
  - _component: page-sections/features/feature-grid # key benefits
  - _component: page-sections/features/feature-split # detailed feature 1
  - _component: page-sections/features/feature-split # detailed feature 2 (reverse: true)
  - _component: page-sections/people/testimonial-section
  - _component: page-sections/ctas/cta-center # closing CTA
```

### About / Why page

```yaml
pageSections:
  - _component: page-sections/heroes/hero-split
  - _component: page-sections/info-blocks/faq-section
  - _component: page-sections/people/team-grid
  - _component: page-sections/ctas/cta-center
```

### Contact page

```yaml
pageSections:
  - _component: page-sections/heroes/hero-center
  - _component: page-sections/ctas/cta-form
```

---

## Visual treatment with colorScheme and backgroundColor

These two props control section appearance and work together:

- **`colorScheme`**: Sets `data-theme` on the section, switching all descendant color tokens.
  - `inherit` — uses parent theme (default)
  - `light` — forces light theme tokens
  - `dark` — forces dark theme tokens

- **`backgroundColor`**: Paints a background using the active theme's colors.
  - `none` — transparent
  - `base` — main background (`--color-bg`)
  - `surface` — slightly offset (`--color-bg-surface`)
  - `accent` — accent color (`--color-bg-accent`)
  - `highlight` — highlight color (`--color-bg-highlight`)

### Common combinations

| Visual effect          | `colorScheme`                  | `backgroundColor` |
| ---------------------- | ------------------------------ | ----------------- |
| White section          | `inherit`                      | `base`            |
| Light gray section     | `inherit`                      | `surface`         |
| Dark section           | `dark`                         | `surface`         |
| Colored accent section | `inherit`                      | `accent`          |
| Alternating sections   | alternate `base` and `surface` | —                 |

---

## YAML formatting rules

- Use `>-` block scalar for multiline text (strips trailing newline):
  ```yaml
  subtext: >-
    First line of text that continues
    on the next line.
  ```
- Image paths use `/src/assets/images/...` format
- Empty arrays: `buttonSections: []`
- Empty strings: `eyebrow: ''` or `eyebrow:`
- Nested component arrays must include `_component` on each item
- Use `true` / `false` for boolean switch props (not quoted)
