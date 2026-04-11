# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- Standardized layout prop naming to a consistent noun-first convention: `alignX` renamed to `alignmentHorizontal`, `verticalAlignment` renamed to `alignmentVertical`, Carousel `align` renamed to `alignmentHorizontal`, and Modal `header` renamed to `heading`.
- FeatureGrid heading/text alignment is now configurable via the `alignmentHorizontal` prop instead of being hardcoded to `center`.

### Added

- Blog tags on posts link to a paginated tag archive at `/blog/tag/{slug}/`, where `{slug}` is derived from each tag with `slugifyLabel` (e.g. `Content Strategy` → `/blog/tag/content-strategy/`). New route: `src/pages/blog/tag/[tag]/[...page].astro`.
- All page sections that wrap `CustomSection` now accept the same shell props as Custom Section: `sectionLabel`, `maxContentWidth`, `paddingHorizontal`, `paddingVertical`, `colorScheme`, `backgroundColor`, `background` (image/video with overlay), and `rounded`. CloudCannon inputs are shared via `custom-section-wrapper.cloudcannon.inputs.yml` (merged first in `_inputs_from_glob`). `sectionLabel` maps to Custom Section’s `label` and avoids clashing with FAQ’s accordion `label`.

### Fixed

- Blog post tag line no longer inserts a stray space before commas (trim tag strings; compact fragment markup so Astro does not emit whitespace text nodes between tags).
- Blog and other slot-only pages are included in the Pagefind index again: `data-pagefind-body` on `MainComponent` caused Pagefind to skip any page without that marker; the layout slot is now wrapped so those pages are indexed.
- CloudCannon `data` collection (`src/data` JSON) now sets `disable_url: true` so automatic output URL matching does not assign incorrect preview URLs to non-page data files.
- Carousel indicator dots now use presentational `<div>` elements instead of `<button>`, fixing invalid `aria-selected` on buttons and removing unnecessary touch-target assessments.
- Navigation dropdown `<label>` triggers no longer use invalid `role="button"`.
- Modal scrollbar now only applies to the body content, keeping the header fixed outside the scroll area.
- List items with icons now align wrapped text to the text column instead of wrapping under the icon.

### Changed

- Blog index and tag archive share `BlogPostListingGrid.astro` plus `src/utils/blog.ts` (`getBlogPostsSortedByDate`, `loadBlogPageContext`) so the card grid, pagination, and empty state live in one place.
- Blog post tags are separated with ` • ` instead of commas.
- Sample blog posts share a small tag vocabulary (`Development`, `Frontend`, `Design`, `Accessibility`) with two tags on most posts and three on the intro and accessibility articles, so tag archives stay populated while posts can sit in multiple categories.
- Blog Pagefind wiring uses visible markup: `published` / sort on the byline `<time>`, author filter+meta on a span around the author name, `Type:Article` on the post `CustomSection`, tags as comma-separated links when present; blog index uses `Type:Blog` on its section; CMS pages keep `Type:Page` on `MainComponent` (no visually-hidden duplicates).
- CloudCannon field comments and component docs now note that selectable UI icons are sourced from [Heroicons](https://heroicons.com/).
- Lowered minimum Node.js version requirement from 24 to 22.
- **Breaking:** Renamed the Video component's `id` prop to `videoId` to avoid conflicts with the HTML `id` attribute. The same rename applies to the Video Modal component.
- **Breaking:** Button no longer accepts explicit `popovertarget` / `popovertargetaction` props. Pass them as HTML attributes when using `element="button"`, or use the new `^popover-id` link convention instead.
- **Breaking:** Button's `element` prop no longer defaults to `"a"`. The tag is now inferred: `<a>` when `link` is set, `<button>` otherwise. Pass `element` explicitly to override (e.g. `element="div"`).
- Default font provider switched from `fontProviders.google()` to `fontProviders.fontsource()` in `site-fonts.mjs`, using local `@fontsource` packages instead of fetching from Google Fonts.

### Added

- Button and Card `link` fields now support a `^popover-id` convention (e.g. `^modal-my-video`) to open a modal via the native Popover API instead of navigating. The popover action defaults to `show` so the trigger only opens (never toggles) the modal.
- Video Modal wrapper component with autoplay on open, pause on close, and support for YouTube, Vimeo, and local video sources.
- Image Carousel wrapper component with synchronized thumbnail navigation, configurable aspect ratios, per-image positioning, and responsive image optimization, built on Embla Carousel.
- Video component supports `background` mode (`background={true}`) for rendering decorative looping background video with autoplay, mute, and `prefers-reduced-motion` handling.
- Custom Section and Card `background` object supports an `overlay` value (-1.0 to 1.0) that renders a semi-transparent lighten/darken layer over the background image or video.
- `maxContentWidth` select on Custom Section and Card now includes a **None** option (`none`) so content can span without a max-width token cap.
- Carousel supports `indicatorStyle="fraction"` to show a slide counter (e.g. `1/3`) instead of dots when indicators are enabled.
- Modal wrapper now supports an optional header title shown in the sticky top bar.

### Changed

- Custom Section and Card: `backgroundImage` and `backgroundVideo` are merged into one **`background`** object (`type`: `image` | `video`, shared `positionVertical` / `positionHorizontal`, `priority` for images, `imageSource` / `imageAlt`, `videoSource`). Default type is `image`; leave `imageSource` empty for no background.
- Logo aspect ratios in main nav stay visually balanced across desktop and mobile states.
- Third-level main nav items now use distinct styling to separate from second-level items.
- Text blocks now trim top margin from their first child and bottom margin from their last child for more consistent wrapper spacing.
- Modal examples now use `custom-section` for inner spacing, and the modal wrapper no longer applies default body padding itself.
- Local video sources now automatically include matching sibling formats like `.webm` and `.ogv` when they share the selected file's basename.
- Base layout now renders SEO meta tags directly without relying on the `astro-seo` package.
- Blog posts now emit `og:type="article"` plus article-specific Open Graph metadata.

### Fixed

- Button now forwards link attributes (`target`, `rel`, etc.) and button attributes (`type`, `disabled`, form overrides, etc.) to the inner `<a>` / `<button>` instead of the wrapper, so external links and submit buttons behave correctly.
- Carousel: `loop={false}` now disables Embla loop; `data-loop="false"` was previously treated as enabled because we only checked attribute presence.
- Opening a modal now locks page scrolling until the modal is closed.
- Image component now always keeps at least one valid responsive width candidate, even when the source image is smaller than the default breakpoints.
- Structured data no longer emits an empty `description` field when the site SEO description has not been set.

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
- CSS uses Vite’s default pipeline (PostCSS for processing, esbuild for minification) instead of opting into Lightning CSS for transform while minifying with esbuild.
- Raised Vite `chunkSizeWarningLimit` to 1024 kB so builds don’t warn on expected large chunks (e.g. Shiki in component docs).

### Fixed

- ComponentViewer Astro code preview now renders child items for BentoBox and Masonry components instead of showing self-closing tags.
- Component Builder sandbox delete button styles: replace Sass-style `&-delete` nesting with a flat `.sandbox-item-btn.sandbox-item-btn-delete` selector so esbuild CSS minify doesn’t warn on invalid nesting.

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
