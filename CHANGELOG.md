# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Mega menu support in the main navigation: a top-level `navData` item can carry a `megaMenu` object — columns of icon + description links plus an optional feature card — rendered as a full-width panel on desktop and flattened into grouped links in the mobile menu. Editable in CloudCannon via the new "Mega Menu Item" structure, offered on `mainNav.json` and on the Main Nav and Bar components. The Side and Mobile components don't offer it, because neither opens a panel of its own.
- Stack wrapper (`building-blocks/wrappers/stack`): a row or column of mixed blocks with one even gap, with direction, gap, distribution, alignment, wrap, and stack-on-mobile controls.
- A `spaceBefore` input (`none`/`tight`/`default`/`loose`) on every stackable building block, backed by four new `--space-before-*` tokens, for overriding the space above a block without Spacers or custom CSS.

### Changed

- Component docs collapse a property's child properties behind a disclosure showing how many there are, so a prop tree several levels deep (a nav item's `megaMenu`, its columns, their links) no longer buries the component's own props. Arrays offering more than one item type list each type as its own disclosure.
- Stack and Grid describe themselves in contrast, so the choice between them is clear at the point you make it: Stack is "a few different blocks in a row or column, one even gap", Grid is "many items of the same kind, in as many columns as fit". Both docs pages now point at the other, and the component catalog gains a short guide to choosing between Grid, Stack, Card Grid, Bento Box, and Masonry.
- **Heads-up:** Grid now takes `columns` (`auto`, or `2`–`6` — same lattice and mobile collapse as Card Grid) instead of `layout`; `minItemWidth`/`maxItemWidth` apply to auto columns only, and `maxItemWidth` now actually caps item width. Centered content-sized rows — the old `layout: center` — are Stack's job now.
- Grid's numbered columns and Stack's stack-on-mobile respond to their container's width, not the viewport, so both collapse correctly inside a narrow pane on a wide screen.
- Spacing between blocks is now the flow system: each block type carries a default space-before (headings loose, text tight, collection wrappers loose) and first children sit flush automatically. Building blocks no longer carry a hidden top margin, and the per-wrapper first-child margin strips are gone.
- A Spacer now _replaces_ the gap between its neighbours — its size is the whole gap — instead of adding to a hidden margin, so existing Spacer gaps render tighter than before.
- Components embedded in blog post bodies space themselves against the surrounding prose instead of relying on a fixed top margin.
- Demo content is a small product site for the starter — home, why, and get started — plus labeled example pages under `/examples/` (pricing, about, services, portfolio, contact) and a demo blog. The homepage leads with the developer/editor split, uses the 2.0 sections (stats, steps) instead of stacking four feature-splits, and drops the fake-company logo cloud (it lives on the services example instead); every page section now appears in use on a real page.
- Homepage stats and principles sections use a fine dot-lattice background pattern (`pattern-dot-grid.svg`) that fades behind the content. The closing CTA sits on a blueprint-style grid with plus marks at the intersections (`pattern-grid.svg`) instead of the hero's scattered plusses, which read as noise on the dark background.
- Example pages (index, pricing, about, services, portfolio) open on their real first section instead of an “Example / copy this as a starting point” page header.
- Feature-grid cards put the icon on the same line as the title, instead of stacked above it.
- Contact is an example page (`/examples/contact/`) instead of a product page in the footer, so the footer links stay on one line.
- The sticky main nav casts a subtle shadow once it pins, so it separates from the content sliding under it. Works in every browser, including the CloudCannon editor; without JavaScript the nav simply has no shadow.
- Section backgrounds take a `mask` option — a fade named by which part of the media fades out (top, bottom, left, right, the middle, the edges, or top and bottom together). The faded part reveals the background color token, so a directional fade on a photo or video acts as a theme-correct scrim with no hardcoded gradient. Patterns default to fading the middle, so texture never sits behind the content; images and video default to no fade.
- Secondary buttons use the lighter surface fill instead of muted gray, so they sit closer to the page background. Hover still steps to muted.
- Inline code in markdown text renders as a subtle rounded pill that darkens the surrounding background in light mode and lightens it in dark mode, so it stays visible on accent, highlight, and surface sections as well as the page background. Snippets that wrap keep the pill on every line, and table cells get the same treatment.

