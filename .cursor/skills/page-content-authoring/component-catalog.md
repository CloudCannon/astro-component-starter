# Component catalog

Every component the library ships. Each is a directory under `src/components/`; its `_component` path is that directory path in kebab-case. This is the canonical list of what exists and when to use each — other skills link here.

**Full prop list for any entry:** open its `.astro` file and read the `Astro.props` destructure. The file path is mechanical — the last path segment PascalCased: `page-sections/heroes/hero-center` → `src/components/page-sections/heroes/hero-center/HeroCenter.astro`. For page sections, the editor-facing defaults and input types also live in the sibling `<slug>.cloudcannon.structure-value.yml` + `.inputs.yml`. The tables below list the **content** props an author sets — not every prop.

## Page sections

Place these directly in a page's `pageSections` array. **All page sections also take the standard shell props** (`sectionLabel`, `maxContentWidth`, `paddingHorizontal`, `paddingVertical`, `colorScheme`, `backgroundColor`, `background`) — see [SKILL.md → Standard section props](SKILL.md#standard-section-props-every-page-section). Only content props are listed here.

<!-- generated:catalog:page-sections:start (npm run docs:catalog) -->

### Heroes

| `_component`                       | Use for                                                   | Key content props                                                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `page-sections/heroes/hero-center` | Centered hero with heading, supporting text, and buttons. | `eyebrow`, `heading`, `subtext` (markdown), `buttonSections[]`                                                                                                                 |
| `page-sections/heroes/hero-split`  | Hero with text on one side and an image on the other.     | `eyebrow`, `heading`, `subtext` (markdown), `imageSource`, `imageAlt`, `imageAspectRatio` (`none`/`square`/`landscape`/`portrait`/`widescreen`), `buttonSections[]`, `reverse` |

### Features

