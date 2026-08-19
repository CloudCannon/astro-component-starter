# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Card Grid wrapper (`building-blocks/wrappers/card-grid`) — an exact-column (or masonry) row of open cards: cover, optional tile link, and a `contentSections` body. Nested links (a category badge) stay their own targets. 2–4 columns. Not Grid's auto-fit — that stays for Feature Grid, Pricing Tiers, and freeform Grids.
- Badge component (`building-blocks/core-elements/badge`) — a pill label for statuses, tags, and announcements. Eight variants (the six status tones plus a theme-aware Plain for imagery and a filled Accent), three sizes, an icon or status-dot prefix, and an optional link that renders the badge as an anchor with a hover state and, by default, a trailing arrow (`showArrow` to hide it).
- Warning status color tokens (`--color-warning`, `--color-warning-bg-subtle`, `--color-warning-border-subtle`) and the previously missing `--color-success-border-subtle`, in both light and dark themes.
- Pricing Tiers section (`page-sections/conversion/pricing-tiers`) — plan cards with feature checklists (included and excluded rows), per-card call-to-action, and an optional highlighted tier with a "Most popular" badge.
- Logo Cloud section (`page-sections/proof/logo-cloud`) — a "trusted by" strip of client logos, height-aligned and optionally grayscale. Linked logos restore color on hover in grayscale, or scale up slightly in full color. Plus six placeholder logo assets.
- Stats section (`page-sections/explainers/stats`) — a row of big count-up numbers (via Counter) with uppercase labels, optional sublabels, and divider rules that rotate when the row stacks on mobile.
- Steps wrapper (`building-blocks/wrappers/steps`) — a numbered how-it-works sequence. Each step owns its own rail segment (a column connector or a left border that stops at the last marker). Horizontal reading order is image → number → words; vertical puts the image beside the words. Featured images share one crop. Markers are ordinal numbers as real text.
- Steps section (`page-sections/explainers/steps`) — heading chrome around the Steps wrapper for a full-width "how it works" block.
- Timeline wrapper (`building-blocks/wrappers/timeline`) — a dated sequence on a rail. Dates sit in their own column beside a small rail dot. Vertical entries share one continuous rail that stops at the last marker; horizontal scrolls and fades at the tail. Consecutive entries with the same year group under that year.
- Timeline section (`page-sections/explainers/timeline`) — heading chrome around the Timeline wrapper.
- Border width tokens (`--border-width-sm`, `--border-width-md`) for shared rail and emphasis strokes.
- Contact Split section (`page-sections/conversion/contact-split`) — contact details (address, phone, email, hours, each with an icon and optional tel:/mailto: link) beside a form built from the existing form blocks, in a bordered card with an optional map-embed strip.
- Table component (`building-blocks/core-elements/table`) — a content table with caption, header row, row headers, and striped/compact variants. Ragged rows render empty cells instead of collapsing, and on small screens the table pans horizontally with a pinned first column, an edge fade, and a scroll hint.
- Alert component (`building-blocks/core-elements/alert`) — a status callout with info/success/warning/danger/note variants, default per-variant icons, an optional title, and a markdown body. Insertable into blog posts as an MDX snippet. Warning and danger variants announce themselves to screen readers.
- Rating component (`building-blocks/core-elements/rating`) — a CSS-only star rating with half-star support, small/medium sizes, an optional numeric label, and a filled-star color option using the same palette as Icon. Read as a single value by screen readers.
- Social Links component (`building-blocks/core-elements/social-links`) — a row of social icon links in ghost or solid-brand style, using the same data shape as the footer's socials.
- Latest Posts section (`page-sections/collections/latest-posts`) — the newest blog posts as cards (cover, tag badge, linked title, date and author, excerpt) with an optional tag filter and view-all button. Posts are pulled at build time; the Visual Editor shows placeholder cards.
- Gallery Grid section (`page-sections/collections/gallery-grid`) — an image grid with captions, 2–5 columns, an adjustable tile gap, a Grid layout (square/landscape crops) or an order-preserving Masonry layout sharing the Masonry wrapper's technique, and a lightbox bound to the photograph: counter, close, arrows and caption sit inside the photo's rectangle over a gradient scrim, on a near-opaque backdrop. Arrow keys and swipe step (wrapping) with a short crossfade, Escape or a backdrop click closes, and focus returns to the clicked tile.
- Pricing Comparison section (`page-sections/conversion/pricing-comparison`) — the feature-by-feature table that complements Pricing Tiers' cards. Plans become columns (a highlighted plan gets the primary call to action), each feature row takes one value per plan (`yes`/`no` for a tick or dash, or free text like "5 seats"), and each plan can carry its own call to action. Optional zebra striping is a single transparent gray on even rows only. Pans horizontally with the feature column pinned on small screens.
- Video Modal can be opened from a poster image with a play disc (`triggerStyle: poster`) instead of a button — the treatment hero and feature media usually want.
- Page Header section (`page-sections/heroes/page-header`) — the slim title block interior pages open with: an `h1`, an optional eyebrow and intro line, start or center alignment, and optional breadcrumbs derived from the page's own URL (nested paths become linked ancestors; the trail is hidden on the home page). Breadcrumbs are no longer blog-only.
- Card Collection section (`page-sections/collections/card-collection`) — a grid of linked cards with optional covers and an open `contentSections` body, so a badge, date, author, or anything else is just another building block. Grid or masonry layout, 2–4 columns. Set `link` to make the tile clickable; nested links (a category badge) stay their own targets. Cards work without images too.
- Testimonial Wall section (`page-sections/proof/testimonial-wall`) — several customer quotes at once as cards in a masonry wall, so uneven quote lengths pack tightly while reading order is preserved. Each card is the existing Testimonial block (markdown quotes, headshot with initials fallback), 2–4 columns.
- Logo Cloud can scroll: switch on `scrolling` for a continuous marquee of logos, built on Carousel's auto-scroll. Visitors who prefer reduced motion see a still strip.
- Masonry wrapper (`building-blocks/wrappers/masonry`) — a Pinterest-style column layout for mixed-height content that keeps reading order (items flow left-to-right into the shortest column). Falls back to CSS columns without JavaScript and hands over to native CSS masonry where browsers support it. 2–5 columns, the Grid gap scale, and Grid-style items that hold any content blocks.
- Component-docs examples for every new component, showing each one's prop variations inline like the rest of the library.
- An internal Avatar utility (initials fallback, three sizes) now renders Testimonial's author headshot.
- Blog posts show an "On this page" table of contents by default (`showToc` in the post's frontmatter, on unless turned off) — a sticky sidebar with scroll-spy highlighting beside the article on wide screens, and a collapsed disclosure above it on small ones. Demo posts include headings so the sidebar has something to list.

### Changed

- Blog post pages open with a back link, then the title, subtitle, and one muted meta line (category, date, author). The category is plain text that links to its tag archive. The hero image is 16:9. Tags sit at the end of the article as badges, not in the header.
- Card Collection, Latest Posts, and Team Grid now compose the Card Grid wrapper for layout and the card itself. Card Collection keeps curated `items`; Latest Posts still fetches posts; Team Grid still authors `name` / `role` / `bio` as fields. Team Grid's `layout: start | center` is gone — exact columns don't need it.
- Card Collection cards now take open `contentSections` instead of fixed badge/title/description fields. Latest Posts feeds that same card (cover, tag badge linked to the archive, title, date and author, excerpt) so a date is just another block, not a second card design.
- Video Modal's close now sits above the player on a dark overlay. The previous sheet put the control on the video, where a YouTube or Vimeo iframe covered it.
- Carousel gained a `startIndex`, a `carousel:select` event, and a `thumbnails` indicator style — useful for product galleries and any consumer that needs to sync chrome to the selected snap.
- Page-section editing panels now group inputs: content fields come first, and the shared shell settings (section label, width, padding, color scheme, background) sit below in a collapsed "Section settings" group. Data files are unchanged — this only reorders the editor. New sections scaffold with the groups included, and `npm run lint:cms` fails if a prop is missing from the groups (it would otherwise land wherever the editor defaults ungrouped inputs).
- **Heads-up:** page sections are reorganized into six categories named for the job a section does on a page: `heroes`, `explainers` (was features + info-blocks), `proof` (was social-proof + testimonials from people), `conversion` (was ctas + pricing + contact), `collections` (was blog + galleries + team-grid from people), and `builders`. The category is part of each section's `_component` path, so **existing content needs a find-and-replace** — e.g. `page-sections/ctas/cta-center` → `page-sections/conversion/cta-center`, `page-sections/features/feature-grid` → `page-sections/explainers/feature-grid`. Component docs URLs move the same way. The `@features` import alias is now `@explainers`.

### Fixed

- CloudCannon structure picker cards now show the component preview SVG. The wired `image:` path was a site URL (`/component-previews/...`) that does not exist in the source tree; CloudCannon looks up files the same way as the icon picker (`src/icons/{id}.svg`), so the path is now `public/component-previews/...`, and it is also set on `gallery.image` for the large card slot.
- The footer no longer trips CloudCannon's "Failed to render array editable" error. Social Links was always stamping `data-prop="links"`; on a page that key is undefined (the footer's socials live in `footer.json` as `socials`). The array binding now follows the same opt-in as List and ButtonGroup, and the footer turns it off like the rest of its chrome.
- The blog table of contents no longer slides under the sticky nav — "On this page" stays visible while you scroll.
- The move/reorder controls on the first page section in the Visual Editor are reachable again. The whole `pageSections` list was wrapped in a second editable region whose controls pinned to the same top-right corner as the first section's, covering its drag handle. The wrapper was redundant — the array region already stamps each section as its own re-rendering component via `data-component-key` — so it has been removed and the array now binds straight to `pageSections`.
- Small icon-only controls now meet the 44px minimum tap target: icon-only buttons (the mobile menu and search buttons at 35px, carousel arrows at 28px), the light/dark theme toggle (27px), and the announcement bar's dismiss button (20px) were all awkward to hit on a phone and failed WCAG 2.5.8. The tap area is an invisible overlay, so nothing looks bigger — carousel arrows are still small discs, just no longer fiddly to hit. New controls can opt in with the `tap-target` utility class.
- The footer's social row is now the Social Links component rather than its own copy of the markup, so it announces itself as a labelled list to screen readers. Its icons pick up that component's quieter muted styling.
- The icon picker now shows brand marks with their real names — `Social/GitHub`, `Social/LinkedIn`, `Social/TikTok` instead of `Social/github` and friends. The `Social/` prefix stays, so filtering the picker by "social" still pulls up the whole set.
- Passing a `class` to the Carousel wrapper no longer drops its own `carousel` class, which silently disabled both its styling and its JavaScript setup.
- Video Modal no longer emits a stray `header` attribute on its wrapper element (it was passing a prop the Modal wrapper doesn't have).
- Counter now animates decimal targets at their own precision — a target of `99.95` used to be floored to `99` mid-animation and at rest.
- Testimonial author avatars were clipped — the shared Image block's content margin and auto height sat inside Avatar's overflow-hidden circle, so the headshot was shifted and cropped. The circle now fills edge to edge. The srcset was also a single ~88px variant (Image's 640/1280/2560 steps all sit above that width and were dropped), so the headshot looked soft on retina; it now ships 1x/2x/3x of the displayed size.
- Switching examples in the component-docs viewer no longer jumps the page. Variants are stacked in one frame sized to the tallest, so changing the select does not grow or shrink the document.
- Logo Cloud's placeholder logos are now colored, so the full-color docs example is actually visible.
- The component-docs Astro preview no longer prints `contentSections="[object Object]"` for item wrappers. Nested `_component` trees always render as JSX children, and a layout branch that maps a computed grouping (Timeline's year groups) no longer hides the real `entries`/`items` slot — so current and future wrappers get the same `<StepsItem>` / `<TimelineItem>` preview without a per-component override.

## [2.0.0] - 2026-08-11

A big release: a browsable reference site for every component, site-wide
search, new components and options, tooling that catches editor problems
before they ship, and a long list of accessibility fixes. If you have already built a site on this starter,
read the **Heads-up** items under Changed before upgrading — a few change how
things look.

### Added

#### Making the starter your own

- `npm run reset:starter` clears the demo posts, pages, logos and navigation out of a fresh copy, and sets your site name and URL. `--dry-run` shows the plan first, and it only runs on a clean git tree so you can always undo it.
- `npm run check:placeholders` warns when starter placeholders are still in place — most importantly the `example.com` URL, which otherwise ships and tells Google your site lives at a domain you don't own.
- A deployment guide at `docs/DEPLOYMENT.md` for getting the site live on CloudCannon.
- A `LICENSE` file. The README and `package.json` both said MIT, but the licence text itself was missing.
- Guides for people and AI agents working on the project: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and `docs/ARCHITECTURE.md`.

#### A reference site for every component

- Every component gets its own documentation page automatically, with a live example and a table of its options. You can still add longer notes and extra examples on top.
- A gallery at `/component-docs/` for browsing the whole library.
- Preview thumbnails for every component, so CloudCannon's "add section" menu shows you what you are picking instead of a list of names.

#### Being found: search, feeds and sharing

- Site search lives in the navigation bar: a search button — or Cmd/Ctrl+K — opens a modal with results as you type, filters for pages and blog posts, and article thumbnails. Turn it on with `search: true` in the main navigation data. It replaces the old `/search/` page, and follows the theme toggle like everything else.
- An RSS feed at `/rss.xml`, linked from every page so feed readers find it on their own.
- Blog posts and pages now describe themselves to search engines — title, author, date, tags — so posts can qualify for richer search results.
- Social share cards, so links posted to X and similar show a proper preview image and title.
- Search engines are told they may show large image previews and full-length snippets, which they otherwise cut short.

#### Tools that catch mistakes before you ship

Most of these catch problems that used to build cleanly and look fine, while
leaving the site quietly broken in the editor.

- `npm run lint:cms` checks the visual editor setup against the actual components — a renamed option, a field that would never show up on a new block, a missing file.
- `npm run lint:schema` checks the editor configuration against CloudCannon's own rules, catching invalid settings and wrong icon names.
- `npm run lint:css-vars` checks that every design token you use actually exists. A mistyped token name is silently ignored, so it never looks like an error.
- `npm run icons:sync` and `npm run icons:check` keep the icon picker in step with the icon files, a list that was previously maintained by hand.
- `npm run previews:check` catches a missing or stale preview thumbnail, and `npm run previews:montage` renders them all onto one sheet for review.
- `npm run docs:check` checks the documentation against the components it documents.
- `npm run typecheck` and `npm run test:unit` cover types and the shared helper code.
- `npm run test:smoke` drives a real browser over the built site to confirm the accordion, modal, carousel, mobile menu, theme toggle and search all still work.
- `npm run test:render` builds a page containing every component, so one that stops rendering fails the build.
- `npm run new:component` scaffolds a new component's files and tells you the remaining steps.
- Editor autocomplete in VS Code for both the CloudCannon config and the design tokens.

#### New components and options

- An announcement bar shown above the navigation on every page, driven by `src/data/announcementBar.json` and editable in CloudCannon under Data. Write the message in Markdown, with a link for an optional call to action; closing the bar hides it for that visitor until the message changes, so a new announcement brings it back for everyone.
- Blog posts and tag pages show a breadcrumb trail above the title — Home › Blog › the page you are on. The Home label is editable in CloudCannon under Data, long titles are shortened to keep the trail on one line, and small screens swap the trail for a single link back to the blog. Search engines are given the trail as structured data, so results can show where a page sits in the site. Tag pages used to have a plain "All posts" link; the breadcrumb replaces it.
- Backgrounds can be a repeating tiled pattern as well as an image or video, on Card, Custom Section and every page section. Pick the tile with the usual image picker and choose a tile size; the overlay and background colour still apply, so patterns with transparency show the background colour through.
- The Video component gained autoplay and loop options for all three source types. Autoplayed video starts muted, since browsers refuse it otherwise, and YouTube and Vimeo players now load when scrolled into view instead of with the page.
- Form fields take a `hint` for help text under the field, and an `error` for validation messages.
- Card and Custom Section backgrounds can stay fixed while the page scrolls, falling back to a normal background for anyone who prefers reduced motion.
- Carousel gained `pauseOnHover`, Image gained `decorative` for images screen readers should skip, and Button passes `aria-pressed` through so it can act as a toggle button.
- Cards can pin their colour scheme against the visitor's theme toggle, as Custom Section already could.

### Changed

#### Framework and dependencies

- Upgraded to **Astro 7**, with every other dependency refreshed. Node 22.12 or later is now required, and there are no known security advisories against the dependency tree.
- Icons are built into the project instead of coming from the `astro-icon` package, which has been unmaintained for well over a year and was written for an older Astro. Icons look and behave the same, and a mistyped icon name now warns you while you work instead of failing the build.
- Accessibility, SEO, link and performance checking now happens with a separate tool outside this repository, so the partial version that lived here has been removed. Nothing in the project or its CI catches accessibility regressions any more.
- Agent instructions live in one place (`.agents/skills/`) and are copied automatically to the Cursor and Claude folders.

#### Search

- Site search now works locally: `npm run build` creates the search index, so `npm run preview` gives you working search, and `npm run search:dev` carries the index over to `npm run dev`. Previously search only ever worked once deployed, and found nothing locally with nothing to explain why.

#### Look and feel

- **Heads-up:** light-theme link colours changed. The placeholder pure blues are now accessible blues that meet contrast requirements. Dark-theme links are unchanged.
- **Heads-up:** the grey design tokens were renamed from `--gray-0…12` to `--gray-50…950`, matching every other colour. The colours themselves are identical — only the names changed, so a brand's grey scale can be pasted straight in. `npm run lint:css-vars` finds any old names you miss.
- **Heads-up:** the colour palette is now complete, with a full range for all eight colours. Most things look the same; what shifts is the icon background tints, the green and yellow icon colours, and the dark theme's accent section backgrounds.
- **Heads-up:** layout breakpoints are standardised on 640px and 768px. Three components had their own values nearby, so a few layouts now change shape at slightly different widths.
- Focus outlines are consistent everywhere, and clicking with a mouse no longer leaves one behind.
- Fonts are served from your own site rather than fetched from Google at build time.
- Code in blog posts uses the theme's monospaced font instead of whatever the browser picked.
- Blog listing headings say which list you are looking at. Every tag page and every page of the blog said "All posts".
- Component preview thumbnails were all redrawn to look like one family, and they follow light or dark mode.
- The README leads with the live demo and screenshots, and documents the tooling, the scaffolder and deployment. It also gives one Node version instead of the three different answers it used to.

### Fixed

#### Accessibility

- The navigation menus are properly labelled and keyboard-operable. The hamburger, the close button and every dropdown arrow were announced to screen readers as unlabelled, on every page. The menus still work in the CloudCannon editor.
- The main, mobile and footer navigation now have distinct names, instead of appearing to a screen reader as three identical "navigation" areas.
- The asterisk marking a required field read out as "star" and nothing else. It is hidden from screen readers now; the field itself already says it is required.
- Pagination's current-page marker read out as a bare number with no context.
- Modals hold keyboard focus while open and return it to whatever opened them on close, and they work inside the visual editor.
- Segments could not be operated from the keyboard at all — its hidden inputs are now focusable, the same way Toggle's are.
- Icons are hidden from screen readers, which were announcing thousands of them across the site as unlabelled graphics.
- Reduced-motion support now also covers modal and accordion animations, and stops carousels auto-playing.
- Smaller fixes: the content selector is a proper set of expandable panels, toggles without a visible label fall back to their name, cards with a background image get a solid backing so text stays readable if the image fails, and footer social links accept a custom label.

#### Images

- Images now offer their own full resolution. Sizes were rounded down to the nearest preset, so a 1181px image only ever offered a 640px version and looked soft. Cropped images were worst affected.
- Full-width section backgrounds loaded blurry in Firefox and Safari.
- Blog listing images were far heavier than they needed to be — 3.7MB of images for cards a few hundred pixels wide, now 0.42MB.

#### The visual editor

These all shared one symptom: the site built and looked fine, but a field in
CloudCannon was missing, unusable or wrong.

- Fields for adding a list of items showed "not configured" and could not be edited. Main Nav's buttons were the last case; `lint:cms` now fails on the whole class of mistake.
- Options that existed in the editor but the component ignored, and options the component supported but the editor never offered, across a long list of components.
- Controls that only appeared after you saved — alternate-theme logos, grid alignment, team grid layout — now show up on a freshly added block.
- The "Fixed background (parallax)" toggle was missing from the eleven page sections that pass background options through, even though Custom Section and Card offered it.
- Uploaded images and files were going to the wrong folder instead of `src/assets/images`.
- 31 wrong icon names across 15 files meant the "add section" menu showed the wrong icon.
- Navigation and footer item definitions were duplicated across four components in three different versions.
- Some component documentation pages showed a blank code sample.

#### Visual and content

- Heading icons sat flush against their text; the gap is back.
- A background colour set alongside a background video painted over the video, hiding it completely.
- The docs' "accepted values" chips and the Component Builder's fields rendered on a heavy grey slab with no padding.
- Font weights are all tokens now, so changing the weight scale in a rebrand reaches everything.
- Fixed 19 references to design tokens that do not exist, across the mobile menu, top bar, blog listing, content selector and team grid. A mistyped token name is silently ignored, so none of these looked like errors.
- Removed a duplicate Medium icon that would have shown up as a second, black-rendering option.
- Content blocks with no component set now log a warning instead of silently disappearing.
- Production builds fail loudly on an invalid `DISABLE_COMPONENT_LIBRARY` value, and say whether the library was included.

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