### Fixed

- Counters with a target of 0 count down instead of sitting still (the homepage “0 KB” runtime stat was the visible case).
- Headings no longer crash the CloudCannon Visual Editor (`Astro.locals.headingIds` is missing when a component is re-rendered there).
- Nested page files at `src/content/pages/<section>/index.md` resolve to `/<section>/`.
- Blog posts with an "On this page" sidebar keep the extra-wide images, code blocks, and CTAs in the article. The sidebar has its own column, starts below the post image, and sticks as you scroll; the page grows a step wider so those components still have room to break out of the text measure.

## [2.0.0] - 2026-08-19

A big release: a browsable reference site for every component, site-wide
search, a much larger library of page sections and building blocks, tooling
that catches editor problems before they ship, and a long list of
accessibility fixes. If you have already built a site on this starter, read
the **Heads-up** items under Changed before upgrading — several change how
things look, and every page section moves to a new path.

### Added

#### Making the starter your own

- `npm run reset:starter` clears the demo posts, pages, logos and navigation out of a fresh copy, and sets your site name and URL. `--dry-run` shows the plan first, and it only runs on a clean git tree so you can always undo it.
- `npm run check:placeholders` warns when starter placeholders are still in place — most importantly the `example.com` URL, which otherwise ships and tells Google your site lives at a domain you don't own.
- A deployment guide at `docs/DEPLOYMENT.md` for getting the site live on CloudCannon.
- Live sites send the usual browser security headers (HTTPS-only, no embedding on other sites, a tight referrer policy) and still allow the CloudCannon visual editor to embed the page. A per-request script nonce is not included, because a static build cannot mint a new one on every load.
- A `LICENSE` file. The README and `package.json` both said MIT, but the licence text itself was missing.
- Guides for people and AI agents working on the project: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and `docs/ARCHITECTURE.md`.

#### A reference site for every component

- Every component gets its own documentation page automatically, with a live example and a table of its options. You can still add longer notes and extra examples on top.
- A gallery at `/component-docs/` for browsing the whole library.
- Preview thumbnails for every component, so CloudCannon's "add section" menu shows you what you are picking instead of a list of names.

#### Being found: search, feeds and sharing

- Site search lives in the navigation bar: a search button — or Cmd/Ctrl+K — opens a modal with results as you type, filters for pages and blog posts, and article thumbnails. Turn it on with `search: true` in the main navigation data. It replaces the old `/search/` page, and follows the theme toggle like everything else.
- An RSS feed at `/rss.xml`, linked from every page so feed readers find it on their own.
- An `llms.txt` file at the site root listing the pages worth citing, so AI crawlers have a curated index.
- Blog posts and pages now describe themselves to search engines — title, author, date, tags — so posts can qualify for richer search results. Posts also include a Home › Blog › title trail as structured data, even though the visible chrome is a back link.
- Social share cards, so links posted to X and similar show a proper preview image and title. Share images include size and alt text; local photos are cropped to the 1200×630 frame social platforms actually show, and the site logo still fills in when a page has no image of its own.
- Search engines are told they may show large image previews and full-length snippets, which they otherwise cut short.

#### Tools that catch mistakes before you ship

Most of these catch problems that used to build cleanly and look fine, while
leaving the site quietly broken in the editor.

- `npm run lint:cms` checks the visual editor setup against the actual components — a renamed option, a field that would never show up on a new block, a missing file, or a page-section option left out of the content / section-settings groups.
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

#### New page sections

