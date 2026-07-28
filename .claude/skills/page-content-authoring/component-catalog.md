# Component catalog

Every component the library ships. Each is a directory under `src/components/`; its `_component` path is that directory path in kebab-case. This is the canonical list of what exists and when to use each — other skills link here.

**Full prop list for any entry:** open its `.astro` file and read the `Astro.props` destructure. The file path is mechanical — the last path segment PascalCased: `page-sections/heroes/hero-center` → `src/components/page-sections/heroes/hero-center/HeroCenter.astro`. For page sections, the editor-facing defaults and input types also live in the sibling `<slug>.cloudcannon.structure-value.yml` + `.inputs.yml`. The tables below list the **content** props an author sets — not every prop.

## Page sections

Place these directly in a page's `pageSections` array. **All page sections also take the standard shell props** (`sectionLabel`, `maxContentWidth`, `paddingHorizontal`, `paddingVertical`, `colorScheme`, `backgroundColor`, `background`) — see [SKILL.md → Standard section props](SKILL.md#standard-section-props-every-page-section). Only content props are listed here.

### Heroes

| `_component`                       | Use for                                          | Key content props                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page-sections/heroes/hero-center` | Centered page banner, stacked text + buttons     | `eyebrow`, `heading`, `subtext` (markdown), `buttonSections[]`                                                                                                      |
| `page-sections/heroes/hero-split`  | Banner with text on one side, image on the other | `eyebrow`, `heading`, `subtext`, `imageSource`, `imageAlt`, `imageAspectRatio` (`none`/`square`/`landscape`/`portrait`/`widescreen`), `buttonSections[]`, `reverse` |

### Features

| `_component`                            | Use for                                      | Key content props                                                                                                                                  |
| --------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page-sections/features/feature-grid`   | Responsive grid of icon + text feature cards | `eyebrow`, `heading`, `subtext`, `alignmentHorizontal` (`start`/`center`), `features[]`                                                            |
| `page-sections/features/feature-split`  | One feature explained beside an image        | `eyebrow`, `heading`, `subtext`, `buttonSections[]`, `imageSource`, `imageAlt`, `imageAspectRatio` (default `portrait`), `imageRounded`, `reverse` |
| `page-sections/features/feature-slider` | Swipeable carousel of feature cards          | `slides[]` — **no section-level heading; each slide carries its own text**                                                                         |

