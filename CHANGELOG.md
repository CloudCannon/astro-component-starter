# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- List items with icons now align wrapped text to the text column instead of wrapping under the icon.

### Changed

- Default font provider switched from `fontProviders.google()` to `fontProviders.fontsource()` in `site-fonts.mjs`, using local `@fontsource` packages instead of fetching from Google Fonts.

### Added

- Image Carousel wrapper component with synchronized thumbnail navigation, configurable aspect ratios, per-image positioning, and responsive image optimization, built on Embla Carousel.
- Video component supports `background` mode (`background={true}`) for rendering decorative looping background video with autoplay, mute, and `prefers-reduced-motion` handling.
- Custom Section and Card `background` object supports an `overlay` value (-1 to 1) that renders a semi-transparent lighten/darken layer over the background image or video.
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