- Page Header — the slim title block interior pages open with: a heading, optional eyebrow and intro, and a breadcrumb trail taken from the URL. Nested pages link to their parents; the home page hides the trail. Breadcrumbs are no longer blog-only.
- Stats — a row of large count-up numbers with labels, optional extra lines, and dividers that turn into rules when the row stacks.
- Steps — a numbered how-it-works sequence, as a full-width section or as a building block you can drop inside something else. Each step has its own stretch of the connecting line, which stops at the last marker.
- Timeline — a dated sequence on a rail, as a section or a building block. Matching years group together. Vertical entries share one line; horizontal ones scroll.
- Logo Cloud — a "trusted by" strip of client logos, height-matched and optionally grey. Linked logos restore colour on hover, or scale up slightly in full colour. Can also scroll as a continuous marquee; visitors who prefer reduced motion see a still strip. Ships with six placeholder logos.
- Testimonial Wall — several quotes at once as cards in a masonry layout, so uneven lengths pack tightly while reading order stays left-to-right.
- Pricing Tiers — plan cards with included and excluded features, a call to action on each, an optional highlighted "Most popular" plan, and an optional monthly/annual switch.
- Pricing Comparison — the feature-by-feature table that sits next to those cards. Plans are columns, each feature is a tick, a dash, or a short note, and a highlighted plan gets the primary button.
- Contact Split — contact details (address, phone, email, hours) beside a form, with an optional map.
- Latest Posts — the newest blog posts as cards, with an optional tag filter and a view-all button. Posts are chosen at build time; the visual editor shows placeholders.
- Gallery Grid — a captioned image grid, two to five columns, as a regular grid or masonry. Opening a photo shows a lightbox on that image — arrows, caption and close sit on the photo — with keyboard, swipe, and click-outside to dismiss.
- Card Collection — a grid of linked cards with optional covers and an open body, so a badge, date or author is just another building block. Two to four columns, grid or masonry. Nested links (a category badge) stay their own targets.

#### New building blocks

- Card Grid — the layout Card Collection, Latest Posts and Team Grid share: a fixed number of columns (or masonry) of open cards. Not the auto-fit Grid used by Feature Grid and freeform layouts.
- Masonry — a Pinterest-style column layout that keeps reading order. Falls back without JavaScript, and uses the browser's native masonry where it exists.
- Badge — a pill for statuses, tags and announcements. Status colours plus a plain and accent look, three sizes, an optional icon or dot, and an optional link.
- Alert — a status callout (info, success, warning, danger, note) with a markdown body, insertable into blog posts. Warning and danger announce themselves to screen readers.
- Rating — star ratings with half stars, an optional number, and a colour option. Read as a single value by screen readers.
- Table — caption, header row, optional row headers, striped and compact. Ragged rows fill empty cells instead of collapsing. Small screens pan sideways with the first column pinned.
- Social Links — a row of social icons in a quiet or brand-colour style, using the same data as the footer.

#### New options

- An announcement bar shown above the navigation on every page, driven by `src/data/announcementBar.json` and editable in CloudCannon under Data. Write the message in Markdown, with a link for an optional call to action; closing the bar hides it for that visitor until the message changes, so a new announcement brings it back for everyone.
- Tag pages show a Home › Blog › tag trail above the title, replacing the old "All posts" link. Long titles are shortened to keep the trail on one line, and small screens swap it for a single link back to the blog. The Home label is editable in CloudCannon under Data.
- Blog posts show an "On this page" list of headings by default — a sticky sidebar on wide screens, a collapsed disclosure on small ones. Turn it off with `showToc: false` in the post.
- Backgrounds can be a repeating tiled pattern as well as an image or video, on Card, Custom Section and every page section. Pick the tile with the usual image picker and choose a tile size; the overlay and background colour still apply, so patterns with transparency show the background colour through.
- The Video component gained autoplay and loop options for all three source types. Autoplayed video starts muted, since browsers refuse it otherwise. YouTube and Vimeo players load when scrolled into view, and each library loads only if that kind of embed is actually on the page — a Vimeo-only page never downloads the YouTube player.
- Video Modal can open from a poster image with a play button, the treatment hero and feature media usually want.
- Form fields take a `hint` for help text under the field, and an `error` for validation messages.
- Card and Custom Section backgrounds can stay fixed while the page scrolls, falling back to a normal background for anyone who prefers reduced motion.
- Carousel gained pause-on-hover, a starting slide, a thumbnail indicator, and an event when the selected slide changes. Image gained `decorative` for images screen readers should skip. Button passes `aria-pressed` through so it can act as a toggle button.
- Cards can pin their colour scheme against the visitor's theme toggle, as Custom Section already could.
- Warning is now a first-class status colour, with matching background and border tokens in both themes, and the missing success border token is filled in. Shared thin and medium border widths cover the rails on Steps and Timeline.