| `_component`                            | Use for                                                                  | Key content props                                                                                                                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page-sections/features/feature-grid`   | Responsive grid layout for highlighting multiple product features.       | `eyebrow`, `heading`, `subtext` (markdown), `alignmentHorizontal` (`start`/`center`), `features[]`                                                                                             |
| `page-sections/features/feature-slider` | Carousel of feature cards, ideal for showcasing key reasons or benefits. | `slides[]`                                                                                                                                                                                     |
| `page-sections/features/feature-split`  | One feature explained beside an image.                                   | `eyebrow`, `heading`, `subtext` (markdown), `buttonSections[]`, `imageSource`, `imageAlt`, `imageAspectRatio` (`none`/`portrait`/`square`/`landscape`/`widescreen`), `imageRounded`, `reverse` |

- `feature-grid` item (`features[]`): `title`, `description`, `iconName`, `iconColor`, `iconBackground`.
- `feature-slider` item (`slides[]`): `eyebrow`, `title`, `description`, `imageSource`, `imageAlt`.
- **`feature-slider`**: No section-level heading — each slide carries its own text.

### CTAs

| `_component`                    | Use for                                                                  | Key content props                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `page-sections/ctas/cta-center` | Centered call-to-action with headline, supporting text, and buttons.     | `heading`, `subtext` (markdown), `buttonSections[]`                                                 |
| `page-sections/ctas/cta-form`   | Side-by-side CTA with copy and form on one side and image on the other.  | `heading`, `subtext` (markdown), `formAction`, `formBlocks[]`, `imageSource`, `imageAlt`, `reverse` |
| `page-sections/ctas/cta-split`  | Side-by-side CTA with copy on one side and stacked buttons on the other. | `heading`, `subtext` (markdown), `imageSource`, `imageAlt`, `buttonSections[]`, `reverse`           |

### Info blocks

| `_component`                            | Use for                                                               | Key content props    |
| --------------------------------------- | --------------------------------------------------------------------- | -------------------- |
| `page-sections/info-blocks/faq-section` | Section displaying frequently asked questions in an accordion format. | `heading`, `items[]` |

- `faq-section` item (`items[]`): `title`, `contentSections`.

### People

| `_component`                               | Use for                                                            | Key content props                                                             |
| ------------------------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `page-sections/people/team-grid`           | Responsive grid layout for showcasing team members.                | `eyebrow`, `heading`, `subtext`, `layout` (`start`/`center`), `teamMembers[]` |
| `page-sections/people/testimonial-section` | Section displaying a customer testimonial with author information. | `text` (markdown), `authorName`, `authorDescription`, `authorImage`           |

- `team-grid` item (`teamMembers[]`): `name`, `role`, `bio`, `imageSource`, `imageAlt`.

### Builders

| `_component`                            | Use for                                           | Key content props                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page-sections/builders/custom-section` | Used to group and style large sections of a page. | `label`, `contentSections[]`, `maxContentWidth` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`), `paddingHorizontal` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`/`5xl`/`6xl`), `paddingVertical` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`/`5xl`/`6xl`), `colorScheme` (`inherit`/`light`/`dark`), `lockColorScheme`, `backgroundColor` (`none`/`base`/`surface`/`accent`/`highlight`), `background`, `rounded` |

- **`custom-section`**: The escape hatch for arbitrary layouts; `rounded` is unique to this section (page-section wrappers do not forward it).

<!-- generated:catalog:page-sections:end -->

## Building blocks

Composed **inside** page sections (in `contentSections`, `buttonSections`, `formBlocks`, `items`, `slides`, etc.), not placed directly in `pageSections`. Path prefix omitted in the tables below — prepend `building-blocks/`.

<!-- generated:catalog:building-blocks:start (npm run docs:catalog) -->

### Core elements — `building-blocks/core-elements/<slug>`

| `<slug>`          | Use for                                                           | Key content props                                                                                                                                                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`          | Clickable button for calls-to-action and navigation.              | `text`, `link`, `iconName`, `iconColor` (`default`/`blue`/`green`/`yellow`/`orange`/`red`/`purple`/`pink`/`cyan`), `iconPosition` (`before`/`after`), `hideText`, `variant` (`primary`/`secondary`/`tertiary`/`ghost`/`text`), `size` (`sm`/`md`/`lg`)                                                              |
| `counter`         | Animated counter for highlighting key stats or figures.           | `number`, `prefix`, `suffix`, `alignmentHorizontal` (`start`/`center`/`end`), `size` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`)                                                                                                                                                                                   |
| `definition-list` | Lists term/definition pairs for structured content.               | `items[]`, `alignmentHorizontal` (`start`/`center`/`end`)                                                                                                                                                                                                                                                           |
| `divider`         | Visual separator for dividing content sections.                   | `paddingVertical` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`)                                                                                                                                                                                                                                                     |
| `embed`           | Responsive wrapper for third-party embeds and raw HTML content.   | `html`, `aspectRatio` (`square`/`landscape`/`portrait`/`widescreen`)                                                                                                                                                                                                                                                |
| `heading`         | Headings for content hierarchy.                                   | `text`, `level` (`h1`/`h2`/`h3`/`h4`/`h5`/`h6`), `size` (`default`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`), `alignmentHorizontal` (`start`/`center`/`end`), `iconName`, `iconColor` (`default`/`blue`/`green`/`yellow`/`orange`/`red`/`purple`/`pink`/`cyan`), `iconPosition` (`before`/`after`)                |
| `icon`            | SVG icon component.                                               | `name`, `size` (`none`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`), `color` (`default`/`blue`/`green`/`yellow`/`orange`/`red`/`purple`/`pink`/`cyan`), `background`, `alignmentHorizontal` (`none`/`start`/`center`/`end`)                                                                                                     |
| `image`           | Optimized image component for local and remote sources.           | `source`, `alternateSource`, `alt`, `decorative`, `sizes`, `widths[]`, `width`, `height`, `rounded`, `aspectRatio` (`none`/`square`/`landscape`/`portrait`/`widescreen`/`horizontal-strip`), `positionVertical` (`top`/`center`/`bottom`), `positionHorizontal` (`left`/`center`/`right`), `background`, `priority` |
| `list`            | Lists items with icons, bullets, or numbers as markers.           | `listType` (`icon`/`bullet`/`numbered`), `items[]`, `direction` (`horizontal`/`vertical`), `alignmentHorizontal` (`start`/`center`/`end`), `size` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`)                                                                                                                      |
| `pagination`      | Navigation component for multi-page content.                      | `page`, `showArrows`                                                                                                                                                                                                                                                                                                |
| `simple-text`     | Paragraph for plain text content with inline markdown formatting. | `text`, `alignmentHorizontal` (`start`/`center`/`end`), `size` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`)                                                                                                                                                                                                         |
| `spacer`          | Adds adjustable spacing between content sections.                 | `size` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`)                                                                                                                                                                                                                                                                       |
| `testimonial`     | Displays customer quotes and reviews.                             | `text` (markdown), `authorName`, `authorDescription`, `authorImage`, `alignmentHorizontal` (`start`/`center`)                                                                                                                                                                                                       |
| `text`            | Content component for markdown-formatted text.                    | `text` (markdown), `alignmentHorizontal` (`start`/`center`/`end`), `size` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`)                                                                                                                                                                                              |
| `video`           | Video component for YouTube, Vimeo, and HTML5 sources.            | `type` (`youtube`/`vimeo`/`local-source`), `title`, `videoId`, `source`, `autoplay`, `loop`, `thumbnail`                                                                                                                                                                                                            |

