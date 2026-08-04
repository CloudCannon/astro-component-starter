# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `npm run reset:starter` turns a fresh clone into your own site: it prompts for a site name and production URL, then clears the demo blog posts, the starter's own pages, and its logos and navigation, and writes `site` in `astro.config.mjs` plus the SEO defaults in `src/data/seo.json`. The demo content stays in the repository — the live demo builds from it, and it's what makes a clone look like a working site on first `npm run dev` — so removing it had been an undocumented scavenger hunt through four data files and fifteen content files. Guarded on a clean git tree so `git checkout .` is always an undo, and `--dry-run` prints the plan without writing.
- `npm run check:placeholders` (part of `npm run check`) reports starter placeholders that survive into a real site. `site` in `astro.config.mjs` is the base for every absolute URL Astro emits — canonical tags, sitemap entries, RSS links, the JSON-LD `@id` graph — so at its `https://example.com` default the build succeeds, the pages look correct, and all of them advertise a domain the project doesn't own. Nothing else catches it. It warns and exits 0 by default, since this repository legitimately holds the placeholders; `--strict` makes it an error for a site built from the starter.
- `docs/DEPLOYMENT.md` covers deploying to CloudCannon: what the repository already configures, creating the site, setting the production URL, and how search indexing works. Deployment was previously undocumented anywhere despite visual editing being the point of the starter.
- A `LICENSE` file. `package.json` and the README both declared MIT, but the license text itself was missing.

- An RSS feed at `/rss.xml`, built from the blog collection newest-first and advertised with a `<link rel="alternate">` in every page head so browsers and feed readers discover it. Items carry title, description, publication date, tags and a `dc:creator` author — posts are MDX and can embed any component in the library, so serialising rendered bodies into feed markup would produce output no reader honours.
- Blog posts emit `BlogPosting` structured data, and every page now emits a linked JSON-LD `@graph` (Organization, WebSite, WebPage, plus BlogPosting on posts) whose entities cross-reference by `@id` instead of repeating themselves inline. Previously only a standalone sitewide Organization entity was output, so posts had no article-level markup at all.
- Social share cards get a `twitter:card` tag (`summary_large_image` when the page has an image), plus an optional `twitterSite` handle in `src/data/seo.json` for the `twitter:site` tag. X falls back to the existing Open Graph tags for title, description and image, so nothing else needed duplicating.
- Indexable pages emit `max-image-preview:large, max-snippet:-1, max-video-preview:-1` robots directives. Without them Google caps image previews and snippet length, which costs rich results and Discover eligibility.
- Every component under `src/components/**` now gets a `/component-docs` page automatically, with no hand-written docs entry required — title, description, a live primary example, and props/slots tables all derive from its CloudCannon YAML and `.astro` source. `content/components/<key>/index.md` and `examples/*.md` are now optional enrichment (curated example groups, longer overview prose, slot description/overrides), not a required step.
- Slot metadata (name, `fallback_for`, `child_component`) is derived directly from a component's `<slot>` usage in its `.astro` source instead of requiring hand-written frontmatter; only slots whose fallback content is genuinely ambiguous need a declared override.
- `npm run docs:check` (part of `npm run check`) lints the docs-authoring layer against the components it documents: orphaned docs directories, example prop drift against the real component props, on-disk examples not wired into an `index.md`'s curated groups, and invalid slot overrides.
- A generated component catalog in the `page-content-authoring` skill (`.agents/skills/page-content-authoring/component-catalog.md`), built by `npm run docs:catalog` from each component's own CloudCannon YAML — "Use for" and prop columns come from one source of truth instead of hand-duplicated prose.

### Changed