### Changed

#### Page sections

- **Heads-up:** page sections are grouped by the job they do on a page — heroes, explainers (was features and info-blocks), proof (was social-proof and testimonials), conversion (was CTAs, pricing and contact), collections (was blog, galleries and team), and builders. The group is part of each section's path, so existing pages need a find-and-replace — for example `page-sections/ctas/cta-center` becomes `page-sections/conversion/cta-center`, and `page-sections/features/feature-grid` becomes `page-sections/explainers/feature-grid`. Component docs URLs move the same way. The `@features` import alias is now `@explainers`.
- **Heads-up:** Team Grid's start/center layout option is gone — a fixed number of columns does not need it. Card Collection, Latest Posts and Team Grid now share one card layout. Card Collection still holds a curated list; Latest Posts still fetches posts; Team Grid still has name, role and bio fields. Adding Team Grid from the picker starts with three people, matching the three-column layout.
- Page-section editing panels put content fields first, with the shared shell settings (width, padding, colour scheme, background) in a collapsed group underneath. Data files are unchanged — this only reorders the editor. Component docs match that grouping.

#### Framework and dependencies

- Upgraded to **Astro 7**, with every other dependency refreshed. Node 22.12 or later is now required, and there are no known security advisories against the dependency tree.
- Icons are built into the project instead of coming from the `astro-icon` package, which has been unmaintained for well over a year and was written for an older Astro. Icons look and behave the same, and a mistyped icon name now warns you while you work instead of failing the build.
- Accessibility, SEO, link and performance checking now happens with a separate tool outside this repository, so the partial version that lived here has been removed. Nothing in the project or its CI catches accessibility regressions any more.
- Agent instructions live in `.agents/skills/`. Cursor reads that folder directly; they are still copied to the Claude folder for Claude Code.

#### Search

- Site search now works locally: `npm run build` creates the search index, so `npm run preview` gives you working search, and `npm run search:dev` carries the index over to `npm run dev`. Previously search only ever worked once deployed, and found nothing locally with nothing to explain why.

#### Look and feel

- **Heads-up:** light-theme link colours changed. The placeholder pure blues are now accessible blues that meet contrast requirements. Dark-theme links are unchanged.
- **Heads-up:** the grey design tokens were renamed from `--gray-0…12` to `--gray-50…950`, matching every other colour. The colours themselves are identical — only the names changed, so a brand's grey scale can be pasted straight in. `npm run lint:css-vars` finds any old names you miss.
- **Heads-up:** the colour palette is now complete, with a full range for all eight colours. Most things look the same; what shifts is the icon background tints, the green and yellow icon colours, and the dark theme's accent section backgrounds.
- **Heads-up:** layout breakpoints are standardised on 640px and 768px. Three components had their own values nearby, so a few layouts now change shape at slightly different widths.
- h2 and h3 headings now get a linkable id from their text when you don't set one, so sections can be cited. Duplicate titles on the same page get a number on the end. Page titles (h1) are left alone.
- Video Modal's close control sits above the player on a dark overlay, and clicking the overlay closes it. The old sheet put the control on the video, where a YouTube or Vimeo player covered it. It also defaults to extra-large instead of large.
- The placeholder image is a photo glyph on a warm grey field, so it still reads as a stand-in when a card crops it. The old corner-to-corner X looked broken once a 16:9 file was covered to 4:3.
- Component picker short descriptions and component-docs overviews are rewritten in simpler language.
- Focus outlines are consistent everywhere, and clicking with a mouse no longer leaves one behind.
- Fonts are served from your own site rather than fetched from Google at build time.
- Code in blog posts uses the theme's monospaced font instead of whatever the browser picked.
- Blog listing headings say which list you are looking at. Every tag page and every page of the blog said "All posts".
- Blog posts open with a back link, then the title, subtitle, and one muted line for category, date and author. The category links to its tag archive. The hero image is 16:9. Tags sit at the end of the article as badges, not in the header.
- Component preview thumbnails were all redrawn to look like one family, and they follow light or dark mode.
- The README leads with the live demo and screenshots, and documents the tooling, the scaffolder and deployment. It also gives one Node version instead of the three different answers it used to.

