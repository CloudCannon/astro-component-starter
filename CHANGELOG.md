# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- Removed dead editor inputs the components never read, found by the new `lint:cms` check: Feature Grid's `gap`/`minItemWidth`/`maxItemWidth`, Icon's `inline`, Feature Slider's `eyebrow`/`heading`/`subtext`, FAQ Section's `headingLevel`/`headingSize`/`singleOpen`/`openFirst`, and Testimonial Section's `alignmentHorizontal`. Also dropped a stale form-blocks exclusion for the deleted `forms/slider`.
- Feature Grid `alignment` and Team Grid `layout` controls now appear on freshly inserted sections.
- Footer and Main Nav `logoAlternateSource` (the alternate-theme logo) now appears on a freshly inserted block; the input existed but was never seeded into the structure default.
- Modal traps keyboard focus while open and restores focus to the trigger on close. Modal behavior also initializes inside the CloudCannon Visual Editor.
- Accessibility fixes found by the new `test:a11y` scan: Bar and Main Nav dropdown triggers are real buttons (their `aria-controls` was invalid on a bare `<label>`), Content Selector is a disclosure-button group instead of a malformed tab widget, Toggle inputs without a visible label fall back to `name`, cards with a media background get a solid theme-colored backing so text stays legible if the media fails, and docs example previews are keyboard-scrollable labelled regions.
- Rewrote the 12 form-field preview thumbnails, which were near-invisible and looked identical at picker size. Each control now has a distinguishing cue — a chevron on select, calendar tile on date, wrapped lines in textarea, filled track and knob on range/toggle, a selected option in choice-group, an active segment in segments.
- Reduced-motion support now covers animated pseudo-elements (modal backdrops, accordion content) and stops carousel autoplay/auto-scroll, which are JS-driven.
- Toggle's required marker uses the `--color-danger` token instead of a hardcoded red, so it follows the dark theme.
- Custom section `paddingHorizontal`/`paddingVertical` now offer `4xl`/`5xl`/`6xl`, matching what the CSS supports.
- Image's `aspectRatio: none` no longer emits inert `ratio ratio-none` classes; hidden `sizes`/`widths`/`width`/`height` copies were removed from its editor structure.
- Footer social links accept an optional `label` overriding the auto-generated accessible label.
- Content blocks missing a `_component` key log a warning instead of vanishing silently.
- Production builds fail loudly if `DISABLE_COMPONENT_LIBRARY` is set to anything other than `true`/`false`/unset; the build log states whether the library is included.
- Fixed three `hideText="true"` string-instead-of-boolean Button usages in Footer and mobile nav.
- Removed a stray `:first-of-type` wrapper around the accordion summary's Firefox marker fix.
- Removed the empty `src/components/page-sections/carousel/` stub directory and restored the missing `src/assets/images/placeholder.jpg`.

### Changed