- Pagefind is a real `devDependency` and `npm run build` chains `npm run search:index`, so `npm run build && npm run preview` produces a working `/search/` page locally. Indexing previously ran only from `.cloudcannon/postbuild` via `npx`, which meant the search page shipped in the demo content was dead on every local build and every non-CloudCannon host, with nothing to explain why. `.cloudcannon/postbuild` is removed rather than left to index a second time — CloudCannon's build command is `npm run build`. The chaining is explicit rather than an npm `postbuild` lifecycle hook because `ignore-scripts=true`, a common hardening setting on build machines and in developers' npm configs, silently suppresses lifecycle hooks — which reproduces the original bug exactly, since a missing index looks like a working build and a search page that finds nothing. `@pagefind/linux-x64` and `@pagefind/windows-x64` are pinned in `optionalDependencies` alongside the equivalent `sharp` and `rollup` entries, since Pagefind ships its binary the same way and `npm ci` on Linux CI would otherwise miss it.
- CloudCannon's `install_command` is `npm ci` rather than `npm install`. The lockfile is committed and CI already verifies it resolves on Linux, so `npm ci` is both faster and reproducible — and it matches the rule the README, `CONTRIBUTING.md` and `CLAUDE.md` all state for local work.
- The README leads with the live demo, a screenshot, and the component gallery instead of describing them, and documents the parts of the project it previously omitted entirely: the skills system, `npm run check`, the component scaffolder, and deployment. It also states one Node version — 22.12 or later, the floor Astro 7 itself sets, noting the `.nvmrc` pin CI uses — where the README, `package.json` and `.nvmrc` had previously given three different answers, and it counts 55 components rather than "40+".

- `robots.txt` is generated by a route rather than shipped as a static file in `public/`, so its new `Sitemap:` line resolves against `site` in `astro.config.mjs` instead of hardcoding a domain that goes stale when a project is renamed.
- The 404 page is marked `noindex`. It was previously silent on the matter, and the new default robots directives would otherwise have told crawlers to index it.

- Card and Custom Section background images can be pinned to the viewport for a parallax effect, via a new `background.fixed` switch. The image is clipped with `clip-path` rather than `overflow`, so rounded corners still hold, and it falls back to a normal background under `prefers-reduced-motion: reduce`. Linked cards drop their hover scale when it's on, since a transformed ancestor cancels fixed positioning. Both components have a "Fixed background image" docs example.

- `npm run icons:sync` generates the `_select_data.icons` list in `cloudcannon.config.yml` from the SVGs in `src/icons/`, and `npm run icons:check` (part of `npm run check`) fails on drift in either direction — an id with no SVG renders a broken thumbnail in the picker, an SVG with no id is invisible to editors, and neither surfaces as an error anywhere. The list was previously maintained by hand across 343 entries.
- `npm run lint:css-vars` checks that every `var(--x)` in `src/` resolves to a declared custom property. An unresolved `var()` is invalid at computed-value time, so the property silently inherits — invisible in review, in the build, and often on the page. References with a fallback and dynamically-built names are skipped by design; `--list` prints every declared token. Part of `npm run lint`.
- Editor tooling wired up in `.vscode/`: the CloudCannon JSON Schemas are mapped to the component YAML globs (and `cloudcannon.config.yml`) for as-you-type validation and autocomplete — notably `icon:` now completes from the real Material Symbols enum instead of being guessed — and `cssVariables.lookupFiles` gives design-token autocomplete inside `<style is:global>`. Both resolve out of `node_modules`, so nothing is committed and the pinned schema package stays the single source of truth.
- `npm run lint:schema` validates every CloudCannon YAML fragment against the official JSON Schemas from `@cloudcannon/configuration-types` (pinned devDependency), mapping each glob to the schema for the `*_from_glob` key that loads it. Part of `npm run check`, and complements `lint:cms` — that one checks the YAML against the components, this one against CloudCannon. Now also covers `cloudcannon.config.yml` itself, which isn't glob-collected and so was previously unvalidated.
- Components that are also MDX snippets now show their preview thumbnail in the snippet picker; `previews:build` wires it and `previews:check` guards it. Snippets whose preview uses a `gallery:` block keep showing the author's own image instead.
- `npm run lint:cms` now fails on a visible `type: array` input that declares neither a `<name>[*]` sub-input nor `options.structures`. CloudCannon needs one of the two to know what to insert when an editor clicks "+"; without it the field renders as "<Name> not configured" and the array is uneditable. Nothing else catches this — the prop still has a default and the site builds fine. Covers component `inputs.yml` and `snippets.yml`, `cloudcannon.config.yml`, and the shared structure files. `hidden: true` inputs are exempt, since they never render a field.
- Hand-written docs example frontmatter (`content/components/<key>/examples/*.md`) now requires a non-empty `title:`. `ComponentViewer` reads `example.data.title` unconditionally, so a missing title previously crashed at render time; it now fails at build time with a clear `docs:check`/zod error naming the file instead.
- The gray primitive ramp is renamed from `--gray-0…12` to the same Tailwind-style scale every other hue uses: `--gray-50…950`, with pure white and black promoted to their own `--white`/`--black` tokens. All hex values are unchanged, so nothing shifts visually — this is naming only, so a brand's existing 50–900 gray ramp can be pasted in without translating step names. **Migration for projects built on the starter:** references to the old names live only in the two theme files unless you added your own; map `--gray-0`→`--white`, `--gray-12`→`--black`, and `--gray-1…11`→`--gray-50,100,…,900,950` (`npm run lint:css-vars` finds any you miss).