### Fixed

#### Accessibility

- The navigation menus are properly labelled and keyboard-operable. The hamburger, the close button and every dropdown arrow were announced to screen readers as unlabelled, on every page. The menus still work in the CloudCannon editor.
- The main, mobile and footer navigation now have distinct names, instead of appearing to a screen reader as three identical "navigation" areas.
- Small icon-only controls now have a 44px tap area: the mobile menu and search buttons, carousel arrows, the theme toggle, and the announcement bar's dismiss. Nothing looks bigger — the extra area is invisible.
- The footer's social row is now the Social Links component rather than its own copy of the markup, so it announces itself as a labelled list. Its icons pick up that component's quieter muted styling.
- The blog "On this page" list no longer exposes two navigation landmarks with the same name. Only the sidebar counts as navigation; the small-screen disclosure is just a control.
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
- Masonry cards and gallery tiles keep each photo's own shape. A width cap was pairing that width with the file's original height, which stretched portraits.
- Testimonial author photos were clipped and soft. The circle now fills edge to edge, initials still show when there is no photo, and the image ships extra resolutions for retina screens.
- Logo Cloud's placeholder logos are coloured, so the full-colour example is actually visible.

#### The visual editor

These all shared one symptom: the site built and looked fine, but a field in
CloudCannon was missing, unusable or wrong.

- Fields for adding a list of items showed "not configured" and could not be edited. Main Nav's buttons were the last case; `lint:cms` now fails on the whole class of mistake.
- Options that existed in the editor but the component ignored, and options the component supported but the editor never offered, across a long list of components.
- Controls that only appeared after you saved — alternate-theme logos, grid alignment — now show up on a freshly added block.
- The "Fixed background (parallax)" toggle was missing from the eleven page sections that pass background options through, even though Custom Section and Card offered it.
- CloudCannon's add-section cards now show each component's preview thumbnail. The old path was a site URL that does not exist in the source tree, so the picker had nothing to display.
- Several lists no longer trip CloudCannon's "Failed to render array item" error: Latest Posts cards (which are built from the blog, not a hand-edited list), the footer's social row, and Gallery Grid tiles, which can now be selected and reordered on the canvas.
- The move handle on the first page section is reachable again. A second editable wrapper was covering it.
- Adding a Step or Timeline entry now keeps the rail and numbering in sequence. The old last-item styles were baked in at render time, so they went stale until you rebuilt.
- The icon picker now shows brand marks with their real names (GitHub, LinkedIn, TikTok) instead of the filename.
- Uploaded images and files were going to the wrong folder instead of `src/assets/images`.
- 31 wrong icon names across 15 files meant the "add section" menu showed the wrong icon.
- Navigation and footer item definitions were duplicated across four components in three different versions.
- Some component documentation pages showed a blank code sample.

#### Visual and content

- Heading icons sat flush against their text; the gap is back.
- A background colour set alongside a background video painted over the video, hiding it completely.
- The announcement bar's default link now says "Why we built this" instead of "Learn more".
- The blog table of contents no longer slides under the sticky navigation.
- Passing a class to Carousel no longer strips its own class, which silently disabled both its styling and its JavaScript.
- Video Modal no longer emits a leftover attribute the modal wrapper does not use.
- Counter now animates decimal targets at their own precision — 99.95 no longer drops to 99.
- Switching examples in the component-docs viewer no longer jumps the page. The frame stays sized to the tallest variant.
- The component-docs preview no longer prints `[object Object]` for nested content. Item wrappers like Steps and Timeline show their real children.
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