- `definition-list` item (`items[]`): `title`, `text`.
- `list` item (`items[]`): `text`, `iconName`, `iconColor`, `showIcon`, `link`.

### Wrappers — `building-blocks/wrappers/<slug>`

Containers that hold other building blocks (their child items are themselves `_component` blocks).

| `<slug>`           | Use for                                                                           | Key content props                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accordion`        | Interactive component for showing and hiding content panels.                      | `label`, `items[]`, `openFirst`, `singleOpen`                                                                                                                                                                                                                                                                                                                                                                                                             |
| `bento-box`        | A grid layout where items can span multiple columns and rows.                     | `label`, `columns` (`2`/`3`/`4`), `minRowHeight`, `items[]`, `gap` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`)                                                                                                                                                                                                                                                                                                                                          |
| `button-group`     | Arranges buttons side by side with consistent spacing.                            | `label`, `buttonSections[]`, `direction` (`row`/`column`), `alignmentHorizontal` (`start`/`center`/`end`)                                                                                                                                                                                                                                                                                                                                                 |
| `card`             | Groups related content within a section.                                          | `label`, `contentSections[]`, `beforeContentSections[]`, `afterContentSections[]`, `maxContentWidth` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`), `showBeforeAfter`, `paddingHorizontal` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`), `paddingVertical` (`xs`/`sm`/`md`/`lg`/`xl`/`2xl`), `colorScheme` (`inherit`/`light`/`dark`), `lockColorScheme`, `backgroundColor` (`none`/`base`/`surface`/`accent`/`highlight`), `background`, `link`, `rounded`, `border` |
| `carousel`         | Displays multiple items in a sliding gallery.                                     | `label`, `slides[]`, `autoPlay`, `pauseOnHover`, `autoScroll`, `loop`, `showIndicators`, `indicatorStyle` (`dots`/`fraction`), `showArrows`, `alignmentHorizontal` (`start`/`center`/`end`), `slidesToScroll` (`auto`/`1`/`2`/`3`/`4`), `slideWidthPercent`, `minSlideWidth`, `gap` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`)                                                                                                                         |
| `content-selector` | Lets users switch between different content panels using tabs.                    | `label`, `items[]`, `navigationPosition` (`start`/`top`)                                                                                                                                                                                                                                                                                                                                                                                                  |
| `grid`             | Arranges content into a grid that adapts to screen size.                          | `label`, `layout` (`start`/`center`), `minItemWidth`, `maxItemWidth`, `items[]`, `gap` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`)                                                                                                                                                                                                                                                                                                                      |
| `image-carousel`   | Displays images in a carousel with a thumbnail strip for navigation.              | `label`, `images[]`, `showArrows`, `loop`, `aspectRatio` (`none`/`square`/`landscape`/`portrait`/`widescreen`/`horizontal-strip`), `sizes`, `widths[]`                                                                                                                                                                                                                                                                                                    |
| `modal`            | Dialog overlay triggered by a button, for focused content or actions.             | `label`, `heading`, `triggerText`, `triggerVariant` (`primary`/`secondary`/`tertiary`/`ghost`/`text`), `triggerSize` (`sm`/`md`/`lg`), `triggerIconName`, `size` (`sm`/`md`/`lg`/`xl`), `contentSections[]`                                                                                                                                                                                                                                               |
| `split`            | Two-column layout for side-by-side content.                                       | `label`, `firstColumnContentSections[]`, `secondColumnContentSections[]`, `distributionMode` (`quarter-three-quarters`/`third-two-thirds`/`half`/`two-thirds-third`/`three-quarters-quarter`/`fixed-flexible`/`flexible-fixed`), `fixedWidth`, `minSplitWidth`, `alignmentVertical` (`top`/`center`/`bottom`/`stretch`), `reverse`, `reverseOrderOnMobile`, `gap` (`none`/`xs`/`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`)                                           |
| `video-modal`      | Dialog overlay with an embedded video that autoplays on open and pauses on close. | `label`, `type` (`youtube`/`vimeo`/`local-source`), `title`, `videoId`, `source`, `triggerText`, `triggerVariant` (`primary`/`secondary`/`tertiary`/`ghost`/`text`), `triggerSize` (`sm`/`md`/`lg`), `triggerIconName`, `size` (`sm`/`md`/`lg`/`xl`)                                                                                                                                                                                                      |

