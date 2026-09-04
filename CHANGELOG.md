# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Share cards are drawn automatically for every page and blog post that has no image of its own, so a site shares properly without anyone uploading a 1200x630 image. The card carries the site logo and name, the page title, a brand-coloured rule and the description, using the site's own fonts and theme colours, so it follows a rebrand with no extra edit. An entry's own **Image** becomes the card's full-bleed background, with each line of text on a solid plate so it stays readable over any photo. The new **Share card generation** setting in `seo.json` scopes generation to blog posts only, or turns it off in favour of the site-wide sharing image, and **Share card theme** draws them with the site's light or dark colours. Cards render at build time with no browser and no network, and are cached between builds.
- `imageBleed` on Feature Split and Hero Split: the image column runs to the viewport edge, cropped by aspect ratio.
- Form fields carry an `autocomplete` value so browsers and password managers can fill them (WCAG 1.3.5). Input, Textarea, Select and Date take an explicit **Autocomplete** input, a picker of the common tokens labelled in plain language ("Last name", "City or suburb") with the token itself shown underneath, so a hint can't be lost to a typo the browser ignores in silence; anything the list doesn't cover, including compound values like `shipping street-address`, can still be typed in. Leave it blank and one is derived from the field's own type and name — `email`, `tel`, `given-name`, `organization`, `postal-code` and the rest of the common set. Anything ambiguous is left alone rather than guessed, because a wrong token autofills the wrong value.
- An invalid form says why under the field it belongs to, instead of leaving it to the browser's transient bubble. The message is wired to the control with `aria-describedby`, the control is marked `aria-invalid`, focus moves to the first problem, and the message clears as soon as the field becomes valid. With JavaScript off, the browser's own validation still blocks the submit.
- Form takes a **Method** (POST or GET), a **Honeypot name** for a decoy field that spam bots fill in and visitors never see (your form endpoint has to reject submissions carrying it), and a **Success message** shown when the visitor is sent back to the page with `?success` in the URL — point your endpoint's redirect at that.
- Mega menu support in the main navigation: a top-level `navData` item can carry a `megaMenu` object — columns of icon + description links plus an optional feature card — rendered as a full-width panel on desktop and flattened into grouped links in the mobile menu. Editable in CloudCannon via the new "Mega Menu Item" structure, offered on `mainNav.json` and on the Main Nav and Bar components. The Side and Mobile components don't offer it, because neither opens a panel of its own.
- Stack wrapper (`building-blocks/wrappers/stack`): a row or column of mixed blocks with one even gap, with direction, gap, distribution, alignment, wrap, and stack-on-mobile controls.
- A `spaceBefore` input (`none`/`tight`/`default`/`loose`) on every stackable building block, backed by four new `--space-before-*` tokens, for overriding the space above a block without Spacers or custom CSS.
- Every page section with a heading takes a **Heading level** control (`headingLevel`, under Section settings). Heroes and Page Header default to `h1`; every other section defaults to `h2`, so a page that opens on a normal section can promote that section's heading to the page's `h1` without adding a header band. Sections that render their own item headings (Feature Grid, Team Grid, Pricing Tiers) derive theirs one level down, so the outline never skips a level.
- Every page carries a "Skip to main content" link, revealed on the first Tab, so a keyboard user can jump past the navigation.
- Video takes a **Captions** file (WebVTT) and a **Captions language**, rendered as a default `<track kind="captions">` on locally hosted video. The track's menu label is derived from the language tag.
- Textarea takes a **Rows** control for how many lines it shows before it scrolls.
- Testimonial takes an **Avatar size** in pixels. The photo is requested at that size, so a dense layout gets a smaller file rather than a large one scaled down in CSS; Testimonial Wall uses it instead of overriding the avatar's size from outside.
- Hero Split takes the **Rounded image** toggle Feature Split already had.
- Modal takes a **Heading level**, so its title fits the outline of the page it opens from.
- Choice Group takes **Hint** and **Error** text, wired to the group with `aria-describedby`, matching the other form fields.
- Social Links takes a **Landmark name**, so two sets of social links on one page are distinguishable.
- Main Nav exposes the **Theme toggle** switch. The prop was read but had no input, so it could only be set by editing `mainNav.json`.
- Feature Grid's snippet offers the alignment control the component already had.
- `npm run lint:cms` validates the props in page content, not just the props in the CloudCannon YAML. Every key sitting beside a `_component` in `src/content/` must be a prop that component destructures, so a renamed prop no longer leaves a stale value behind in content where nothing reports it — a stray key lands in the component's rest spread and renders as a bare HTML attribute. The items of a structured array (a logo cloud's logos, a pricing tier's features) are checked too, against the `_structures` block that declares them, one nesting level at a time.
- `npm run lint:cms` fails on a component whose behaviour would be dead in the CloudCannon editor. CloudCannon renders components with `renderToStaticMarkup`, which strips inline `<script>` tags, so a scripted component must either register a `setup.ts` in `editor-live-sync.js` or be listed in the linter's `EDITOR_INERT` map with the reason inert is acceptable — the nine that are inert today all degrade rather than break, and each now says how.
- `npm run lint:roots` fails on a literal `data-editable` on a component's root element, which collides with the region attribute CloudCannon stamps there and drops the item from the array editor, and on a classed root that spreads a rest without destructuring `class`, where a caller's `class` replaces the hook class the component's own CSS and setup script key on.
- `npm run check:quick` runs the three checks that catch real mistakes in seconds (`lint:cms`, `lint:css-vars`, `astro check`), for use while working; `npm run check` is still what a finished change has to pass.
- `npm run editor` builds the site and serves the real CloudCannon editor against `dist/`, printing the build time on start — the editor reads `dist/`, so a stale build is otherwise invisible.
- A bare `npm install` is refused with a pointer to `npm run deps:sync`, because a macOS install prunes the Linux optional dependencies CI needs and the resulting tree builds locally while failing in CI. `ALLOW_NPM_INSTALL=1` overrides; `npm ci` and CI are unaffected.
- A **Share image** field on the SEO data file, a 1200x630 raster used for social cards. Social networks cannot render an SVG, so a site whose logo is one had no usable share image; leave it blank to keep falling back to the logo, and `npm run dev` now warns when that fallback is an SVG.
- `llms.txt` is generated from the content collections rather than hand-maintained in `public/`, so it lists every indexable page instead of falling behind as pages are added. It skips `noindex` pages, matching the sitemap.