### Fixed

- Responsive images now offer the source's own width in the `srcset`. `getResponsiveWidths` only kept preset steps that fit within the asset, so native resolution was served only for images narrower than the smallest step — everything else was rounded down to the step below it and the detail in between was unreachable. A 1181px source produced a lone `640w` candidate, giving the browser nothing to choose from; aspect-ratio crops were worst hit, since the cropped width never lands on a step (a portrait-cropped 1707px image served `640w` into a slot up to 1280px wide). The native width is skipped when it exceeds every step — that ceiling is deliberate, and stops a 6000px upload becoming a 6000px variant — or when it sits within 10% of a step already emitted.
- Full-bleed section backgrounds declared `sizes="(max-width: 1280px) 100vw, 1280px"`, capping the browser's request at 1280px on an element that is by definition the full viewport width. `CustomSection` now declares `sizes="100vw"` with a `1920` breakpoint added between `1280` and `2560`; every page section (both heroes, all three CTAs) renders its background through it. `Card` declares `100vw` too — a card can be laid out at any width, so the viewport is the only bound that holds without knowing the context; Chrome still measures the real box from the `auto` prefix, and elsewhere over-declaring costs bytes where under-declaring would cost sharpness. Chrome resolved the real layout width from the `auto` prefix already; this fixes Firefox and Safari, plus any background marked `priority` (which drops `auto`).
- Heading icons sit flush against the heading text — the `margin-inline-end` that separated them was dropped in v1.0.1 when the icon rule was rewritten for vertical alignment. The Astro compiler strips whitespace-only nodes between adjacent elements, so there is no source newline to fall back on. Restored as `var(--spacing-em-xs)`, including the `.heading-icon-after` mirror.
- The docs' "Accepted values" chips and the Component Builder's property fields render on `--color-bg-muted` (`#d4d4d4` in light), a heavy slab colour for a UI surface. Both previously pointed at undeclared variables (`--background-subtle-backgroundColor`, `--cb-bg-muted`), so they had no background at all until those were repointed at real tokens — and the chips' `padding: 0` only became visible once a background existed. Both now use `--color-bg-surface`, and the chips get real padding and a radius.
- Removed `src/icons/medium.svg`, a byte-identical stray copy of `src/icons/social/medium.svg` that was in no picker and referenced by nothing. Found by the new `icons:check`. Keeping it would have added a second "Medium" option that renders black, since `Icon.astro` only recolors icons under `social/`.
- A background colour set alongside a background video painted over the video in Custom Section and Card, hiding it entirely. Both stacked the video with a `> .background-video` rule, but `Video.astro` renders its background wrapper as `.video.background` — so the rule matched nothing, the video fell through to the unlayered `> .background` rule, and the colour div (same class, later in the DOM) won. Both selectors now target `> .video.background`, putting the video above the colour and below the overlay, matching how background images already behaved.
- `code`, `pre`, `kbd` and `samp` now use `var(--font-mono)`. The token was declared in `_fonts.css` but nothing outside the docs site consumed it, so code blocks and inline code fell through to the browser's UA-default monospace — platform-dependent, and unaffected by changing the token. Blog code blocks are the visible case. Also dropped 5 dead `var(--font-mono, "SF Mono", …)` fallback stacks in the docs CSS; the token always resolves, so the fallback never rendered, and the fallback form made `lint:css-vars` skip the reference.
- Replaced the last 7 hardcoded `font-weight` values with tokens, so a rebrand that changes the weight scale reaches everything: `.eyebrow` and Button's link variant were pinned at `600`, four docs rules at `400`/`300`, and the `h4`–`h6` reset used the `normal` keyword. Only the `300` shifted value (a docs-only glyph, now `normal`/400) — there is no 300 step in the scale.
- Image and file uploads in the `pages` and `blog` collections were writing to CloudCannon's default upload directory instead of `src/assets/images`. Both collections set `paths:` at the collection level, which is only valid at the top level of `cloudcannon.config.yml`, so the key was ignored. Hoisted to the top level, where it now serves as the default for any input that doesn't set its own `options.paths`.
- Fixed 19 unresolved `var()` references across 7 files, all of them plausible-looking names for scale steps that don't exist: `--font-size-body-sm`/`-xs` (no `body` infix), `--font-weight-regular` and `--font-weight-medium` (the weight scale is `normal`/`semibold`/`bold` — 400/600/700, with no 500 step), `--spacing-2xs` (the scale starts at `xs`), `--color-text-subtle`/`-body`/`-link`/`-accent`, `--color-bg-input`, `--z-index-2`/`-3` and `--layer-10` (the scale is `--layer-0`…`--layer-8`). Affected shipped components — mobile nav, top bar, blog listing, content selector, team grid — plus the docs site.
- The remaining 10 page sections moved their section-wrapper `_inputs` out of `structure-value.yml` (and the duplicate copy in `snippets.yml`) into `inputs.yml`, completing the migration `cta-center` started. Drops 3,330 duplicated lines for 1,920 canonical ones (net −1,410), and puts the block where `lint:cms` can see it — which immediately surfaced that all 10 accepted `lockColorScheme` in the editor without wiring it to `CustomSection`. Now forwarded.
- Corrected 31 invalid `icon:` values across 15 component YAML files. These were Heroicons names (`hero`, `eye-slash`, `device-phone-mobile`, `people`, …) in a field that takes **Material Symbols**, so CloudCannon silently fell back and the Add menu showed the wrong icon.
- Nav item structures (`navItemLevel1/2/3`) now live once in `.cloudcannon/structures/navItems.cloudcannon.structures.yml` instead of an `_structures:` block inside each of the four nav components' `inputs.yml` — not a valid key there. All four declared the _same_ three names with three drifted definitions, so only one could ever take effect, chosen by glob load order. Footer's `linkItems`/`socialItems` moved likewise to `footerItems.cloudcannon.structures.yml`.
- Main Nav's `buttonSections` was a bare `type: array` with no `options.structures`, so the editor rendered it as "not configured" and nav buttons could not be added or edited — the one remaining case of the same defect that hit the `keywords` fields in v1.0.2. Now points at `_structures.buttonSections`, matching every other `buttonSections` in the library; the prop is passed straight to `ButtonGroup` and reads the Button schema, so that shared structure is the right one. Found by the new `lint:cms` check.
- `feature-slider`'s `slides` and the nav child/grandchild items gave `options.structures` as an array, which CloudCannon does not read as structures — the editor offered none. Now wrapped under `values:`.
- `embed`'s `syntax: html` moved under `options:`, `split` dropped an invalid `default:` key, and `pagination` dropped a stray top-level `structures: []`.
- `Split`'s `reverseOrderOnMobile` now defaults to `false`, matching the value seeded into the editor. `FeatureSplit` passes `true` explicitly, so its behaviour is unchanged.
- `lockColorScheme` is now forwarded explicitly by `CtaCenter` rather than arriving via the rest-spread, and the CTA Center section-wrapper inputs moved from an inline `_inputs:` block in its `structure-value.yml` into its `inputs.yml`, where both the structure value and the MDX snippet already read from — and where `lint:cms` can see them.
- `npm run new:component` was emitting the section-wrapper inputs into the wrong file; it now appends them to the new component's `inputs.yml`, sliced from a marker comment rather than a positional lookup.
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
- Restored the gap between property name and type in the component-docs property list. Astro 7's compiler drops whitespace-only nodes between adjacent elements, so the source newline separating the two `<span>`s stopped rendering as a space — worth knowing if your own components rely on that whitespace.
- Removed a stray `:first-of-type` wrapper around the accordion summary's Firefox marker fix.
- Removed the empty `src/components/page-sections/carousel/` stub directory and restored the missing `src/assets/images/placeholder.jpg`.
- Component docs pages for List, Grid, Carousel, and other components whose repeatable prop (e.g. `items`, `slides`) shares a name with another component's slot-fallback prop showed a blank code sample. `componentFormatter` treated any prop name in the shared "nestable" set as slot-shaped for every component that has it, even where that component's own value is plain prop data rather than `_component` blocks; it now checks the actual value shape before treating a prop as slot content, and drops empty formatted lines instead of leaving blank ones.