- `feature-grid` item (`features[]`): `title`, `description` (markdown), `iconName` ([Heroicons](https://heroicons.com/) name), `iconColor` (`default`/`blue`/`green`/`yellow`/`orange`/`red`/`purple`/`pink`/`cyan`).
- `feature-slider` slide (`slides[]`): `eyebrow`, `title`, `description` (markdown), `imageSource`, `imageAlt`.

### CTAs

| `_component`                    | Use for                               | Key content props                                                                                               |
| ------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `page-sections/ctas/cta-center` | Centered closing call to action       | `heading`, `subtext`, `buttonSections[]`                                                                        |
| `page-sections/ctas/cta-split`  | CTA copy + buttons beside an image    | `heading`, `subtext`, `imageSource`, `imageAlt`, `buttonSections[]`, `reverse`                                  |
| `page-sections/ctas/cta-form`   | Lead-capture form beside copy + image | `heading`, `subtext`, `formAction`, `formBlocks[]` (form building blocks), `imageSource`, `imageAlt`, `reverse` |

### Info blocks

| `_component`                            | Use for                          | Key content props                                    |
| --------------------------------------- | -------------------------------- | ---------------------------------------------------- |
| `page-sections/info-blocks/faq-section` | Accordion of questions & answers | `heading`, `items[]`, `label` (accordion aria label) |

FAQ item (`items[]`): `title` (the question), `contentSections[]` (answer body — typically `building-blocks/core-elements/text`). Note: single-open behavior and the heading level are fixed in the component, not props.

### People

| `_component`                               | Use for                   | Key content props                                                             |
| ------------------------------------------ | ------------------------- | ----------------------------------------------------------------------------- |
| `page-sections/people/team-grid`           | Grid of team-member cards | `eyebrow`, `heading`, `subtext`, `layout` (`start`/`center`), `teamMembers[]` |
| `page-sections/people/testimonial-section` | A single customer quote   | `text` (markdown quote), `authorName`, `authorDescription`, `authorImage`     |

Team member (`teamMembers[]`): `name`, `role`, `bio`, `imageSource`, `imageAlt`.

### Builders

| `_component`                            | Use for                                        | Key content props                                                           |
| --------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| `page-sections/builders/custom-section` | Free composition when no specific section fits | `label`, `contentSections[]` (any building blocks), `rounded`, `background` |

`custom-section` is the escape hatch: drop any building blocks into `contentSections[]` and style via the shell props. `rounded` is unique to this section (page-section wrappers do not forward it).

## Building blocks

Composed **inside** page sections (in `contentSections`, `buttonSections`, `formBlocks`, `items`, `slides`, etc.), not placed directly in `pageSections`. Path prefix omitted in the tables below — prepend `building-blocks/`.

### Core elements — `building-blocks/core-elements/<slug>`

| `<slug>`          | Use for                                | Key content props                                                                                                                                                     |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button`          | Link or action styled as a button      | `text`, `link`, `variant` (`primary`/`secondary`/`tertiary`/`ghost`), `size` (`sm`/`md`/`lg`), `iconName`, `iconColor`, `iconPosition` (`before`/`after`), `hideText` |
| `heading`         | Section / block heading                | `text`, `level` (`h1`–`h6`), `size`, `alignmentHorizontal`, `iconName`, `iconColor`, `iconPosition`                                                                   |
| `text`            | Rich / multi-line body copy (markdown) | `text`, `size`, `alignmentHorizontal`                                                                                                                                 |
| `simple-text`     | Short label / eyebrow / plain line     | `text`, `size`, `alignmentHorizontal`                                                                                                                                 |
| `image`           | Responsive image                       | `source`, `alt`, `decorative`, `rounded`, `aspectRatio`, `priority`, `positionVertical`, `positionHorizontal`, `width`, `height`, `background`                        |
| `icon`            | Single icon (Heroicons)                | `name`, `size`, `color`, `background`, `alignmentHorizontal`                                                                                                          |
| `list`            | Bulleted / icon / linked list          | `items[]` (`text`, `iconName`, `iconColor`, `showIcon`, `link`), `direction`, `alignmentHorizontal`, `size`, `listType`                                               |
| `definition-list` | Term / description pairs               | `items[]` (`title`, `text`), `alignmentHorizontal`                                                                                                                    |
| `testimonial`     | Quote with author                      | `text`, `authorName`, `authorDescription`, `authorImage`, `alignmentHorizontal`                                                                                       |
| `counter`         | Animated statistic                     | `number`, `prefix`, `suffix`, `size`, `alignmentHorizontal`                                                                                                           |
| `video`           | Embedded or hosted video               | `type`, `videoId`, `title`, `source`, `thumbnail`, `background`                                                                                                       |
| `embed`           | Raw HTML embed                         | `html`, `aspectRatio`                                                                                                                                                 |
| `divider`         | Horizontal rule                        | `paddingVertical`                                                                                                                                                     |
| `spacer`          | Vertical space                         | `size`                                                                                                                                                                |
| `pagination`      | Prev / next pager                      | `page`, `showArrows`                                                                                                                                                  |

### Wrappers — `building-blocks/wrappers/<slug>`

Containers that hold other building blocks (their child items are themselves `_component` blocks).

| `<slug>`           | Use for                               | Key content props                                                                                                                                                                                              |
| ------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grid`             | Responsive grid of equal cells        | `items[]` (`GridItem`: `contentSections[]`), `layout`, `minItemWidth`, `maxItemWidth`, `gap`, `label`                                                                                                          |
| `bento-box`        | Asymmetric grid with spanning cells   | `items[]` (`BentoBoxItem`: `colSpan`, `rowSpan`, `contentSections[]`), `columns`, `minRowHeight`, `gap`, `label`                                                                                               |
| `split`            | Two-column layout                     | `firstColumnContentSections[]`, `secondColumnContentSections[]`, `distributionMode`, `alignmentVertical`, `reverse`, `reverseOrderOnMobile`, `gap`, `minSplitWidth`, `label`                                   |
| `card`             | Bordered / elevated content box       | `contentSections[]`, `beforeContentSections[]`, `afterContentSections[]`, `link`, `rounded`, `border`, `colorScheme`, `backgroundColor`                                                                        |
| `accordion`        | Expand / collapse rows                | `items[]` (`AccordionItem`: `title`, `contentSections[]`), `singleOpen`, `openFirst`, `label`                                                                                                                  |
| `content-selector` | Tabbed panels                         | `items[]` (`ContentSelectorPanel`: `title`, `subtext`, `iconName`, `iconColor`, `contentSections[]`), `navigationPosition`, `label`                                                                            |
| `carousel`         | Sliding content slides                | `slides[]` (`CarouselSlide`: `contentSections[]`), `autoPlay`, `pauseOnHover`, `autoScroll`, `showIndicators`, `indicatorStyle` (`dots`/`fraction`), `showArrows`, `loop`, `slideWidthPercent`, `gap`, `label` |
| `image-carousel`   | Sliding images                        | `images[]`, `showArrows`, `loop`, `aspectRatio`, `label`                                                                                                                                                       |
| `button-group`     | Row / column of buttons               | `buttonSections[]`, `direction` (`row`/`column`), `alignmentHorizontal`, `label`                                                                                                                               |
| `modal`            | Content in a button-triggered popover | `heading`, `triggerText`, `triggerVariant`, `triggerSize`, `triggerIconName`, `size`, `contentSections[]`, `label`                                                                                             |
| `video-modal`      | Video in a button-triggered popover   | `type`, `videoId`, `title`, `source`, `triggerText`, `triggerVariant`, `triggerSize`, `triggerIconName`, `size`, `label`                                                                                       |

### Forms — `building-blocks/forms/<slug>`

Compose these inside a `form` (or a page section's `formBlocks[]`, as in `cta-form`).

| `<slug>`       | Use for                | Key content props                                                                                                     |
| -------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `form`         | Form wrapper           | `action`, `formBlocks[]`                                                                                              |
| `input`        | Single-line text field | `label`, `name`, `type`, `placeholder`, `required`, `value`, `iconName`, `iconColor`, `iconPosition`, `hint`, `error` |
| `textarea`     | Multi-line text field  | `label`, `name`, `placeholder`, `required`, `value`, `hint`, `error`                                                  |
| `select`       | Dropdown               | `label`, `name`, `options[]`, `placeholder`, `required`, `value`, `iconName`, `iconColor`, `hint`, `error`            |
| `choice-group` | Radio / checkbox group | `name`, `options[]`, `title`, `orientation`, `required`, `multiple`                                                   |
| `segments`     | Segmented control      | `name`, `options[]`, `title`, `required`, `iconOnly`, `multiple`, `keepStateOnRefresh`                                |
| `toggle`       | On / off switch        | `label`, `name`, `checked`, `required`, `value`                                                                       |
| `range`        | Slider                 | `label`, `name`, `min`, `max`, `step`, `value`, `required`, `showValue`, `hint`, `error`                              |
| `date`         | Date picker            | `label`, `name`, `required`, `value`, `min`, `max`, `hint`, `error`                                                   |
| `file-upload`  | File input             | `label`, `name`, `required`, `accept`, `multiple`, `hint`, `error`                                                    |
| `hidden`       | Hidden field           | `name`, `value`                                                                                                       |
| `submit`       | Submit button          | `text`, `variant`, `size`, `iconName`, `iconColor`, `iconPosition`, `hideText`, `disabled`                            |