### Changed

- The icon list and the autocomplete token list are datasets under `.cloudcannon/data/`, registered in `data_config` and referenced as `values: data.icons` / `values: data.autocomplete_tokens`, instead of a 740-line `_select_data` block inside `cloudcannon.config.yml`. The config drops from 951 lines to 216, so the collections, inputs and globs that actually configure the site are readable without scrolling past 343 icon names. `npm run icons:sync` writes the data file rather than splicing a line range in the config.
- Gallery Grid's masonry layout comes from the shared Masonry wrapper instead of its own copy of the technique. The three-layer CSS (no-JS columns, measured-grid enhancement, native `display: masonry` handoff) now lives in one place, so a browser-support change is one edit rather than two. Galleries render pixel-identically.
- A gallery sits the same distance below its heading as every other collection section (48px, was 24px). Card Collection, Team Grid, Latest Posts and Pricing Tiers were already at that spacing; the gallery was the only one that wasn't.
- The side navigation is built from the same nav item helper as the bar and mobile menus, so a fix to one reaches all three. Keyboard support arrives with it: Enter and Space now open and close a side nav group, and a group that is already open can be collapsed from the keyboard.
- Hardcoded values throughout the component CSS are tokens. Every border width (49 of them) is `--border-width-sm/md/lg`, the lightbox and video-poster chrome that sits on photography uses a new fixed `--color-*-on-media` / `--color-overlay-media-*` set instead of raw `rgba()`, the CSS `ease` keyword is `--ease-default`, and Carousel's and Bar's remaining magic numbers are named custom properties on the component root. Re-skinning any of these is now one edit. Every substitution was checked to paint identically, so nothing moved except the five deliberate changes noted below.
- A form owns the space between its blocks instead of every field carrying its own bottom margin, so there is no dead space between the last field and whatever follows the form, and the submit button lines up with the fields above it.
- Pages carry one copy of the component CSS instead of two. `renderBlock` resolved `_component` strings through an eager glob of the whole library, duplicating the registry `live-editing.js` already builds for the CloudCannon editor, and both copies were inlined into every page. Inline CSS drops from 50.1 KB to 28.3 KB gzipped per page with no change to rendered markup or first-paint behaviour.
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
- Space between a section's heading block and its content is set with the `spaceBefore` prop rather than a top margin the flow system was already overriding, so Steps, Timeline, Stats and Pricing Comparison sections now render the loose gap their CSS always asked for (24px → 48px). Every other section is unchanged to the pixel.
- Newly inserted blocks start in the same state a composed one gets: the editor's starting values for Divider, Icon, Rating, Testimonial, Choice Group, Segments, Grid, Split, Stack and Custom Section now match the component's own defaults. Segments seeds two options instead of an empty list (its input required at least one), Stack no longer seeds `start` alignment (which cancelled its equal-height rows), and Grid no longer seeds a max item width.
- Page sections default to the `base` background, so a section set to the dark colour scheme without an explicit background paints a ground instead of leaving light text on the page colour.
- Page Header shows breadcrumbs by default, matching the editor's starting value.
- An Alert is announced as a note rather than switching between `alert`, `status` and `note` by variant — page-load content in a live region interrupts a screen reader for no reason, and the role went stale in the Visual Editor.
- A self-advancing Carousel (autoplay or auto-scroll) offers a Pause control and stops while focus is inside it, as WCAG 2.2.2 requires. Its indicator dots are buttons rather than divs, so they can be reached and operated from the keyboard, and the current one is marked `aria-current`.
- Tables no longer force a horizontal pan on mobile when they are narrow enough to fit; the 34rem floor is now a cap.
- Every slot offers a consistent set of components in the picker. Slots are now one of two kinds: a wide slot (a section's content area, a split half, a stack, a carousel slide, a content selector panel) takes every wrapper and building block, and a narrow slot (a card, grid item, masonry item, bento box cell, modal body, accordion panel, step) takes content blocks only. Previously a slot could refuse a component and then accept it one wrapper down: a Bento Box was not offered inside a carousel slide but was offered inside a Stack inside that same slide. `npm run lint:nesting` fails on a slot that refuses something another wrapper it allows would let through.
- A freshly inserted section shows its shape instead of a blank frame. Hero Center, Hero Split, CTA Center, CTA Split, Feature Grid and Feature Split start with plausible copy and a button that points somewhere instead of "Heading text" / "My Button" with an empty link, and Feature Grid, FAQ, Feature Slider and Definition List start with a few real items rather than an empty list that rendered nothing on the canvas. Seeded image alts describe the photo that ships with them rather than saying "Hero image" or "CTA image", and a newly added logo in a Logo Cloud starts with a placeholder alt, so a linked logo is never an unnamed link.
- Feature Grid features expose the icon plate toggle, which the component already read but no editor could reach.
- A Heading set to the "Default" size no longer carries an inert `size-default` class that no rule matches.
- Sections expose a "Lock color scheme" switch, next to Color Scheme in Section settings. Setting a section to Light or Dark and locking it keeps it there when a visitor toggles the site theme, which is what you want behind a photo or video whose contrast is fixed. The option already existed and the demo content already used it; it was just hidden from the editor.
- Generated ids are derived from whatever names the thing they belong to — `input-email`, `modal-book-a-demo`, `dropdown-toggle-navigation-products` — instead of a fresh UUID each render. Two builds of the same content now produce byte-identical HTML, and an id referenced by a `for`, `aria-controls` or `popovertarget` survives a re-render in the Visual Editor. Where nothing names a component and the id still has to be unique on the page (an unlabelled single-open Accordion, an unnamed Modal), a generated suffix remains as a last resort.
- **Heads-up:** Input, Textarea, Select, Date, File Upload and Range share one field shell, so their label, hint and error markup carries `form-field`, `form-field-header`, `form-field-hint`, `form-field-error` and `form-field-required` instead of per-component classes like `input-hint` or `range-required`. Each field keeps its own root class (`.input`, `.range`, and so on) alongside `.form-field`. The required asterisk now has a space before it rather than after.

- Screen readers describe the collection components properly. Carousels and image carousels announce themselves as carousels and their panels as slides, an image carousel's thumbnail strip marks the one being shown, Steps and Timeline keep their list semantics in Safari (which drops them from any list styled without markers), and a Toggle is announced as a switch rather than a checkbox. An icon-only Segments option takes its name from the option label, where before it had none at all, and an avatar showing initials with no alt text is treated as decorative instead of as an unlabelled image.
- Definition List definitions accept markdown, as the documentation already said they did: bold, italic, links, sub- and superscript.
- A Logo Cloud logo's alt text is required, because a linked logo without one is a link with no name.
- The Text block's markdown toolbar no longer offers `h1`. A body-text block sits inside a section that already owns the page's heading, so an `h1` there produced a second top-level heading; use the section's own Heading level control instead.
- **Heads-up:** Range no longer takes `required`. It never did anything — a slider always has a value — and it rendered a required marker next to a field that could not be incomplete. Remove it from any content that sets it.
- **Heads-up:** a List item's text is now a `<span class="item-text">` rather than a `<p>`. A `<p>` inside the item's `<span>` wrapper was invalid HTML, and it was being styled back to `display: inline` anyway, so nothing renders differently.
- Form fields no longer emit `aria-required="false"`. That is already the default, and every field also carries the native `required` attribute.
- A Testimonial is a `<figure>` holding a `<blockquote>` and a `<figcaption>`, which is how a quote with an attribution is marked up. The author's name is no longer wrapped in `<cite>` — that element is for the title of a work, not a person. A testimonial with no author renders no author row instead of an empty one, and a testimonial with no quote renders nothing at all.
- A linked Card covers itself with a stretched link rather than wrapping its whole contents in one. `cardSections` admits buttons, forms and modal triggers, none of which are allowed inside an anchor, and all of which are now clickable in their own right inside a linked card.
- A table's scroll region borrows its name from the caption instead of repeating the text, so a screen reader reads the caption once. Its minimum width scales with the column count rather than a flat 34rem, so a two-column table never pans and a ten-column one is not squeezed.
- Content Selector tab labels and search result titles are no longer headings. Neither is a section title, and both were injecting a run of `h3`s into the page outline.
- Pagination keeps the current page inside the visible window. On the last page the window trimmed it out, so the page you were on rendered as a plain link to itself with no `aria-current`.
- A Segments group with more options than fit scrolls instead of overflowing the form.
- Range puts its unit inside the value readout, so a screen reader announces "60 kg" rather than "60".
- Card Grid cover images with no alt text of their own are decorative rather than repeating the card's heading, which was read out twice.
- An Image Carousel announces the slide you moved to in a live region, and its thumbnails are decorative — the thumbnail button already names itself.
- Masonry columns respond to the container's width, not the viewport, so a masonry in a narrow pane on a wide screen no longer lays out three columns.
- A Bento Box cell's column span is clamped to the grid's column count.
- Blog post dates come from one shared formatter with a configurable locale, rather than three copies of the same `en-US` call.
- Hero Split's root class is `hero-split` (was `hero`), matching Hero Center's `hero-center`. The shared first-child rule in the base stylesheet lists both.
- A Split's root is a `<div>` rather than a nameless `<section>`, which mapped to a generic container anyway.
- The `backgroundColor`, `imageRounded` and `headingLevel` defaults a component uses when composed match the values the editor seeds, so a programmatic use renders like an authored one.
- Section lead paragraphs share one measure, defined once as `.section-subtext`, instead of six sections each carrying their own copy.
- The Logo Cloud heading uses the shared `.eyebrow` treatment instead of re-implementing it, and both carousels derive their accessible name from the section label rather than a fixed string.
- Contact Split names its map iframe after the address it shows, instead of the literal "Map" on every instance.
- The Table, Embed, Icon and Rating pickers offer what the component actually accepts: Embed gains a "None" aspect ratio (already used by Contact Split), Icon's "None" size is a real rule rather than a class matching nothing, and Rating's value can reach the maximum the scale allows.
- A Button's text stays visible in the editor when "Hide text" is on, because that text is the icon-only button's accessible name.
- Submit no longer offers a "Disabled" switch. A permanently disabled submit button is not an authoring choice.
- A Team Grid's supporting copy accepts markdown, matching every sibling section. Footer legal text does too.
- The mobile menu's logo is an image picker rather than a path field.
- Nav dropdowns are clamped to the viewport, so one on the right-most item no longer hangs off the page.
- A mega menu feature card with only an image takes its accessible name from the nav item it sits under.
- The main navigation and footer link their logo home, and render no link at all when there is no logo.
- The theme toggle's sun/moon icons key off the site theme rather than the nearest themed ancestor, so the toggle inside a dark section shows the right icon.
- The table of contents disclosure uses the shared Icon component instead of an inline SVG.
- Steps and Timeline collapse at the canonical 640px breakpoint instead of 500px and 560px.
- **Heads-up:** the Steps and Timeline _page sections_ are now Steps Section and Timeline Section (`page-sections/explainers/steps-section` and `.../timeline-section`), matching FAQ Section and Testimonial Section. Each shared a name with the building block it wraps, which made them indistinguishable in the editor's section picker and impossible to tell apart in a blog post, where MDX addresses a component by its bare filename and the page section silently won. Existing content and MDX need the new `_component` key and the `<StepsSection>` / `<TimelineSection>` tag; the building blocks keep their names. A build now fails with both file paths if two components are ever given the same filename again.
- Imports use one alias per tree. `@components/utils/` is `@component-utils/` and `@components/navigation/` is `@navigation/` — both spellings resolved to the same file, and 26 files used both, in one case on adjacent lines. An ESLint rule holds the line. `@components/` stays as the fallback for a subtree with no alias of its own; the unused `@building-blocks/` alias is gone, since each of its three subtrees has one.
- Images are served as AVIF with a WebP fallback, not WebP alone. The generated AVIF set is 3.7MB against WebP's 9.0MB for the same images, and browsers without AVIF are unaffected.
- A page title drops the site-name suffix rather than overrunning the length search engines display. `titleFormat` adds its suffix to every title, so a long site name silently pushed whole sections of a site over the limit; the page's own title is now what survives.

- The search panel's stylesheet loads when the panel is first reached for, not on every page. Pagefind's Component UI CSS is 32KB and the panel sits behind a button, so it was 18% of every page's render-blocking CSS to style something most visitors never open. Hovering or focusing the search button warms it, so the panel is styled by the time it opens.

### Removed

- The Component Builder, the drag-and-drop page at `/component-docs/component-builder/` that composed building blocks in a sandbox and exported a component package. Prototyping a new section is better served by `npm run new:component`, which scaffolds the same three files with the correct keys and wiring, and by editing them directly. Its dev-only server-rendered preview route goes with it, so `astro.config.mjs` no longer registers a placeholder adapter to keep one route out of the static build, and the `jszip` and `shiki` dependencies are gone.

### Fixed

- A content selector panel merges a caller's `class` instead of letting it replace `content-selector-item`, which would have taken the panel's own layout and tab wiring with it.
- A Video Modal set to the button trigger rendered nothing to click. Only the poster variant worked, so a video modal added from the editor with default settings was an invisible block on the page. Modal now chooses its trigger from the trigger settings rather than from whether a consumer supplied one, because a trigger passed conditionally still counted as supplied even when it rendered nothing.
- A Video Modal plays in the CloudCannon editor. Its video wiring was an inline script, which the editor strips, so opening one on the canvas showed an empty frame; it is now a setup module registered with the rest. Changing the video in the editor also takes effect on the next open instead of replaying the video the page loaded with.
- A Pricing Comparison cell left empty renders empty, instead of the "Not included" cross. A row an editor had not filled in yet was telling customers the feature was absent. Say "no" or "-" to mark something excluded, as the input has always described.
- An Accordion and an Accordion Item keep their own classes when a `class` is passed to them. Previously a caller's class replaced `accordion` / `accordion-item` outright, which dropped the component's styling.
- Dismissing the announcement bar no longer depends on storage being readable. In a private window, or with site data blocked, reading it throws, and that left the close button wired to nothing. Closing now always works; only the "stay dismissed" part is skipped.
- The mobile menu's logo falls back to "Logo" rather than the starter's own name, so an unnamed logo is not announced as "Astro Component Starter" on a site that is not this one.
- Pricing Tiers no longer emits a stray `layout="center"` attribute into the page. It was a leftover from Grid's old layout prop and had no effect.
- A Footer keeps its own class when a `class` is passed to it, instead of the caller's class replacing `footer`.
- A hosted video with no title no longer renders the literal word "undefined" as the player frame's accessible name.
- The component catalog no longer lists a parent's layout settings as if they were per-item content props: `aspectRatio` on a card grid item and `lightbox` on a gallery image are wiring the parent passes down, not fields an author fills in.
- A side nav group holding the current page is served open without playing its expand animation, and it animates normally every time after that. The previous version suppressed the animation with a page-wide one-second timer, which also caught navs added later and never re-ran inside the CloudCannon editor.
- A side nav entry with no link renders as plain text instead of a link to `#` that scrolls the page to the top.
- Five small visual corrections fell out of the token sweep: the Range slider's thumb shadow now uses the shared elevation scale on hover and press, Video Modal's poster-button hover fill matches the lightbox's (0.18, was 0.12), the gallery's two secondary-text opacities are one value (0.8), and one Range colour transition runs at 200ms with the rest instead of 180ms.
- Nav dropdown toggles no longer carry an invalid `role="button"`. A hidden checkbox already supports `aria-expanded`, so the role was never needed; radio-based toggles (nested bar items, mobile and side navs) convey the same state through `checked`. The CSS-only, no-JavaScript toggle is unchanged.
- Blog tag archives render one breadcrumb trail instead of two, so the page no longer has two `<nav aria-label="Breadcrumb">` landmarks competing for the same name.
- Testimonial sections on the about and portfolio examples no longer emit a stray `alignmentHorizontal` attribute on their `<section>`.
- A form field with no label has an accessible name. It falls back to the field's placeholder, then its name, so a screen reader announces something other than "edit text, blank".
- Forms are sent as `multipart/form-data` only when they contain a File Upload. Every form was multipart, which some endpoints reject outright and which reads in an audit as a form with nothing to upload.
- A Split keeps collapsing to a single column on a narrow container after an edit in the Visual Editor. Its container-query rule was emitted as a `<style>` beside the component root rather than inside it, and keyed to a per-render id, so the editor's re-render left the rule pointing at an id that no longer existed.
- Production builds no longer ship links to `/component-docs/` guide pages that only exist when the component library is enabled. Every guide slug now renders the same noindex "available in local development" stub, so the Get started, home and why pages keep working in a `npm run build` output.
- Form renders its children again when they are passed as slot content rather than through `formBlocks`. An early-return guard was inverted, so `<Form><Input /></Form>` produced nothing and an empty `<Form />` produced an empty form.
- Date fields keep their default value and min/max limits. The editor stores a full date-and-time value, which a date input silently discards, so every authored default and limit was dropped and the field rendered empty.
- Select shows its placeholder. The placeholder option was never marked selected, so the browser fell through to the first real option and a required Select was already satisfied on load.
- Choice Group and Segments no longer put "required" on the first checkbox of a multi-select group, which asked the visitor to tick that one box rather than pick at least one. The group itself is now marked required instead.
- Textarea, Select, Date, File Upload and Toggle no longer emit a duplicate `id` when one is passed in, which pointed the field's label at the wrapper instead of the control.
- Testimonial quote marks sit on the outside of the quote. Any quote that started or ended with bold, italic, or a link picked up an extra pair of curly quotes around that fragment.
- The mobile menu is no longer reachable by keyboard while closed. Every link in the panel used to stay in the tab order on desktop, so tabbing through a page walked the whole mobile menu first.
- Latest Posts renders no cards when a site has no posts (or no post matching its tag), instead of publishing placeholder "Post title" cards. The placeholders are now shown only inside the CloudCannon editor, where the real posts can't be read.
- Hero Center's larger subtext no longer resizes body copy in Hero Split and Feature Split. The rule was global rather than scoped to the section.
- Video Modal's poster trigger renders inside the component instead of beside it, so it can be selected in the Visual Editor, spaces correctly, and no longer leaves a stray gap.
- Counters respect "reduce motion": the number appears at its final value instead of counting up. Autoplaying video does too, including YouTube and Vimeo embeds, which previously started on their own.
- Counters no longer reflow on first paint — the number is grouped the same way before and after the count-up starts ("1000" no longer jumps to "1,000").
- A modal's focus trap now includes embedded players (`iframe`, `video`, `audio`) and disclosure summaries, so a keyboard user can reach the player in a Video Modal or an embed. Modals also announce themselves as dialogs (`aria-modal`) and return focus to the control that actually opened them when several point at the same modal.
- Card Grid keeps its `items` region in the Visual Editor. In grid mode the region attributes sat on the root element, where the editor's own array-item wiring overwrote them.
- Feature Split drops a block of dead code: a container query that named a container nothing declared, so the portrait corner-flattening it described never applied.
- Definition List items expose one editable region per field instead of two overlapping regions bound to the same one, and no longer repeat roles the `dt`/`dd` elements already carry.
- Content Selector items can be selected and dragged on the canvas in the Visual Editor. Each item is now a real box that overlays the component's grid and re-exposes its tracks, instead of `display: contents`, which left the editor nothing to draw an outline on. Tabs-at-the-start and the narrow-screen accordion are unchanged to the pixel; tabs-on-top now size to their labels and left-pack (with a full-width rule under the strip) rather than sharing the width equally. Content Selector items also seed their subtext, icon, and icon colour, so those inputs show up on a newly added tab.

- Enter and Space open and close a navigation submenu. The keyboard handler was bound to the visible `<label>`, which never receives focus, so the toggle only responded to Space in the desktop bar and to nothing at all in the mobile panel; a second-level panel could not be collapsed from the keyboard anywhere.
- A desktop nav dropdown closes when you tab out of it, instead of staying open over the page.
- The open mobile nav panel contains Tab, so a keyboard user can no longer land on content hidden behind it.
- Content Selector tabs respond to Enter and Space, and keep their `aria-expanded`/`aria-hidden` state, in the CloudCannon editor as well as on the site.
- Toggle shows a focus ring. The ring was drawn on the input, which is `opacity: 0`.
- A horizontal Timeline can be panned from the keyboard — the scroller had no focusable child.
- Components no longer emit prop-driven classes and data attributes on their root element, where the CloudCannon editor's re-render leaves them stale: Alert, Badge, Image, List Item, Rating, Social Links, Table, Range, Card Grid Item, Image Carousel, Steps, Timeline, Announcement Bar, Page Header, Logo Cloud and Pricing Comparison all read their state from a child or from the rendered shape instead. `npm run lint:roots` now fails on a new one.
- Components with an emptied array in the CMS render instead of failing the build. A cleared list arrives as `null`, which a `= []` default does not cover — Social Links, Table, Steps, Timeline, Testimonial Wall, Logo Cloud, Pricing Comparison, Pricing Tiers, Contact Split, Feature Grid, Feature Slider, Stats, Team Grid, Image Carousel, Select, Choice Group and the three navigation components were affected.
- The thumbnail strip in an Image Carousel jumps rather than smooth-scrolls under "reduce motion", and a linked Card no longer scales on hover there.
- Headings no longer crash the CloudCannon Visual Editor (`Astro.locals.headingIds` is missing when a component is re-rendered there).
- Nested page files at `src/content/pages/<section>/index.md` resolve to `/<section>/`.
- Blog posts with an "On this page" sidebar keep the extra-wide images, code blocks, and CTAs in the article. The sidebar has its own column, starts below the post image, and sticks as you scroll; the page grows a step wider so those components still have room to break out of the text measure.

- Pricing Comparison keeps each plan's values in its own column. Plans without a name were dropped from the header while the value cells kept counting from the full list, so one unnamed plan shifted every later column's values onto the wrong plan. An unnamed plan now renders as an empty column, which is what the "one value per plan, in the same order as the plans" contract requires.
- Pricing Comparison's call-to-action row is a table footer rather than the last body row, so it no longer picks up a zebra stripe depending on how many feature rows happen to sit above it.
- More of a section is editable on the canvas: Accordion item titles, Content Selector titles and subtext, a Modal's trigger text, the feature list inside a Pricing Tier, Pricing Comparison's plans and feature rows, and a Contact Split detail that carries a link (previously only the ones without a link could be edited).
- Bindings that ignored the component's own binding props now honour them: an Alert's title, a Table's caption, a Testimonial's author image and a Submit button's text were wired to fixed prop names, so a page section composing one of those under a different name silently edited a key that did not exist.
- Masonry re-measures an item after the editor re-renders it. The measurement watched the item's contents, which the re-render replaces, so editing a card in a masonry Card Grid left the row height it had before the edit.
- The editable-regions docs described a page-level component region that the layout no longer renders, and named the wrong prop for the page-sections array (`sections`, where the code emits `pageSections`).
- Every page has exactly one `<h1>`. The five `/examples/` pages that opened on a normal section had none, and `/why/` had two because a hero followed a page header; both are set with the new **Heading level** control.
- Images inside a section with a locked colour scheme no longer swap to their alternate when a visitor toggles the site theme. A locked section keeps its colours, so its imagery has to as well.
- A Video with an unrecognised type renders nothing instead of a black player with controls that can never play, and warns while authoring.
- An Image with no alt text that is not marked decorative warns while authoring, as does a hosted video with no title and a placed Button that has no link, element or popover target.
- Structured data escapes `<` in its JSON-LD payload, so page content containing a closing script tag can't break out of it.
- A List item added from the picker no longer previews a broken icon.
- A Hidden field's picker preview shows its name rather than an empty value, and the name is required.
- Search results' excerpt highlighting is documented as trusted-index-only at the point it is written to the DOM.
- The mobile menu's Escape handler is bound once for the page rather than once per menu per initialisation, and its overlay container's stacking uses the layer scale rather than a hardcoded `z-index: 9999`.
- The theme toggle listens to the system colour-scheme preference once rather than adding a listener on every view transition.
- Page Header survives a re-render in the Visual Editor where `Astro.url` is unavailable, rendering without breadcrumbs instead of failing the whole section.
- A background image is still offered for Pattern backgrounds, which use the same field. The condition that hides it named only the Image type. (The condition is inert until CloudCannon evaluates these expressions; this makes it correct for when it does.)
- Stack's row-only controls and Split's fixed-width and mobile-order controls declare the conditions that should gate them.
- An input inside a disabled Input field is styled as disabled. The icon variant's shell hid the state.
- `utils/` helpers no longer appear as placeable component keys in the "component not found" warning.

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