### Changed

- Rebuilt the component preview thumbnails and the kit that generates them. All 55 previews are redrawn, and `scripts/previews/kit.mjs` now encodes the design system explicitly instead of leaving it to each recipe: nine `--pv-*` colour roles (no raw hex), a five-step type scale, a three-step stroke scale, four content width bands, and automatic centring on (640, 400). Previously recipes hand-picked heading heights — 18 distinct values across the set — which is why the old thumbnails didn't read as one family. Recipes are now `preview({ width, draw: [...] })` and the build **fails** if the drawn geometry doesn't match the declared width, so a preview cannot silently drift off-band. Previews also follow the viewer's colour scheme: each SVG carries its own `@media (prefers-color-scheme: dark)` block, which an external stylesheet could not do because CloudCannon loads previews by URL. Re-skin the whole set by editing `LIGHT`/`DARK` in the kit.
- Upgraded to **Astro 7** (from 6) with `@astrojs/node` 11, `@astrojs/mdx` 7, and `@astrojs/compiler-rs` 0.3; all other dependencies refreshed. The Node floor is now `>=22.12.0` and `.nvmrc` pins `24.18.0`, an exact [CloudCannon-supported version](https://cloudcannon.com/documentation/developer-articles/pin-your-dependency-version/) that CI and CloudCannon both read. TypeScript stays on 5.9 until `@astrojs/check` and `typescript-eslint` support 6/7.
- `js-yaml` v5 dropped its default export — it is now imported via named/namespace imports, and `@types/js-yaml` was removed since js-yaml ships its own types.
- Security advisories are pinned through `overrides` rather than `npm audit fix`, which would break the cross-platform lockfile. Regenerate dependencies with `npm run deps:sync`, never a bare `npm install`.
- Agent skills now live canonically in `.agents/skills/` (10 skills, tool-neutral). `.cursor/skills/` and `.claude/skills/` are generated copies, kept in sync by `npm run skills:sync` and drift-checked by `npm run skills:check`. Authoring standard: `.agents/skills/STYLE.md`.
- Focus rings are consistent across every interactive component — one `:focus-visible` outline from the new `--focus-ring-width`/`--focus-ring-style` tokens. Forms, buttons, and navigation each drew a different ring on `:focus` before, so mouse clicks no longer leave a ring behind.
- **Light-theme link colors changed:** the placeholder pure-blues (`#00f`/`#00008b`) are now `--blue-700` (#1d4ed8) and `--blue-800` (#1e40af), both meeting WCAG AA. Dark-theme links are unchanged.
- Breakpoints are standardized on two canonical values, `640px` (mobile/stacking) and `768px` (nav/tablet), documented in `src/styles/variables/_breakpoints.css`. Footer's `599/600px`, MainNav's `768/769px`, and ContentSelector's `40rem` were normalized — small, intended layout shifts around 600→640px. Bento Box keeps its content-driven `700px`/`450px` grid-density steps.
- `src/styles/variables/_colors.css` is now a complete palette: `--gray-0…12` plus a full `--{hue}-50…900` ramp for all eight hues, values straight from the Tailwind palette. Replaces the previous mix of `--{hue}-light`/`-dark` pairs, partial numeric ramps, and bespoke `-deep` one-offs. Semantic tokens and all status/link colors are unchanged; the visible shifts are the eight Icon background tints, the green and yellow Icon foregrounds (the old values were emerald-500 and amber-400), and the dark theme's accent/highlight section backgrounds.
- Line heights, status/link colors, and easing are tokenized: `--line-height-*`, `--ease-out`/`--ease-in-out`/`--ease-smooth`, and status/link entries in the `_colors.css` palette. Appearance is unchanged.
- Dark-theme accent/highlight backgrounds reference `--blue-900`/`--yellow-900` instead of inline `rgb()` literals. Computed colors are identical.
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
