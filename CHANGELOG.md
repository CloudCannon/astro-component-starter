# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.0.0] - 2026-08-11

A big release: a browsable reference site for every component, tooling that
catches editor problems before they ship, and a long list of accessibility
fixes. If you have already built a site on this starter, read the **Heads-up**
items under Changed before upgrading — a few change how things look.

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
- `npm run test:smoke` drives a real browser over the built site to confirm the accordion, modal, carousel, mobile menu and theme toggle all still work.
- `npm run test:render` builds a page containing every component, so one that stops rendering fails the build.
- `npm run new:component` scaffolds a new component's files and tells you the remaining steps.
- Editor autocomplete in VS Code for both the CloudCannon config and the design tokens.

#### New component options

- Form fields take a `hint` for help text under the field, and an `error` for validation messages.
- Card and Custom Section backgrounds can stay fixed while the page scrolls, falling back to a normal background for anyone who prefers reduced motion.
- Carousel gained `pauseOnHover`, and Image gained `decorative` for images screen readers should skip.

### Changed

#### Framework and dependencies

- Upgraded to **Astro 7**, with every other dependency refreshed. Node 22.12 or later is now required, and there are no known security advisories against the dependency tree.
- Icons are built into the project instead of coming from the `astro-icon` package, which has been unmaintained for well over a year and was written for an older Astro. Icons look and behave the same, and a mistyped icon name now warns you while you work instead of failing the build.
- **Heads-up:** React has been removed; nothing in the starter used it. If you add React components later, install `@astrojs/react`.
- Accessibility, SEO, link and performance checking now happens with a separate tool outside this repository, so the partial version that lived here has been removed. Nothing in the project or its CI catches accessibility regressions any more.
- Agent instructions live in one place (`.agents/skills/`) and are copied automatically to the Cursor and Claude folders.

#### Search

- Site search now works locally: `npm run build` builds the search index, so `npm run preview` gives you a working search page. Previously it only ever worked once deployed, and the search page found nothing locally with nothing to explain why.
- **Heads-up:** the `/search/` page is now hidden from search engines and left out of the sitemap. There is nothing on it for them to read, and listing it competes with the pages it exists to help people find.

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