- Upgraded to **Astro 7** (from 6) with `@astrojs/node` 11, `@astrojs/mdx` 7, and `@astrojs/compiler-rs` 0.3; all other dependencies refreshed. The Node floor is now `>=22.12.0` and `.nvmrc` pins `24.18.0`, an exact [CloudCannon-supported version](https://cloudcannon.com/documentation/developer-articles/pin-your-dependency-version/) that CI and CloudCannon both read. TypeScript stays on 5.9 until `@astrojs/check` and `typescript-eslint` support 6/7.
- `js-yaml` v5 dropped its default export — it is now imported via named/namespace imports, and `@types/js-yaml` was removed since js-yaml ships its own types.
- Security advisories are pinned through `overrides` rather than `npm audit fix`, which would break the cross-platform lockfile. Regenerate dependencies with `npm run deps:sync`, never a bare `npm install`.
- Agent skills now live canonically in `.agents/skills/` (10 skills, tool-neutral). `.cursor/skills/` and `.claude/skills/` are generated copies, kept in sync by `npm run skills:sync` and drift-checked by `npm run skills:check`. Authoring standard: `.agents/skills/STYLE.md`.
- Focus rings are consistent across every interactive component — one `:focus-visible` outline from the new `--focus-ring-width`/`--focus-ring-style` tokens. Forms, buttons, and navigation each drew a different ring on `:focus` before, so mouse clicks no longer leave a ring behind.
- **Light-theme link colors changed:** the placeholder pure-blues (`#00f`/`#00008b`) are now `--blue-700` (#1d4ed8) and `--blue-800` (#1e40af), both meeting WCAG AA. Dark-theme links are unchanged.
- Breakpoints are standardized on two canonical values, `640px` (mobile/stacking) and `768px` (nav/tablet), documented in `src/styles/variables/_breakpoints.css`. Footer's `599/600px`, MainNav's `768/769px`, and ContentSelector's `40rem` were normalized — small, intended layout shifts around 600→640px. Bento Box keeps its content-driven `700px`/`450px` grid-density steps.
- Line heights, status/link colors, and easing are tokenized: `--line-height-*`, `--ease-out`/`--ease-in-out`/`--ease-smooth`, and status/link entries in the `_colors.css` palette. Appearance is unchanged.
- Dark-theme accent/highlight backgrounds reference `--blue-deep`/`--amber-deep` instead of inline `rgb()` literals. Computed colors are identical.
- Fonts are self-hosted via `fontProviders.fontsource()` instead of fetched from Google at build time.
- Modal's drop shadow uses the new `--shadow-lg` token (scale: `--shadow-sm/md/lg`).
- Button icon spacing is themeable via `--button-icon-gap` (default unchanged).
- Internal dedup (~400 lines, no visual or behavioral change): the `.pad-x-*`/`.pad-y-*`/`.gap-*` CSS that Custom Section, Card, and Split each hand-rolled is now one shared `@layer utils` stylesheet; markdown rendering, form label/ID boilerplate, string validation, and overlay color are shared utils under `src/components/utils/`; and the component-key derivation used by `renderBlock.astro`, `live-editing.js`, and `lint:cms` is a single `componentKey.mjs` instead of three hand-synced copies.

### Added

- `npm run lint:cms` (part of `npm run check`) — validates the CloudCannon layer against the components: prop drift (every `inputs.yml`/`structure-value.yml` key must be a prop the `.astro` destructures, catching renames), inputs with no seeded `value:` default (the field would never appear on a newly inserted block), missing or orphaned co-located YAML, `_component` resolution, and structures-glob registration.
- Component preview thumbnails for the CloudCannon section picker and placed-block cards. Each component has a co-located `*.preview.mjs` recipe that `npm run previews:build` compiles to a 16:10 mockup SVG in `public/component-previews/` — deterministic and browser-free — then wires into its `preview`/`picker_preview` blocks.
- `npm run previews:check` (part of `npm run check`) — fails on a missing recipe, a missing or stale SVG, an orphan SVG, or missing `image:` wiring.
- `npm run previews:montage` — rasterizes every preview into one labelled PNG contact sheet (`.preview-montage.png`, gitignored) for reviewing legibility across the whole set, which `previews:check` can't judge. `npm run previews:screenshot` captures reference PNGs of the real components as an authoring aid.
- Component docs gallery at `/component-docs/`, with a preview thumbnail on each component page.
- `npm run new:component <tier/path/name>` — scaffolds a component's `.astro` plus both CloudCannon YAML files and prints the remaining manual steps.
- `npm run test:unit` (Vitest) — covers the shared component utils: key derivation, markdown, overlay color, form-field IDs, string guards, image data.
- `npm run test:smoke` — headless-Chrome tests for accordion, modal focus trap, carousel, mobile navigation, and theme-toggle persistence against the built site.
- `npm run test:a11y` — axe-core scan over every component-docs page and the main site pages; fails on serious/critical violations.
- `npm run test:render` — builds a kitchen-sink page of every structure default, so CI catches a page-builder component that stops rendering.
- `npm run typecheck` (`astro check`), part of `npm run check` and CI. CI also gained a "Smoke & a11y" job and runs unit tests on every push.
- Form fields (Input, Textarea, Select, Date, FileUpload, Range) support a `hint` prop for editor-authored help text, wired to the control via `aria-describedby`. They also accept an `error` prop, which marks the field `aria-invalid` and adds a danger-token border — a developer-set prop for server-rendered validation, deliberately not exposed as an editor field.
- Carousel `pauseOnHover` option (off by default; applies only when auto-play is enabled).
- Image `decorative` prop forcing an empty `alt` for screen-reader-skipped images.
- `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, and `docs/ARCHITECTURE.md` — agent onboarding, the component-addition checklist and `deps:sync` rule, and an overview of the content → component pipeline, CloudCannon config aggregation, and theming tiers.
- Documented the formBlocks structure design: the picker list is glob-owned by co-located `structure-value.yml` files, with `form` and `segments` intentionally excluded.

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