- `accordion` item (`items[]`): `title`, `contentSections`.
- `bento-box` item (`items[]`): `colSpan`, `rowSpan`, `contentSections`.
- `carousel` item (`slides[]`): `contentSections`.
- `content-selector` item (`items[]`): `title`, `subtext`, `iconName`, `iconColor`, `contentSections`, `navigationPosition`.
- `grid` item (`items[]`): `contentSections`.

### Forms — `building-blocks/forms/<slug>`

Compose these inside a `form` (or a page section's `formBlocks[]`, as in `cta-form`).

| `<slug>`       | Use for                                                    | Key content props                                                                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `choice-group` | Form field for selecting one or more options.              | `title`, `name`, `required`, `options[]`, `orientation` (`vertical`/`horizontal`), `multiple`                                                                                                                                                              |
| `date`         | Form field for selecting a date.                           | `label`, `name`, `required`, `value`, `min`, `max`, `hint`                                                                                                                                                                                                 |
| `file-upload`  | Form field for uploading files.                            | `label`, `name`, `required`, `accept`, `multiple`, `hint`                                                                                                                                                                                                  |
| `form`         | Groups form fields into one submission area.               | `action`, `formBlocks[]`                                                                                                                                                                                                                                   |
| `hidden`       | Hidden form field for storing data.                        | `name`, `value`                                                                                                                                                                                                                                            |
| `input`        | Single text input form field.                              | `label`, `name`, `type` (`text`/`email`/`password`/`tel`/`url`/`number`), `placeholder`, `required`, `value`, `hint`, `iconName`, `iconColor` (`default`/`blue`/`green`/`yellow`/`orange`/`red`/`purple`/`pink`/`cyan`), `iconPosition` (`before`/`after`) |
| `range`        | Slider input for selecting a numeric value within a range. | `label`, `name`, `min`, `max`, `step`, `value`, `required`, `showValue`, `hint`                                                                                                                                                                            |
| `segments`     | Segmented control form field with connected buttons.       | `title`, `name`, `required`, `options[]`, `iconOnly`, `multiple`, `keepStateOnRefresh`                                                                                                                                                                     |
| `select`       | Form field for selecting one option from a list.           | `label`, `name`, `required`, `options[]`, `placeholder`, `value`, `hint`, `iconName`, `iconColor` (`default`/`blue`/`green`/`yellow`/`orange`/`red`/`purple`/`pink`/`cyan`)                                                                                |
| `submit`       | Button for submitting a form.                              | `text`, `variant` (`primary`/`secondary`/`tertiary`/`ghost`/`text`), `size` (`sm`/`md`/`lg`), `iconName`, `iconColor` (`default`/`blue`/`green`/`yellow`/`orange`/`red`/`purple`/`pink`/`cyan`), `iconPosition` (`before`/`after`), `hideText`, `disabled` |
| `textarea`     | Form field for entering multi-line text.                   | `label`, `name`, `required`, `placeholder`, `value`, `hint`                                                                                                                                                                                                |
| `toggle`       | Toggle switch form field for binary choices.               | `label`, `name`, `checked`, `required`, `value`                                                                                                                                                                                                            |

- `choice-group` item (`options[]`): `value`, `label`, `checked`.
- `segments` item (`options[]`): `value`, `label`, `checked`, `icon`.
- `select` item (`options[]`): `value`, `label`, `selected`, `disabled`.

<!-- generated:catalog:building-blocks:end -->
