# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.0.0] - Unreleased

A big release: a browsable reference site for every component, site-wide
search, a privacy and consent workflow, automatic share cards, many new page
sections and building blocks, tooling that catches editor problems before they
ship, and a long list of accessibility fixes. If you have a site on this
starter, read the **Heads-up** items under Changed before upgrading: several
change how things look, and every page section moves to a new path.

### Added

#### Making the starter your own

- `npm run reset:starter` clears the demo content out of a fresh copy and sets your site name and URL. `--dry-run` shows the plan first, and it only runs on a clean git tree.
- `npm run check:placeholders` warns when starter placeholders are still in place, most importantly the `example.com` URL.
- Guides: `docs/DEPLOYMENT.md` for going live on CloudCannon, and `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and `docs/ARCHITECTURE.md` for people and AI agents working on the project.
- A `LICENSE` file (MIT), and recorded provenance for the icon set in `src/icons/README.md`.

#### Privacy and consent

- A site-wide privacy and consent workflow, edited in CloudCannon's **Privacy & Consent** and **Analytics** data panels. It is strict opt-in: analytics and external media stay off until the visitor allows them, and stay off when the workflow is disabled. The banner gives Accept All, Reject All and Customize equal weight, the settings dialog has a switch per optional category, and the footer's **Privacy settings** link reopens it. A browser's Global Privacy Control signal counts as a decline.
- Hosted video, maps and embeds wait for external-media approval, provider URLs are limited to known embed paths, and YouTube uses Privacy Enhanced Mode.
- A default privacy policy at `src/content/pages/privacy.md`, a plain markdown page to rewrite for your site, and a Plausible analytics integration.

#### A reference site for every component

- Every component gets its own documentation page automatically, with a live example, a table of its options and a YAML snippet you can paste into a page. Longer notes and extra examples can be added on top, and a gallery at `/component-docs/` browses the whole library.
- Preview thumbnails for every component in CloudCannon's Add menu, in light and dark.
- The component catalog has a guide to choosing between Grid, Stack, Card Grid, Bento Box and Masonry, and authoring recipes for integration directories, trust metrics and product comparisons.

#### Being found: search, feeds and sharing

- Site search in the navigation bar: a button or Cmd/Ctrl+K opens a modal with results as you type, filters for pages and posts, and thumbnails. Turn it on with `search: true` in the main navigation data. It replaces the old `/search/` page and works locally after `npm run build` (`npm run search:dev` carries the index into `npm run dev`).
- An RSS feed at `/rss.xml`, linked from every page.
- `llms.txt` is generated at build time from the content collections, skipping `noindex` pages.
- Pages and posts carry structured data (title, author, date, tags, breadcrumb trail), and search engines may show large image previews and full snippets.
- Share cards are drawn at build time for every page and post, using the site's logo, fonts and colours, with the entry's own image as the background when it has one. **Share card generation** and **Share card theme** in `seo.json` scope and theme them, and **Share image** sets the site-wide fallback.

#### Tools that catch mistakes before you ship

Most of these catch problems that used to build cleanly while leaving the site
quietly broken in the editor.

- `npm run lint:cms` checks the editor configuration and page content against the components: renamed or missing props, missing files, and scripted components that would be dead in the editor.
- `npm run lint:roots` fails on prop-driven attributes on a component's root element, which go stale when the editor re-renders.
- `npm run lint:schema` checks the editor configuration against CloudCannon's own schema.
- `npm run lint:css-vars` checks that every design token you use exists. A mistyped token fails silently otherwise.
- `npm run icons:sync` and `icons:check` keep the icon picker in step with the icon files.
- `npm run previews:check` catches a missing or stale preview thumbnail, and `npm run previews:montage` renders them all on one sheet.
- `npm run docs:check` checks the documentation against the components.
- Tests: `test:unit`, `test:render` (every component builds), `test:smoke` (a real browser over the built site) and `test:css-parity` (per-page CSS pruning changes no computed style).
- `npm run check:quick` runs the three fastest, most useful checks while you work. `npm run check` is what a finished change has to pass.
- `npm run editor` serves the real CloudCannon editor locally against `dist/`, and `npm run new:component` scaffolds a new component.
- A build fails if two components share a filename, since MDX addresses components by bare filename.
- VS Code autocomplete for the CloudCannon config and the design tokens.
- CI runs every check, including CSS parity and a blocking `npm audit`. Actions are pinned to commit SHAs, the workflow token is read-only, and Dependabot opens grouped weekly updates.

#### New page sections

- **Page Header:** a slim title block for inner pages, with an optional eyebrow, intro and a breadcrumb trail from the URL.
- **Stats:** a row of count-up numbers with labels.
- **Steps Section** and **Timeline Section:** full-width versions of the new Steps and Timeline blocks.
- **Logo Cloud:** a "trusted by" strip of client logos, optionally greyscale or scrolling as a marquee.
- **Testimonial Wall:** quotes as cards in a masonry layout.
- **Testimonial Bento:** quotes in a bento grid, each with its own size and tone, led by a featured quote.
- **Pricing Tiers:** plan cards with features, a highlighted plan and an optional Monthly/Annual toggle.
- **Pricing Comparison:** a feature-by-feature table comparing plans.
- **Contact Split:** contact details beside a form, with an optional map.
- **Latest Posts:** the newest blog posts as cards, optionally filtered by tag.
- **Gallery Grid:** a captioned image grid or masonry, with a lightbox that supports keyboard, swipe and pinch-zoom.
- **Card Collection:** a grid of linked cards with optional covers.
- **Newsletter Signup:** an endpoint-agnostic email form that works without JavaScript.

#### New building blocks

- **Card Grid:** the fixed-column or masonry card layout that Card Collection, Latest Posts and Team Grid share.
- **Masonry:** columns of mixed-height items that keep reading order.
- **Stack:** a row or column of different blocks with one even gap.
- **Steps:** a numbered how-it-works sequence, horizontal or vertical.
- **Timeline:** a dated sequence on a rail, as a vertical list, alternating split or horizontal scroll.
- **Scroll Deck:** cards that stack over each other as the page scrolls, with a rail of anchor links.
- **Scroll Stepper:** steps of text beside sticky media that changes as each step scrolls past.
- **Code Block:** syntax-highlighted code in tabs, with line numbers and a copy button.
- **Alert**, **Badge**, **Rating**, **Table** and **Social Links**.

#### New options

- An announcement bar above the navigation on every page, edited in `src/data/announcementBar.json`. A dismissal lasts until the message changes.
- Mega menus in the main navigation: a `megaMenu` on a top-level item renders a full-width panel on desktop and grouped links on mobile.
- Backgrounds on Card, Custom Section and every page section can be a tiled pattern as well as an image or video, and a `mask` fades part of the background into the background colour. Card and Custom Section backgrounds can stay fixed while the page scrolls.
- Video: autoplay, loop, and WebVTT captions for self-hosted video. Video Modal can open from a poster image.
- Form fields take `hint`, `error` and `autocomplete`, and an invalid form explains itself under the field at fault. Form takes a **Method**, a **Honeypot name** and a **Success message**, shown as a success Alert when the page loads with `?success`.
- A **Heading level** control on every page section with a heading, and on Modal.
- `imageBleed` on Feature Split and Hero Split runs the image to the page edge.
- A `spaceBefore` control on every stackable block, for the space above it.
- Carousel: pause-on-hover, a starting slide, a thumbnail indicator and a slide-change event.
- Toggle: an `offLabel` for a two-sided switch ("Monthly [switch] Annual"), and `inputAttributes` for attributes on the input itself.
- Cards can lock their colour scheme against the visitor's theme toggle, as Custom Section already could.
- Image `decorative`, Button `aria-pressed`, Textarea **Rows**, Testimonial **Avatar size**, Hero Split **Rounded image**, and Social Links **Landmark name**.
- h2 and h3 headings get a linkable id from their text.
- Tag pages show a Home › Blog › tag breadcrumb trail.
- Every page has a "Skip to main content" link.
- Warning status colour tokens, and thin and medium border-width tokens.

### Changed

#### Page sections

- **Heads-up:** page sections are grouped by the job they do: heroes, explainers (was features and info-blocks), proof (was social-proof and testimonials), conversion (was CTAs, pricing and contact), collections (was blog, galleries and team), and builders. The group is part of each section's path, so existing pages need a find-and-replace, e.g. `page-sections/ctas/cta-center` becomes `page-sections/conversion/cta-center`. The `@features` import alias is now `@explainers`.
- **Heads-up:** Team Grid's start/center layout option is gone. It now uses Card Grid's layout, and a new Team Grid starts with three people.
- Page-section editing panels put content fields first, with the shared settings (width, padding, colour scheme, background) in a collapsed group.

#### Framework and dependencies

- Upgraded to **Astro 7**, with every dependency on its latest release except `prettier-plugin-astro` (pinned to `1.0.0`, as `1.0.1` never converges under `prettier --check`) and TypeScript (held at 6.x for `@typescript-eslint` and `@astrojs/check`).
- Node `engines` is `^22.12.0 || ^24.0.0 || ^26.0.0`, and `.nvmrc` pins `24.18.0`.
- Icons are built in instead of coming from the unmaintained `astro-icon` package. A mistyped icon name warns instead of failing the build.
- The icon and autocomplete lists are CloudCannon datasets under `.cloudcannon/data/`, which takes `cloudcannon.config.yml` from 951 lines to 216.
- Accessibility, SEO, link and performance checks moved to a separate tool outside this repository. Nothing in this repo or its CI catches accessibility regressions any more.
- Agent instructions live in `.agents/skills/`, copied to `.claude/` for Claude Code.

#### Look and feel

- **Heads-up:** spacing between blocks comes from a flow system: each block type has a default space above it, and first children sit flush. A Spacer now replaces the gap between its neighbours rather than adding to it, so existing Spacer gaps render tighter, and some section headings sit further from their content (48px, was 24px).
- **Heads-up:** light-theme link colours are accessible blues that meet contrast requirements. Dark-theme links are unchanged.
- **Heads-up:** the grey tokens are renamed from `--gray-0…12` to `--gray-50…950`, matching every other colour. The colours are identical, and `npm run lint:css-vars` finds any old names you miss.
- **Heads-up:** the colour palette has a full range for all eight colours. Icon background tints, the green and yellow icon colours, and the dark theme's accent backgrounds shift slightly.
- **Heads-up:** layout breakpoints are standardised on 640px and 768px, so a few layouts change shape at slightly different widths.
- Hardcoded values in component CSS (border widths, media overlay colours, easing) are tokens, so re-skinning each is one edit.
- Secondary buttons use the lighter surface fill, and tertiary buttons show a tint of their text colour on hover.
- Focus outlines are consistent everywhere, and a mouse click no longer leaves one behind.
- Video Modal's close control sits above the player, the player is centred, and clicking the overlay closes it. It defaults to extra-large.
- The sticky main nav casts a subtle shadow once it pins, and publishes its height as `--main-nav-height` for anything else that sticks.
- Blog posts open with a back link, title, subtitle and one line for category, date and author, with a 16:9 image, content in one centred column, and tags at the end. Blog listing headings name the list you're looking at.
- Code in blog posts uses the theme's monospace font, and inline code renders as a subtle pill on any background.
- Fonts are served from your own site instead of fetched from Google at build time.
- The placeholder image is a photo glyph on a warm grey field, so it still reads as a stand-in when cropped.
- Component descriptions, docs overviews and prop comments are shorter and worded consistently, in the component library and the editor.
- Demo content is a small product site (home, why, get started), example pages under `/examples/` and a demo blog, with every page section in use on a real page.
- The README leads with the live demo and screenshots, and documents the tooling and deployment.

#### Performance

- Each page ships only the component CSS its own markup uses, once. Inline CSS is 45% smaller on the homepage and 49% site-wide, and total HTML 39.6% smaller, which takes about 1.2s off first and largest contentful paint on a cold Slow 4G load.

#### Authoring and the editor

- **Heads-up:** Grid takes `columns` (`auto`, or `2` to `6`) instead of `layout`. `minItemWidth` and `maxItemWidth` apply to auto columns only, and `maxItemWidth` now caps item width. Centred, content-sized rows (the old `layout: center`) are Stack's job.
- **Heads-up:** Video Modal groups its props into two structures: `type`, `videoId` and `source` move into `media`, and `triggerStyle` and the button and poster fields move into `trigger`.
- **Heads-up:** Input, Textarea, Select, Date, File Upload and Range share one field shell, so their label, hint and error classes are `form-field-*` instead of per-component classes like `input-hint`.
- **Heads-up:** Range no longer takes `required`, which never did anything. Remove it from any content that sets it.
- **Heads-up:** a List item's text is a `<span class="item-text">` rather than an invalid `<p>`. Nothing renders differently.
- **Heads-up:** Hero Split's root class is `hero-split` (was `hero`).
- The editor shows only the fields that apply: a background shows its chosen type's fields, Video and Video Modal their source's, and a List item its icon colour once it has an icon.
- Every slot is either wide (section content, split, stack, carousel slide, content selector panel), which takes everything, or narrow (card, grid item, modal body, accordion panel, step), which takes content blocks only. `npm run lint:nesting` keeps it consistent.
- A freshly inserted block starts in the same state as a composed one, with plausible copy and working links instead of "Heading text" and an empty button.
- Generated ids come from whatever names the thing they belong to instead of a fresh UUID, so builds are reproducible and ids survive an editor re-render.
- A page title drops the site-name suffix rather than running past the length search engines display.
- Hosted YouTube and Vimeo videos load a click-to-play facade, so the full player is fetched only when someone presses play.
- A linked Card uses a stretched link instead of wrapping its contents, so buttons, forms and links inside it stay clickable.
- Modal behaviour (focus trap, scroll lock) attaches to any popover with `data-modal`, and `.modal-popover` is styling only. `ModalShell` and `Modal` take `sheet={false}` for a custom full-screen overlay.
- Grid's numbered columns respond to their container's width, not the viewport.
- The Text block's toolbar no longer offers `h1`. Use the section's **Heading level** instead.
- Team Grid's supporting copy and the footer's legal text accept markdown, the mobile menu's logo is an image picker, and the main nav and footer logos link home.
- Submit no longer offers a "Disabled" switch.

### Removed

- The Component Builder at `/component-docs/component-builder/`. `npm run new:component` scaffolds a new section instead.
- Unused dependencies (`@astrojs/node`, `ajv`, `jszip`, `shiki`, the `@rollup/rollup-*` pins), `ConsentManager.acceptAnalytics()` and `rejectOptional()`, and the legacy `href` nav-button fallback.

### Fixed

#### Accessibility

- The navigation menus are labelled and keyboard-operable. The hamburger, close button and dropdown arrows had no names, and the main, mobile and footer navigation now have distinct ones.
- Enter and Space open navigation submenus and side nav groups, desktop dropdowns close when you tab out, and the open mobile menu traps focus and makes the page behind it `inert`.
- Small icon-only controls (mobile menu, carousel arrows, theme toggle) have a 44px tap area.
- Modals hold focus while open, including on embedded players, announce themselves as dialogs, and return focus to the control that opened them.
- Carousels and image carousels announce themselves as carousels, a self-advancing carousel has a Pause control and stops while focused (WCAG 2.2.2), and its indicator dots are keyboard-operable buttons.
- Reduced-motion support covers modal and accordion animations, carousel autoplay, counters and autoplaying video.
- Segments can be operated from the keyboard, and a Toggle is announced as a switch and shows a focus ring.
- Choice Group and Segments mark the group required, not the first checkbox.
- A required field's asterisk is hidden from screen readers, and a field with no label falls back to its placeholder or name for its accessible name.
- Pagination's current page is marked, and is never trimmed out of the visible window.
- Focus rings, control borders and status text colours meet contrast requirements in both themes.
- A Testimonial is a `<figure>` with a `<blockquote>` and `<figcaption>`, and drops empty author rows.
- Content Selector tabs are a named tablist rather than a run of `h3`s, and respond to Enter and Space.
- Range announces its unit with the value ("60 kg").
- Icons are hidden from screen readers, which were announcing thousands of unlabelled graphics.
- The footer's social links are a labelled list, toggles without a visible label fall back to their name, and cards with a background image get a solid backing in case the image fails.

#### Images

- Images offer their own full resolution. Sizes were rounded down to the nearest preset, so a 1181px image only offered 640px and looked soft.
- Full-width section backgrounds loaded blurry in Firefox and Safari.
- Blog listing images drop from 3.7MB to 0.42MB.
- Testimonial author photos fill their circle and ship retina resolutions.
- Images in a section with a locked colour scheme no longer swap to their alternate when the visitor toggles the theme.

#### Forms

- Form renders children passed as slot content. An inverted guard made `<Form><Input /></Form>` render nothing.
- Forms are sent as `multipart/form-data` only when they contain a File Upload.
- Date fields keep their default value and min/max limits.
- Select shows its placeholder instead of preselecting the first option, which satisfied a required Select on load.
- Textarea, Select, Date, File Upload and Toggle no longer emit a duplicate `id` when one is passed in.
- A disabled Input with an icon is styled as disabled.

#### The visual editor

These all built and looked fine, but a field in CloudCannon was missing,
unusable or wrong.

- List fields that showed "not configured", options the editor offered but the component ignored, and options the component supported but the editor never offered, across many components. `lint:cms` now fails on each of these.
- Controls that only appeared after saving (alternate-theme logos, grid alignment) show up on a freshly added block.
- A component whose list was emptied in the editor renders instead of failing the build.
- Following a link inside the Visual Editor does a full page load, so the editor knows which page is open.
- Carousels, modals, tabs, galleries and code blocks work in the component library inside the Visual Editor.
- Content Selector items can be selected and dragged on the canvas, top tabs are centred, and a new tab shows its subtext and icon inputs.
- More is editable on the canvas: Accordion item titles, Content Selector titles and subtext, and a Modal's trigger text.
- A Video Modal with the default button trigger renders something to click, and plays in the editor.
- Passing a `class` to Carousel, Accordion, Footer or a Content Selector panel no longer strips the component's own class.
- A Card with its own colour scheme uses that scheme's text colour instead of the surrounding page's.
- Split and Image Carousel survive the editor's re-render, and Image, List and Range no longer put prop-driven attributes on their root element.
- The add-section menu shows each component's preview thumbnail and correct icon, and uploads go to `src/assets/images`.
- The move handle on the first page section is reachable again.
- A Button's text stays visible when "Hide text" is on, since it is the icon-only button's accessible name.
- The Embed and Icon pickers offer only what the component accepts, and Definition List items have one editable region per field.
- Authoring warnings for an unknown Video type, an Image with no alt text, a hosted video with no title and a Button with no link.
- Production builds no longer link to component-library guide pages that only exist in development.

#### Visual and content

- Nav dropdowns stay inside the viewport, close on a second click of their trigger, and no longer carry an invalid `role="button"`.
- A side nav group holding the current page opens without animating, and an entry with no link renders as text.
- The mobile menu binds its Escape handler once and uses the layer scale instead of `z-index: 9999`.
- The theme toggle shows the right icon inside a dark section.
- A background colour no longer paints over a background video.
- Page sections default to the `base` background, so a dark section without one doesn't leave light text on the page colour.
- Counters animate decimal targets at their own precision and no longer reflow on first paint.
- Testimonial quote marks sit outside the quote, even when it starts or ends with formatting.
- Heading icons have their gap back, and Hero Center's subtext size no longer leaks into Hero Split and Feature Split.
- A Bento Box cell's column span is clamped to the grid's column count.
- Switching examples in the component library no longer jumps the page, and nested content no longer prints `[object Object]`.
- Font weights are tokens, and 19 references to tokens that don't exist are fixed.
- Content blocks with no component set log a warning instead of disappearing.
- An invalid `DISABLE_COMPONENT_LIBRARY` value fails the build.
- Nested page files at `src/content/pages/<section>/index.md` resolve to `/<section>/`.
- Stale documentation and counts are corrected.

### Security

- Live sites send browser security headers and a Content-Security-Policy whose `frame-ancestors` allowlist lets the CloudCannon editor embed the page.
- Breadcrumb and blog JSON-LD escape `<`, so a CMS-authored title can't break out of the structured-data script.
- `npm audit` reports 0 advisories, down from 8 (1 critical, 4 high, 3 moderate).

## [1.0.2] - 2026-04-13

### Added

- Light/dark theme toggle — respects system preference, persists choice to localStorage, and prevents flash of wrong theme on load.
- Astro page transitions using `ClientRouter` with a fade animation for smooth navigation between pages.
- Video Modal wrapper component with autoplay on open, pause on close, and support for YouTube, Vimeo, and local video sources.
- Image Carousel wrapper component with thumbnail navigation.
- `alternateSource` prop on the **Image** component — displays an alternate image when the site theme is toggled, useful for swapping logos or diagrams between light and dark mode.
- `size` prop on the **Text** component (xs through 4xl) — sets the font size of paragraphs and lists; headings retain their own sizing.
- `iconColor` prop on Button, Heading, Input, Select, Submit, and Content Selector components.
- New **Range** form component (`building-blocks/forms/range`).
- List items support an optional `link` URL
- Team Grid exposes a `layout` prop.
- Main site header and footer now include a **Components** link to `/component-docs/`.
- Select component displays a custom chevron-down icon replacing the native browser arrow and supports an optional leading `iconName` prop.
- Split, Bento Box, and Grid components now support `none` as a gap option.
- Blog posts now have tags and an archive of all posts with a given tag.
- All page sections that wrap `CustomSection` now accept the same shell props: `sectionLabel`, `maxContentWidth`, `paddingHorizontal`, `paddingVertical`, `colorScheme`, `backgroundColor`, and `background` (image/video with overlay).
- Button and Card `link` fields support a `^popover-id` convention (e.g. `^modal-my-video`) to open a modal via the native Popover API instead of navigating.
- Video component supports `background` mode for rendering decorative looping background video with autoplay, mute, and `prefers-reduced-motion` handling.
- Custom Section and Card `background` object supports an `overlay` value (−1.0 to 1.0) that renders a semi-transparent lighten/darken layer over the background image or video.
- `maxContentWidth` select on Custom Section and Card now includes a **None** option.
- Carousel supports `indicatorStyle="fraction"` to show a slide counter (e.g. `1/3`) instead of dots.
- Modal wrapper now supports an optional header title shown in the sticky top bar.
- Meta keywords: optional `keywords` string arrays in page and blog post frontmatter; when set, output as `<meta name="keywords">`. CloudCannon inputs and new-page/blog schemas include the field.
- Custom `404` page (`404.html` when built) with CloudCannon hosting routing in `.cloudcannon/routing.json` and `X-Robots-Tag: noindex, nofollow` for the error page URL.
- Anchor links on component doc page headings (Overview, Properties, Slots, Examples, and each example group) for deep-linking to specific sections and examples.
- Toggle option for Navs to allow you to have a link on a node and select children.
- Carousel supports a `gap` prop to set the spacing between slides.

### Changed

- **Breaking:** Renamed the Video component's `id` prop to `videoId` to avoid conflicts with the HTML `id` attribute. The same rename applies to the Video Modal component.
- **Breaking:** Button no longer accepts explicit `popovertarget` / `popovertargetaction` props. Pass them as HTML attributes when using `element="button"`, or use the new `^popover-id` link convention instead.
- **Breaking:** Button's `element` prop no longer defaults to `"a"`. The tag is now inferred: `<a>` when `link` is set, `<button>` otherwise. Pass `element` explicitly to override.
- **Breaking:** Standardized layout prop naming — `alignX` → `alignmentHorizontal`, `verticalAlignment` → `alignmentVertical`, Carousel `align` → `alignmentHorizontal`, Modal `header` → `heading`.
- **Breaking:** Custom Section and Card `backgroundImage` / `backgroundVideo` merged into one `background` object (`type`: `image` | `video`, shared position props, `imageSource` / `imageAlt`, `videoSource`).
- Dropped `lightningcss` as the CSS transformer — reverted to Vite's default (PostCSS + esbuild).
- Switched all component `<style>` blocks to `<style is:global>` and removed all `:global()` wrappers.
- Renamed `building-blocks/forms/slider` component to `building-blocks/forms/toggle`.
- **Embed** component now renders iframes in the visual editor`.
- Updated Twitter references to X.
- Video poster images from `src/assets/images` are now optimized with `getImage`, scaled to fit within 1920×1080.
- CloudCannon image uploads default to `src/assets/images` on the `pages` and `blog` collections.
- Blog Content Editor disables the native image toolbar button; authors add images via the Image snippet.
- FeatureGrid heading/text alignment is now configurable via `alignmentHorizontal` instead of being hardcoded to `center`.
- Blog Pagefind wiring markup for published date, author, article type, and tags.
- CloudCannon field comments and component docs now note that selectable UI icons are sourced from [Heroicons](https://heroicons.com/).
- Lowered minimum Node.js version requirement from 24 to 22.
- Default font provider switched from `fontProviders.google()` to `fontProviders.fontsource()` in `site-fonts.mjs`.
- Logo aspect ratios in main nav stay visually balanced across desktop and mobile states.
- Third-level main nav items now use distinct styling to separate from second-level items.
- Text blocks now trim top margin from their first child and bottom margin from their last child.
- Modal examples now use `custom-section` for inner spacing; the modal wrapper no longer applies default body padding.
- Local video sources now automatically include matching sibling formats (`.webm`, `.ogv`).
- Base layout now renders SEO meta tags directly without relying on the `astro-seo` package.
- Blog posts now render `og:type="article"` plus article-specific Open Graph metadata.
- Component library routes (`/component-docs/*`) are excluded from the generated sitemap and use `<meta name="robots" content="noindex">` so they are not indexed as public site content.
- Heading `iconName` and footer social link `icon` selects now use the visual icon picker (with name and SVG preview) instead of a plain dropdown or text input.
- Image component now prepends `sizes="auto"` for lazy-loaded images.

### Fixed

- Component docs mobile nav logo now matches the main site's logo size and nav bar height.
- **Icon** component background color now wraps tightly around the icon instead of stretching full width.
- **ContentSelector** Astro code generation in docs now works correctly — the content-selector-specific branch runs as intended and adds `checked` to the first `ContentSelectorPanel`.
- Main navigation desktop layout now adds spacing between nav links and the header button group via flex `gap`.
- Component docs Astro code tab now renders all named slots from component metadata as `<Fragment slot="...">` children. Fixes Card Before & After examples.
- CloudCannon `data` collection now sets `disable_url: true` so automatic output URL matching does not assign incorrect preview URLs to non-page data files.
- Carousel indicator dots now use presentational `<div>` elements instead of `<button>`, fixing invalid `aria-selected`.
- Navigation dropdown `<label>` triggers no longer use invalid `role="button"`.
- Modal scrollbar now only applies to the body content, keeping the header fixed outside the scroll area.
- List items with icons now align wrapped text to the text column instead of wrapping under the icon.
- Button now forwards link attributes (`target`, `rel`, etc.) and button attributes (`type`, `disabled`, etc.) to the inner element instead of the wrapper.
- Carousel: `loop={false}` now correctly disables Embla loop.
- Opening a modal now locks page scrolling until the modal is closed.
- Image component now always keeps at least one valid responsive width candidate.
- Structured data no longer emits an empty `description` field when the site SEO description has not been set.
- Blog index and tag archive pagination pages now use unique document titles (append “– Page N” for page 2 and up) instead of repeating the first-page title.
- Content selector mobile views
- Excluded the **Pagination** component from being added to components.
- Carousel now works correctly in the CloudCannon visual editor.

## [1.0.1] - 2026-03-19

### Added

- Reset button in Component Builder that clears all state and returns to the Build tab.
- Bento Box component for asymmetric grid layouts where items can span multiple columns and rows.
- Input component now supports optional leading and trailing icons in ACS.
- Font setup is centralized in `site-fonts.mjs` with `SiteFonts.astro`
- Modal component for dialog overlays, using the Popover API with CSS animations and minimal JS for accessibility.
- Button component now supports `popovertarget` and `popovertargetaction` props, forwarding them to the inner element.

### Changed

- Exported Astro components now use scoped `<style>` instead of `<style is:global>`.
- CSS uses Vite's default pipeline (PostCSS for processing, esbuild for minification) instead of opting into Lightning CSS for transform while minifying with esbuild.
- Raised Vite `chunkSizeWarningLimit` to 1024 kB so builds don't warn on expected large chunks (e.g. Shiki in component docs).

### Fixed

- ComponentViewer Astro code preview now renders child items for BentoBox and Masonry components instead of showing self-closing tags.
- Component Builder sandbox delete button styles: replace Sass-style `&-delete` nesting with a flat `.sandbox-item-btn.sandbox-item-btn-delete` selector so esbuild CSS minify doesn't warn on invalid nesting.
- SVGO icon optimization: use `cleanupIds` override (SVGO 4 plugin name) so disabling ID cleanup no longer prints a preset warning at build time.
- Bento Box item column/row span changes now update visually in the CloudCannon editor.
- Icon component no longer exposes an unsupported `4xl` size option.
- Image component no longer converts SVGs to WebP — SVGs are now served as-is.
- Button component no longer relies on `display: contents` on its root wrapper.
- Definition list items no longer rely on `display: contents` on their root wrapper.
- Content selector items now use camelCase `iconName` and `subtext` fields for optional icons and supporting text.
- Heading icons now stay inline with heading text so titles wrap naturally after the icon.
- Heading icons now render at `0.9em` to better match heading text sizing.
- Content selector tabs now keep `aria-selected` and panel `aria-hidden` in sync as panels are switched.
- Content selector top navigation now shows a subtle muted underline on inactive items to match the start navigation style.
- Side navigation now shows the active link underline when `aria-current="page"` is set.
- Fix case where List doesn't work when using slot
