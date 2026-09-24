# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Toggle takes `inputAttributes`, spread onto the `<input>` itself, for attributes a script or `aria-describedby` needs on the control rather than its wrapper.
- Testimonial Bento page section: customer quotes in a bento grid, led by a featured quote. Each quote picks a size (standard, wide, tall, featured, or full width) and a tone (base, surface, accent, highlight, or inverse), and the grid drops to two columns and then one as its container narrows.
- Toggle takes an optional `offLabel`, drawn before the switch, for a two-sided toggle such as "Monthly [switch] Annual". The side that isn't selected is muted. The label also accepts slotted content.
- Feature Split's component library page demonstrates every prop: Reverse, all five image aspect ratios, image corners, and zero to two buttons, alongside the existing Image bleed examples.
- Newsletter Signup's panel background is now configurable with `panelBackgroundColor`: None, Base, Surface (the default, unchanged), Accent, or Highlight. None leaves just the border, so the section's own background or image shows through.
- Gallery Grid's `aspectRatio` adds Portrait (3:4) and Widescreen (16:9) crops alongside Square and Landscape.
- Component docs now show a privacy settings icon next to the dark/light toggle, so visitors can reopen the consent dialog without scrolling to the footer.
- Code Block panels now fade in when switching tabs, matching Content Selector. The tab that's already open on page load doesn't fade in with the rest of the page — only a real switch does; the shared tabs utility now marks the initially-selected panel and clears that marker on the first genuine switch, so a component can opt a switch-in animation out of playing on load without losing it on later switches back to that tab.
- Scroll Deck's docs now demonstrate every prop: grouped examples for `stickyOffset` (all four values), `cardColorScheme` (all three), and `showRail` (both states), replacing the one compound example that changed three props at once.
- The Why page now includes a live Scroll Deck and Scroll Stepper, so both show their sticky/pinning behavior in a real page instead of only the isolated component-docs preview.

### Changed

- The privacy policy is a plain markdown page, `src/content/pages/privacy.md`, with a default policy you edit by hand (or in CloudCannon's content editor). It was a page-builder page with a warning alert and a `starterPrivacyPolicyPlaceholder` flag. Any page with a markdown body now renders it in a readable column.
- Tertiary (outlined) buttons show a clear tint of their text colour on hover and focus, instead of a surface tint that was barely visible against the page. The tint is translucent, so it reads on any background. This applies to every tertiary button.
- The consent banner has no drop shadow and a solid inverse background, dark on a light page and light on a dark one, instead of a faint surface tint. It follows the site theme toggle.
- Consent's buttons are easier to see. On the banner, Accept All and Reject All are equal-weight primary buttons and Customize is outlined; the settings dialog's Accept All and Reject All are outlined instead of blending into the footer.
- The privacy settings dialog uses switches instead of checkboxes for each optional category, with the category's description linked to its switch.
- Pricing Tiers' billing control is a two-sided toggle ("Monthly [switch] Annual (save 17%)") instead of a segmented control with a separate savings chip beside it. The saving (`annualBadge`) now sits in brackets after the annual label, so it reads as belonging to annual billing.
- New Feature Grid sections start with one-word feature titles (Fast, Brandable, Editable) so they don't wrap in a narrow column.
- A newly added Newsletter Signup now defaults to a Base section background, so its Surface panel stands out from the band behind it. Both used to default to Surface, which left the panel visible only by its border. Existing pages keep the value they already store.
- Masonry's `columns` is a select (2–5) instead of a range slider, matching Bento Box and Grid. The prop was a bare number with runtime clamping; it's a CMS-constrained enum now, so the clamping is gone too.
- The home page's closing call to action now keeps its colour scheme when a visitor switches the site theme: it is a dark band in both themes instead of flipping to light in dark mode. The section sets `lockColorScheme`, so the shipped home page demonstrates a section that opts out of the theme toggle.
- Modal behaviour (focus trap, focus restore, the page scroll lock) now attaches to any popover with a `data-modal` attribute instead of the `.modal-popover` class, which is now styling only. The Gallery Grid lightbox and Video Modal's full-screen player use `data-modal` without the class, so restyling `.modal-popover` no longer leaks onto them. A custom full-screen overlay can do the same (`ModalShell` and `Modal` take `sheet={false}`) instead of overriding the modal sheet styles. Every `ModalShell` sets `data-modal` itself, so existing modals need no change.
- Gallery Grid captions are centred under their image.
- Gallery Grid's lightbox is announced with the section heading ("Gallery: Field notes from the coast") instead of a generic "Gallery image", and its id is stable across builds: an unnamed gallery used a random suffix, and two galleries with the same heading shared one id.
- Section and Card backgrounds are CloudCannon structures keyed on `type`: picking Image, Video, or Pattern shows only that type's fields and drops the other types' keys from the content. Page sections share one definition, `.cloudcannon/inputs/background.yml` (which replaces `background-mask.yml`), so a new section's structure value lists it in `_inputs_from_glob`. Pattern backgrounds are seeded with Fade the middle.
- **Breaking:** Video Modal groups its props into two structures. `type`, `videoId`, and `source` move into `media`; `triggerStyle` and the button and poster fields move into `trigger` as `style`, `text`, `variant`, `size`, `iconName`, `image`, `alt`, and `aspectRatio`. The editor now shows only the fields for the chosen video source and trigger style.
- List items show Icon color only once an icon is picked.
- Video shows only the fields that apply, in both the page builder and the MDX snippet: Video ID and Title hide once a local file is picked, Video Source hides once a video ID is entered, Thumbnail and Captions appear only for a local file, and Captions language only once a captions file is set.

### Removed

- `check:placeholders` no longer checks the privacy policy: the `starterPrivacyPolicyPlaceholder` flag and the check that `policyUrl` resolves to a page are gone. Keeping the policy accurate, and `policyUrl` pointing at it, is left to the site owner.
- Consent's persistent floating "Privacy settings" button, stuck to the bottom-right corner of every page once a choice was made. The footer's **Privacy settings** control (and, in the component library, the new sidebar/mobile-nav icon above) is now the only way to reopen it.

### Fixed

- Scroll Stepper's step media works in the Visual Editor. Each image rendered as an editable array item with no array region around it, so CloudCannon replaced every one with a "Failed to render array item" card. The media is now wired to each step's `mediaSections`, in both the desktop and mobile layouts, so the images render and can be selected on the canvas.
- Following a link or going back inside CloudCannon's Visual Editor does a real page load instead of an Astro view-transition swap, so the editor knows which page is open. The live site keeps its view transitions.
- The Mobile nav examples in the component library open inside their preview instead of covering the whole docs page. On a real site the panel still covers the page. All Mobile examples use the largest preview size, like Main Nav's.
- Breadcrumbs with a long current title truncate only the title. The ancestor crumbs used to shrink along with it, which squeezed their links under the separators so the trail looked broken.
- Nav bar dropdowns close on a second click of their trigger instead of closing and immediately reopening, and clicking an item with children inside a dropdown opens it instead of closing the whole menu. Both happened when the bar sat inside a focusable element, such as a component library preview: the press moved focus there, and the tab-out handler treated that as focus leaving the nav.
- Timeline's split layout right-aligns the title and body of entries on the left of the line, matching their date. Heading and Simple Text set their own start alignment, which overrode the side's.
- Pricing Tiers lays three plans out on one row on desktop. The cards were capped at 420px through Grid's max item width, and a capped auto-fill grid counts its columns at that cap, so three plans wrapped two-and-one until about 1300px. Cards still never grow past 420px.
- Eight component library pages (Pricing Comparison, Newsletter Signup, Card Collection, Page Header, Testimonial Wall, Scroll Stepper, Code Block, Simple Text) showed their primary example twice: once at the top of the page and again in the examples list.
- The Gallery Grid lightbox photo can be pinch-zoomed on touch screens, and panned sideways while zoomed. Swiping still changes photos when the photo isn't zoomed in.
- Gallery Grid tiles show the site's focus ring when reached by keyboard, instead of the browser's thin default outline.
- Video Modal's player now sits in the vertical centre of the screen. It was stretched to fill the space below the close button, which pushed the video up and left an empty band under it that didn't close the modal when clicked.
- External-media placeholders now work in the component library. Its pages render through their own shell, which never mounted a Consent instance, and the "Allow all external media" action is bound only where that instance exists — so the button on every Embed, Video, and Video Modal example did nothing. Both shells now mount the same site-wide instance, built from `src/data/`, and a page that renders the Consent example alongside it gives each instance its own settings-dialog id.
- Code Block line numbers now sit on the line they number even when a long line wraps. The numbers were a gutter column of one row per source line, so the first wrapped line pushed every number below it out of step; each number now rides in its own line's flow, indents at the code's edge, and stays in view — pinned with a rule beside it — when an unwrapped long line is scrolled sideways.
- Code Block copied its code with the line breaks lost: shiki separates lines with `<br>`, which carries no text, so `textContent` came back as one long line. Lines are now separated by real newlines, and the line numbers are drawn by the stylesheet rather than written into the code, so they stay out of both the copied text and the inline editor.
- The multi-button Button and Submit examples laid their buttons out as bare siblings, so every button after the first picked up the flow system's block-start margin — a margin on an inline-level control shifts it half a gap down, which left the examples visibly off-centre and made a small button sit lower than a large one. Those examples now wrap their buttons in a Button Group, the container the Button docs already require, and their copyable code shows it.
- Social Links' `size` prop resized the tile but not the icon inside it — the icon's font-size was hardcoded, so switching between `sm` and `md` only changed the padding around an identically-sized glyph. Each size now sets its own icon font-size too.
- Generated share cards lost `&`, `<` and `>` from the titles of posts with a featured image. Measuring where a title wraps needed the text as HTML, and those characters were blanked out rather than escaped — so "Tips & Tricks" shipped as "Tips Tricks". The measurement now escapes them and the card draws the title as written.
- Gallery Grid's lightbox and Scroll Deck's depth cue went dead after an edit in the Visual Editor. Both stamped their "already set up" flag on the component's root element, which CloudCannon keeps while replacing everything inside it, so the re-render's new tiles and cards were skipped — the lightbox could no longer be opened at all. Both flags now live on an element the re-render replaces, and Scroll Deck's observers tear down with it.
- Content Selector's Top navigation tabs hugged the left edge instead of centering, and centering them the obvious way (`justify-content: center`) broke the panel below: its position depended on the tab columns starting at the grid's true edge, which centering no longer guaranteed, so the full-width panel content rendered shifted and clipped. A flexible track on each side of the tab columns centers them without moving where the tracks start, so the panel — and the tab-row's baseline rule, now a plain full-width grid item instead of an overlay hack — both still line up with the container's true edges. `contain: layout` on the panel item was also needed: without it, the panel's oversized sticky child leaked into the grid's own track-sizing pass despite the panel's own `width: 0`.
- The active Top-navigation tab's own underline rendered a pixel below the shared baseline rule instead of over it, so the two read as a faint double line rather than one line with a highlighted segment. The rail (a plain grid item, flush with its row's end edge) and the tab's indicator (`inset-block: 100%`, a pixel outside the tab's own box) were anchored to different edges; the tab's indicator now shares the rail's edge (`inset-block-end: 0`), so it draws over the rail instead of beneath it.
- A mega menu panel collapsed when you clicked its own non-interactive content — a column heading, the padding between links. Focus moves to `<body>` there, which the nav read as focus leaving it.
- Scroll Stepper left a document-wide scroll listener behind on every page navigation, each one re-measuring discarded markup for the rest of the session. It now tears itself down, along with its resize observer and media-query listener, once the component leaves the page.
- Two navs or two modals that derived the same id from their label left the second one unopenable — `<label for>` and `popovertarget` both resolve to the first match. This was reliably visible in the component docs, where every Mobile Nav example shared the default `aria-label`. Ids are now made unique per page.
- The consent dialog showed whatever a visitor last ticked, even when they closed it with Escape or the X instead of saving. Reopening it now re-reads the saved record, so the boxes always match what is in force.
- Scroll Deck's docs page showed its primary example twice — once as the auto-promoted hero preview, again as the first card in the Examples section — because its `index.md` also listed the `primary` slug in the `examples` frontmatter, unlike every other component's docs page. The hero promotion doesn't need the slug listed too.
- With the privacy workflow turned off, every Embed and map still offered an "Allow all external media" button that could never do anything — optional services stay denied when the workflow is off. The placeholder now says the content is unavailable instead of offering a dead control.
- Scroll Deck's `stickyOffset` had no visible effect. `--deck-top` reads `--deck-offset`, but the `.offset-*` class that overrides it lives on `.scroll-deck-layout`, a descendant — a custom property override never flows back up to an ancestor's own reference, so `--deck-top` always used the default. `--deck-offset` is now set on the root via `:has()`, reading the same descendant class. The `none` value also resolved to `top: auto` (no stickiness at all): it used `var(--spacing-none)`, a bare unitless `0`, combined with a length inside the same `calc()` — invalid, so the whole property fell back — and now uses a literal `0px`.
- Scroll Stepper's sticky media overhung into whatever preceded the section on a real page. Centering it used `top: 50%` plus `translate: -50%`, but the translate applies even while the box is still in normal flow (before it's scrolled up far enough to actually stick), shifting it above its own container. The centered offset is now computed in JS as a plain pixel `top` with no translate, so native sticky clamping keeps it inside its container throughout.
- Scroll Stepper held its sticky media frozen for a stretch of extra scrolling after the last step was already centered, instead of releasing it to scroll away with the page. The trailing space reserved after the last step scaled with the number of steps rather than how much room the last step actually needed to reach center; it's now just tall enough for that.
- Scroll Stepper's sticky media centered itself too high, short by half the main nav's height. It read `--main-nav-height` with `parseFloat` on the raw custom-property string ("5rem"), which drops the unit instead of resolving it — unlike a real property such as `top`, a custom property isn't resolved to pixels by `getComputedStyle`. Applying the value to a real property on a probe element and reading that back now resolves it correctly, regardless of what unit `--main-nav-height` is authored in.
- A Timeline mixing entries that have a year with entries that don't emitted an empty heading for the year-less group.
- A page file named so that its id ends in `index` — `appendix.md` — was published at `/app/`. The trailing-`index` rule wasn't anchored to a path segment.
- Every block nested deeper than a page section lost its inline editing in the Visual Editor. A heading inside a Custom Section was not click-to-edit, wrappers that mark their own rows (Grid, Timeline, Steps, Accordion, …) had their content replaced by a red "Failed to render array item" card, and Content Selector panels degraded to a generic "Details" placeholder. The layout had dropped the `data-editable="component"` region wrapping the page's block tree, and that region is what makes CloudCannon re-render an edit by re-invoking the page through Astro — without it the editor falls back to its own array diffing, which tracks a single array level and knows nothing of this starter's `useDefaultEditableBinding` cascade. The region is back, and the duplicate edit control it mints (which sat on top of the first section's own) is hidden in the editor.
- Nothing interactive worked in the component library inside the Visual Editor: code blocks never got their copy button, and every carousel, modal, tab strip, and gallery there was inert. The library renders through its own shell, and only the site shell loaded the editor's live-editing and live-sync scripts. The library shell now loads them too, and renders its blocks through the same component region as the site shell, so a block nested inside a docs example is editable at any depth.
- Page Header rendered without its breadcrumb trail in the Visual Editor — on every page, whether or not an edit had been made. The trail is derived from the page's URL, and CloudCannon re-renders a component by running it in the browser, where `Astro.url` is undefined; the shells now carry the path on `<html data-pathname>` for that render. Breadcrumbs also no longer throws when it has no absolute base to resolve its structured-data URLs against — that crash blanked the whole section once the trail came back.
- Masonry stopped laying out after any edit in the Visual Editor. The editor keeps the `.masonry` element while replacing its items, then syncs its attributes back to the freshly rendered markup — dropping the `data-masonry-enhanced` flag its grid CSS keys on, and leaving the layout observers watching items that had been replaced. The section fell back to plain CSS columns with no row spans. Editor edits now tear the enhancement down and rebuild it, the way carousels already did.
- Scroll Stepper's last step scrolled on past the middle of the media, ending up level with the top of the image before the section released. The trailing space after the last step was sized for a bottom-aligned step (`Screen` height), but `Content`-height steps start centred on the media — half a media-height lower — so they were given twice the runway they needed. Each mode now reserves its own, and the runway is measured against the last step rather than the first, so a last step taller than the others no longer overshoots either.
- Scroll Deck's rail of dots hung below the cards. It centred itself in the viewport while the cards pin near the top of the screen, so on a deck of short cards the rail floated in empty space under the stack. It now centres on the pinned card.
- Timeline's Split layout was broken: every entry rendered its split content twice (the split-specific markup plus a second, unstyled copy meant only for the Vertical/Horizontal layouts, which a stale `!grouped` check let through), and its rail alternation was mostly clobbered anyway — Split's `<ol>` carries both `.timeline-list` and `.timeline-split` so it also matched the Vertical layout's selector, which is more specific and so won the cascade for `.timeline-entry`'s grid columns. Both the duplicate render and the selector collision are fixed.
- Timeline's year-grouped layout collapsed a group's entries into the narrow date column, leaving the rest of the row blank, whenever that group's year was empty (the common case for a leading run of entries before the first `year` is set). With no `.timeline-year` sibling to claim the date column, the entry list auto-placed into it instead of the wide column next to it. Both columns are now assigned explicitly.
- Timeline's Horizontal layout put its scrollbar hard against the entry text; the scroll container now reserves a little space below its content.
- A Timeline entry whose `date`, `year`, `title` or `body` was written unquoted in YAML (`date: 2023`) rendered without it — the value parsed as a number and the component only rendered strings, so the **Split story** docs examples showed a date on the first entry only. Entry values are now coerced to text, and a numeric `year` groups like a quoted one.
- Video Modal's consent prompt had no surface of its own and filled only half the player box, so a YouTube or Vimeo modal opened to a stray line of text and a button floating over the dimmed page. It now renders as a panel filling the player area, like the inline Video placeholder.

### Changed

- Global Privacy Control now does something. The `honorGlobalPrivacyControl` switch could not change any outcome before — this starter is strict opt-in, so an undecided category was already denied with or without it. A browser sending the signal now has its decline recorded on arrival, so the banner never asks a visitor who has already opted out.
- The Button **Icon Colors** example now shows all nine `iconColor` options — `default`, `blue`, `cyan`, `green`, `yellow`, `orange`, `red`, `purple`, `pink` — instead of five of them, each labelled with its colour name.
- Component docs code views show the block tree as a YAML fragment — no `blocks:` key, no `---` fences — and the view is now labelled **YAML Code**. `blocks:` is the docs-examples collection's own field, and the fences framed a partial snippet as a whole file's frontmatter, so a copied snippet was never paste-able anywhere; a page's array is `pageSections`, `contentSections`, or `buttonSections`. The panel now mirrors the Astro one: the tree, nothing about how the example is stored.
- Timeline and Steps demo content no longer tells the starter's own story. The docs examples, the CloudCannon insert defaults, and the About and Services example pages used entries like "The starter became a reusable system" or "Point the starter at your Git repository", which read as instructions rather than placeholder copy; they now carry generic content — a company history, a product roadmap, an order-to-delivery sequence, and a client onboarding sequence.
- Video Modal's docs cover every prop. It had four examples (all YouTube, two sizes, one poster) and now documents each `type` including a local file, all four modal `size`s, the trigger's variants, sizes and icon — including no icon — and each poster crop.
- A Form's success message is an Alert (`variant: success`) instead of the form's own one-off panel styling, and Alert's `role` is now overridable so the message keeps announcing itself as a live region — Astro keeps the first `role` on an element, so a spread one never reached the markup. Form's docs also show that state: the message only unhides when the page is loaded with `?success`, so the docs viewer reveals success messages inside an example.
- Submit's docs examples are forms. They wrapped their buttons in a Button Group to line them up, but `buttonSections` only offers Button, so the arrangement was not one an editor could build; each example is now a Form whose blocks are the submit buttons, which is where a submit belongs and where the spacing comes from the form's own layout.
- Card Collection's masonry example is three columns of nine cards instead of four columns of five. Five evenly-shaped cards in four columns left one column empty and barely staggered the rest, so the layout looked like a plain grid; every card still has a cover, but the covers now mix 4:3, 16:9 and square, which is what makes the ragged column edge visible.
- Latest Posts' docs drop the **Two posts, no view-all button** example. It differed from the auto-generated primary preview only by rendering one fewer card and hiding a button, so the page now shows that preview alone.
- CTA Split's docs drop their image and no-image examples, which only restated the auto-generated primary preview; a **Reversed** example, differing from that preview by `reverse` alone, is all that is left beside it.

### Security

- A policy URL could point off-site. `policyUrl` rejected `//evil.com` and `..` segments but not a backslash, and `/\evil.com` resolves to another origin — so a CloudCannon editor could send visitors off-site from the consent banner's privacy-policy link.

## [2.0.0] - 2026-08-19

A big release: a browsable reference site for every component, site-wide
search, a privacy and consent workflow, automatically drawn share cards, a
much larger library of page sections and building blocks, tooling that
catches editor problems before they ship, and a long list of accessibility
fixes. If you have already built a site on this starter, read the
**Heads-up** items under Changed before upgrading — several change how
things look, and every page section moves to a new path.

### Added

#### Making the starter your own

- `npm run reset:starter` clears the demo posts, pages, logos and navigation out of a fresh copy, and sets your site name and URL — including `siteUrl` in `siteready.config.js`, so a reset site's QA config cannot be left pointing at `example.com` while `src/data/seo.json` says otherwise. `--dry-run` shows the plan first, and it only runs on a clean git tree so you can always undo it.
- `npm run check:placeholders` warns when starter placeholders are still in place — most importantly the `example.com` URL, which otherwise ships and tells Google your site lives at a domain you don't own. A checked data file that exists but cannot be read or parsed exits non-zero and names the file, rather than reporting success.
- A deployment guide at `docs/DEPLOYMENT.md` for getting the site live on CloudCannon.
- A `LICENSE` file. The README and `package.json` both said MIT, but the licence text itself was missing.
- Guides for people and AI agents working on the project: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and `docs/ARCHITECTURE.md`.
- Icon and asset provenance is recorded. `src/icons/LICENSE-heroicons.txt` carries the MIT licence for the 324 Heroicons files, and `src/icons/README.md` states the icon set's source and house style, records the 19 remaining SVGs (the 17 `social/*` brand marks plus `ltr.svg`/`rtl.svg`) as third-party assets whose provenance is unrecorded, and notes `public/videos/component-docs/glass.mp4` as provenance-unrecorded.

#### Privacy and consent

- A site-wide privacy and consent workflow, editable in CloudCannon's new Privacy & Consent and Analytics data panels. One strict opt-in policy applies to every visitor: optional analytics and external media stay off by default (and stay off when the workflow is disabled); the first layer gives **Accept All**, **Reject All**, and **Customize** equal prominence; and the preference centre identifies necessary storage as always on, manages optional purposes separately, and repeats the bulk choices for easy withdrawal. The footer or persistent control reopens those settings later. Hosted video, maps, and raw embed content wait for site-wide external-media approval, provider URLs are restricted to known embed paths, and YouTube uses Privacy Enhanced Mode when loaded. The starter includes a launch-blocking privacy-policy scaffold, the current site-specific Plausible script integration, and an isolated interactive example in the component docs.

#### A reference site for every component

- Every component gets its own documentation page automatically, with a live example and a table of its options. You can still add longer notes and extra examples on top.
- A gallery at `/component-docs/` for browsing the whole library.
- Preview thumbnails for every component, so CloudCannon's "add section" menu shows you what you are picking instead of a list of names.
- Component docs collapse a property's child properties behind a disclosure showing how many there are, so a prop tree several levels deep (a nav item's `megaMenu`, its columns, their links) no longer buries the component's own props. Arrays offering more than one item type list each type as its own disclosure.
- Stack and Grid describe themselves in contrast, so the choice between them is clear at the point you make it: Stack is "a few different blocks in a row or column, one even gap", Grid is "many items of the same kind, in as many columns as fit". Both docs pages now point at the other, and the component catalog gains a short guide to choosing between Grid, Stack, Card Grid, Bento Box, and Masonry.
- Authoring recipes for integration directories, logo-only integration proof, trust metrics, and two-product comparisons, using the existing Card Collection, Logo Cloud, Stats, and Pricing Comparison sections.

#### Being found: search, feeds and sharing

- Site search lives in the navigation bar: a search button — or Cmd/Ctrl+K — opens a modal with results as you type, filters for pages and blog posts, and article thumbnails. Turn it on with `search: true` in the main navigation data. It replaces the old `/search/` page, and follows the theme toggle like everything else.
- An RSS feed at `/rss.xml`, linked from every page so feed readers find it on their own.
- `llms.txt` is generated at build time from the content collections, so it lists every indexable page instead of falling behind as pages are added. It skips `noindex` pages, matching the sitemap.
- Blog posts and pages now describe themselves to search engines — title, author, date, tags — so posts can qualify for richer search results. Posts also include a Home › Blog › title trail as structured data, even though the visible chrome is a back link.
- Share cards are drawn automatically for every page and blog post, so a site shares properly without anyone uploading a 1200x630 image. The card carries the site logo and name, the page title, a brand-coloured rule and the description, using the site's own fonts and theme colours, so it follows a rebrand with no extra edit. An entry's own **Image** becomes the card's full-bleed background, with the logo, title and site address each on a solid plate so they stay readable over any photo. The **Share card generation** setting in `seo.json` scopes generation to blog posts only, or turns it off in favour of the site-wide sharing image, and **Share card theme** draws them with the site's light or dark colours — on a photo card that sets the plates behind the text, so Light gives black plates with white text and Dark gives white plates with black text. A **Share image** field on the SEO data file takes a 1200x630 raster for the site-wide card, because social networks cannot render an SVG logo; leave it blank to keep falling back to the logo, and `npm run dev` warns when that fallback is an SVG. Cards render at build time with no browser and no network, and are cached between builds.
- Search engines are told they may show large image previews and full-length snippets, which they otherwise cut short.

#### Tools that catch mistakes before you ship

Most of these catch problems that used to build cleanly and look fine, while
leaving the site quietly broken in the editor.

- `npm run lint:cms` checks the visual editor setup against the actual components — a renamed option, a field that would never show up on a new block, a missing file, or a page-section option left out of the content / section-settings groups. It also validates the props in page content, so a renamed prop no longer leaves a stale value behind in `src/content/` where nothing reports it, and it fails on a component whose behaviour would be dead in the editor: CloudCannon renders components with `renderToStaticMarkup`, which strips inline `<script>` tags, so a scripted component must either register a `setup.ts` in `editor-live-sync.js` or be listed in the linter's `EDITOR_INERT` map with the reason inert is acceptable.
- `npm run lint:roots` fails on prop-driven `class`/`style`/`data-*` on a component root CloudCannon can make a region root — the editor's re-render keeps the root, so the attribute goes stale — and on a literal `data-editable` on a root, which collides with the region attribute the editor stamps there.
- `npm run lint:schema` checks the editor configuration against CloudCannon's own rules, catching invalid settings and wrong icon names.
- `npm run lint:css-vars` checks that every design token you use actually exists. A mistyped token name is silently ignored, so it never looks like an error.
- `npm run icons:sync` and `npm run icons:check` keep the icon picker in step with the icon files, a list that was previously maintained by hand.
- `npm run previews:check` catches a missing or stale preview thumbnail, and `npm run previews:montage` renders them all onto one sheet for review.
- `npm run docs:check` checks the documentation against the components it documents.
- `npm run typecheck` and `npm run test:unit` cover types and the shared helper code.
- `npm run test:smoke` drives a real browser over the built site to confirm the accordion, modal, carousel, mobile menu, theme toggle and search all still work.
- `npm run test:render` builds a page containing every component, so one that stops rendering fails the build.
- `npm run test:css-parity` proves the per-page CSS pruning under Changed removed nothing that renders. It builds the site twice — once with `PRUNE_CSS=0` — and compares the full computed style of every element and its `::before`/`::after`/`::marker`/`::placeholder`, plus every bounding box, across all pages, at three viewports, in both colour schemes, before and after clicking every stateful control. `CSS_PARITY_EDITOR=1` runs the same comparison with the editor's full stylesheet loaded.
- `npm run check:quick` runs the three checks that catch real mistakes in seconds (`lint:cms`, `lint:css-vars`, `astro check`), for use while working; `npm run check` is still what a finished change has to pass.
- `npm run editor` builds the site and serves the real CloudCannon editor against `dist/`, printing the build time on start — the editor reads `dist/`, so a stale build is otherwise invisible.
- `npm run new:component` scaffolds a new component's files and tells you the remaining steps.
- Editor autocomplete in VS Code for both the CloudCannon config and the design tokens.
- CI runs the checks that shipped but had no job, and fails on a re-acquired advisory. A CSS parity job builds the site twice (once with `PRUNE_CSS=0`) and proves the per-page CSS pruning removed nothing that renders; the browser job runs the dead-margin detector against its built site; and a blocking `npm audit --audit-level=high` job makes a new advisory un-ignorable, which matters because the eight advisories this release clears were removed by hand. Every action is pinned to a commit SHA, the workflow runs with a least-privilege `contents: read` token, lockfile verification calls `npm run deps:check` instead of duplicating it, and Dependabot opens grouped weekly updates for npm and GitHub Actions.

#### New page sections

- Page Header — the slim title block interior pages open with: a heading, optional eyebrow and intro, and a breadcrumb trail taken from the URL. Nested pages link to their parents; the home page hides the trail. Breadcrumbs are no longer blog-only.
- Stats — a row of large count-up numbers with labels, optional extra lines, and dividers that turn into rules when the row stacks.
- Steps — a numbered how-it-works sequence, as a full-width section or as a building block you can drop inside something else. Each step has its own stretch of the connecting line, which stops at the last marker.
- Timeline — a dated sequence on a rail, as a section or a building block. Matching years group together. Vertical entries share one line; horizontal ones scroll. Timeline Split alternates events around a centre rail, with optional icons, a dot fallback, and a single-rail mobile layout.
- Logo Cloud — a "trusted by" strip of client logos, height-matched and optionally grey. Linked logos restore colour on hover, or scale up slightly in full colour. Can also scroll as a continuous marquee; visitors who prefer reduced motion see a still strip. Ships with six placeholder logos.
- Testimonial Wall — several quotes at once as cards in a masonry layout, so uneven lengths pack tightly while reading order stays left-to-right.
- Pricing Tiers — plan cards with included and excluded features, a call to action on each, an optional highlighted "Most popular" plan, and an optional monthly/annual switch.
- Pricing Comparison — the feature-by-feature table that sits next to those cards. Plans are columns, each feature is a tick, a dash, or a short note, and a highlighted plan gets the primary button.
- Contact Split — contact details (address, phone, email, hours) beside a form, with an optional map.
- Latest Posts — the newest blog posts as cards, with an optional tag filter and a view-all button. Posts are chosen at build time; the visual editor shows placeholders.
- Gallery Grid — a captioned image grid, two to five columns, as a regular grid or masonry. Opening a photo shows a lightbox on that image — arrows, caption and close sit on the photo — with keyboard, swipe, and click-outside to dismiss.
- Card Collection — a grid of linked cards with optional covers and an open body, so a badge, date or author is just another building block. Two to four columns, grid or masonry. Nested links (a category badge) stay their own targets.
- Newsletter Signup — a focused, endpoint-agnostic email form with editable consent text and responsive band or card layouts. It uses native email validation and autocomplete, so it works without JavaScript.

#### New building blocks

- Card Grid — the layout Card Collection, Latest Posts and Team Grid share: a fixed number of columns (or masonry) of open cards. Not the auto-fit Grid used by Feature Grid and freeform layouts.
- Masonry — a Pinterest-style column layout that keeps reading order. Falls back without JavaScript, and uses the browser's native masonry where it exists.
- Stack — a row or column of mixed blocks with one even gap, with direction, gap, distribution, alignment, wrap, and stack-on-mobile controls.
- Scroll Deck — equal-height cards in one track, each matching the tallest card and pinning a little lower than the last, so scrolling slides every card up over the one before it and the covered cards show as dimmed paper edges above. On desktop, each card begins below the viewport so the opening view shows one card. A rail of anchor links marks the card on top, lets a keyboard user jump between them, and scrolls away with the stack at its release point. The next section fills the final sticky runway rather than leaving a blank gap below the deck. Cards take the same content as a carousel slide. Below 768px nothing pins, the rail is hidden and the cards stack flat.
- Scroll Stepper — each step's editable message moves through a short desktop scroll track beside sticky media that crossfades with it. Compact steps meet halfway around the media's vertical centre, so the new message enters below it as the previous message leaves above it. A trailing runway holds the media through the final step and only the active message is shown. The desktop progress bar advances continuously through the final message; dots mark the active step. **Screen** uses its actual scroll container as the viewport, with each message entering from its lower edge before moving through the media. A 640px container query changes the wrapper to a single-column sequence of paired media and messages when its available width gets narrow, even on a wider viewport. Media can sit on either side.
- Code Block — escaped code for pages and MDX, with optional language and caption labels, line numbers, long-line wrapping, and an accessible copy button enabled by default.
- Badge — a pill for statuses, tags and announcements. Status colours plus a plain and accent look, three sizes, an optional icon or dot, and an optional link.
- Alert — a status callout (info, success, warning, danger, note) with a markdown body, insertable into blog posts. Warning and danger announce themselves to screen readers.
- Rating — star ratings with half stars, an optional number, and a colour option. Read as a single value by screen readers.
- Table — caption, header row, optional row headers, striped and compact. Ragged rows fill empty cells instead of collapsing. Small screens pan sideways with the first column pinned.
- Social Links — a row of social icons in a quiet or brand-colour style, using the same data as the footer.

#### New options

- An announcement bar shown above the navigation on every page, driven by `src/data/announcementBar.json` and editable in CloudCannon under Data. Write the message in Markdown, with a link for an optional call to action; closing the bar hides it for that visitor until the message changes, so a new announcement brings it back for everyone.
- Tag pages show a Home › Blog › tag trail above the title, replacing the old "All posts" link. Long titles are shortened to keep the trail on one line, and small screens swap it for a single link back to the blog. The Home label is editable in CloudCannon under Data.
- Blog posts show an "On this page" list of headings by default — a sticky sidebar on wide screens, a collapsed disclosure on small ones. Turn it off with `showToc: false` in the post.
- Backgrounds can be a repeating tiled pattern as well as an image or video, on Card, Custom Section and every page section. Pick the tile with the usual image picker and choose a tile size; the overlay and background colour still apply, so patterns with transparency show the background colour through. A `mask` option fades a named part of the media (top, bottom, left, right, the middle, the edges, or top and bottom together) to the background colour token, so a directional fade on a photo or video acts as a theme-correct scrim with no hardcoded gradient. Patterns default to fading the middle, so texture never sits behind the content.
- The Video component gained autoplay and loop options for all three source types. Autoplayed video starts muted, since browsers refuse it otherwise. Video takes a **Captions** file (WebVTT) and a **Captions language**, rendered as a default `<track kind="captions">` on locally hosted video, with the track's menu label derived from the language tag.
- Video Modal can open from a poster image with a play button, the treatment hero and feature media usually want.
- Form fields take a `hint` for help text under the field, and an `error` for validation messages. Choice Group takes the same **Hint** and **Error** text, wired to the group with `aria-describedby`.
- Form fields carry an `autocomplete` value so browsers and password managers can fill them (WCAG 1.3.5). Input, Textarea, Select and Date take an explicit **Autocomplete** input, a picker of the common tokens labelled in plain language ("Last name", "City or suburb") with the token itself shown underneath, so a hint can't be lost to a typo the browser ignores in silence; anything the list doesn't cover, including compound values like `shipping street-address`, can still be typed in. Leave it blank and one is derived from the field's own type and name — `email`, `tel`, `given-name`, `organization`, `postal-code` and the rest of the common set. Anything ambiguous is left alone rather than guessed, because a wrong token autofills the wrong value.
- An invalid form says why under the field it belongs to, instead of leaving it to the browser's transient bubble. The message is wired to the control with `aria-describedby`, the control is marked `aria-invalid`, focus moves to the first problem, and the message clears as soon as the field becomes valid. With JavaScript off, the browser's own validation still blocks the submit.
- Form takes a **Method** (POST or GET), a **Honeypot name** for a decoy field that spam bots fill in and visitors never see (your form endpoint has to reject submissions carrying it), and a **Success message** shown when the visitor is sent back to the page with `?success` in the URL — point your endpoint's redirect at that.
- Mega menu support in the main navigation: a top-level `navData` item can carry a `megaMenu` object — columns of icon + description links plus an optional feature card — rendered as a full-width panel on desktop and flattened into grouped links in the mobile menu. Editable in CloudCannon via the new "Mega Menu Item" structure, offered on `mainNav.json` and on the Main Nav and Bar components. The Side and Mobile components don't offer it, because neither opens a panel of its own. A feature card with only an image takes its accessible name from the nav item it sits under.
- Card and Custom Section backgrounds can stay fixed while the page scrolls, falling back to a normal background for anyone who prefers reduced motion.
- Carousel gained pause-on-hover, a starting slide, a thumbnail indicator, and an event when the selected slide changes. Image gained `decorative` for images screen readers should skip. Button passes `aria-pressed` through so it can act as a toggle button.
- Cards can pin their colour scheme against the visitor's theme toggle, as Custom Section already could.
- Warning is now a first-class status colour, with matching background and border tokens in both themes, and the missing success border token is filled in. Shared thin and medium border widths cover the rails on Steps and Timeline.
- `imageBleed` on Feature Split and Hero Split: the image column runs to the viewport edge, cropped by aspect ratio.
- A `spaceBefore` input (`none`/`tight`/`default`/`loose`) on every stackable building block, backed by four new `--space-before-*` tokens, for overriding the space above a block without Spacers or custom CSS.
- Every page section with a heading takes a **Heading level** control (`headingLevel`, under Section settings). Heroes and Page Header default to `h1`; every other section defaults to `h2`, so a page that opens on a normal section can promote that section's heading to the page's `h1` without adding a header band. Sections that render their own item headings (Feature Grid, Team Grid, Pricing Tiers) derive theirs one level down, so the outline never skips a level.
- Every page carries a "Skip to main content" link, revealed on the first Tab, so a keyboard user can jump past the navigation.
- Textarea takes a **Rows** control for how many lines it shows before it scrolls. Testimonial takes an **Avatar size** in pixels — the photo is requested at that size, so a dense layout gets a smaller file rather than a large one scaled down in CSS. Hero Split takes the **Rounded image** toggle Feature Split already had. Modal takes a **Heading level**, so its title fits the outline of the page it opens from. Social Links takes a **Landmark name**, so two sets of social links on one page are distinguishable.
- Blog post dates come from one shared formatter with a configurable locale, rather than three copies of the same `en-US` call.

### Changed

#### Page sections

- **Heads-up:** page sections are grouped by the job they do on a page — heroes, explainers (was features and info-blocks), proof (was social-proof and testimonials), conversion (was CTAs, pricing and contact), collections (was blog, galleries and team), and builders. The group is part of each section's path, so existing pages need a find-and-replace — for example `page-sections/ctas/cta-center` becomes `page-sections/conversion/cta-center`, and `page-sections/features/feature-grid` becomes `page-sections/explainers/feature-grid`. Component docs URLs move the same way. The `@features` import alias is now `@explainers`.
- **Heads-up:** the Steps and Timeline _page sections_ are now Steps Section and Timeline Section (`page-sections/explainers/steps-section` and `.../timeline-section`), matching FAQ Section and Testimonial Section. Each shared a name with the building block it wraps, which made them indistinguishable in the editor's section picker and impossible to tell apart in a blog post, where MDX addresses a component by its bare filename and the page section silently won. Existing content and MDX need the new `_component` key and the `<StepsSection>` / `<TimelineSection>` tag; the building blocks keep their names. A build now fails with both file paths if two components are ever given the same filename again.
- **Heads-up:** Team Grid's start/center layout option is gone — a fixed number of columns does not need it. Card Collection, Latest Posts and Team Grid now share one card layout. Card Collection still holds a curated list; Latest Posts still fetches posts; Team Grid still has name, role and bio fields. Adding Team Grid from the picker starts with three people, matching the three-column layout.
- Page-section editing panels put content fields first, with the shared shell settings (width, padding, colour scheme, background) in a collapsed group underneath. Data files are unchanged — this only reorders the editor. Component docs match that grouping.

#### Framework and dependencies

- Upgraded to **Astro 7**, with every other dependency on its latest release, bar two deliberate holds. `prettier-plugin-astro` is pinned to exactly `1.0.0`, because `1.0.1` is not idempotent: every `prettier --write` produces a different file, so `prettier --check .` never converges and `npm run check` cannot pass. TypeScript stays on `6.0.3`, the latest 6.x, rather than 7: `@typescript-eslint` requires `>=4.8.4 <6.1.0` and `@astrojs/check` requires `^5.0.0 || ^6.0.0`, so 7 would break `npm run lint:js` and `npm run typecheck`. The lockfile was re-resolved from scratch, so transitive dependencies landed on their newest release inside the declared ranges too, and `npm audit` reports zero advisories.
- The `engines` range is `^22.12.0 || ^24.0.0 || ^26.0.0`, so an odd-numbered Node release no longer satisfies the declared floor and then breaks the test runner. The repo pins `24.18.0` in `.nvmrc`, which is what CI uses.
- `package.json` describes the project as what it is — a component starter for CloudCannon visual editing — and records the two install scripts this tree runs (`esbuild` and `fsevents`) in its `allowScripts` field: advisory on npm 11, but npm 12 skips unreviewed install scripts outright, so the entries keep esbuild's postinstall running after that upgrade. `postcss-selector-parser`, which the production CSS pruner imports, is declared in `devDependencies` instead of resolving only as a transitive hoist from a linter, and `js-beautify` moved to `devDependencies` beside the component docs that are its only consumer.
- Icons are built into the project instead of coming from the `astro-icon` package, which has been unmaintained for well over a year and was written for an older Astro. Icons look and behave the same, and a mistyped icon name now warns you while you work instead of failing the build.
- The icon list and the autocomplete token list are datasets under `.cloudcannon/data/`, registered in `data_config` and referenced as `values: data.icons` / `values: data.autocomplete_tokens`, instead of a 740-line `_select_data` block inside `cloudcannon.config.yml`. The config drops from 951 lines to 216, so the collections, inputs and globs that actually configure the site are readable without scrolling past 343 icon names. `npm run icons:sync` writes the data file rather than splicing a line range in the config.
- Accessibility, SEO, link and performance checking now happens with a separate tool outside this repository, so the partial version that lived here has been removed. Nothing in the project or its CI catches accessibility regressions any more.
- Agent instructions live in `.agents/skills/`. Cursor reads that folder directly; they are still copied to the Claude folder for Claude Code.

#### Search

- Site search now works locally: `npm run build` creates the search index, so `npm run preview` gives you working search, and `npm run search:dev` carries the index over to `npm run dev`. Previously search only ever worked once deployed, and found nothing locally with nothing to explain why.
- The search panel's stylesheet loads when the panel is first reached for, not on every page. Pagefind's Component UI CSS is 32KB and the panel sits behind a button, so it was 18% of every page's render-blocking CSS to style something most visitors never open. Hovering or focusing the search button warms it, so the panel is styled by the time it opens.

#### Look and feel

- **Heads-up:** spacing between blocks is now the flow system: each block type carries a default space-before (headings loose, text tight, collection wrappers loose) and first children sit flush automatically. Building blocks no longer carry a hidden top margin, the per-wrapper first-child margin strips are gone, a Spacer now _replaces_ the gap between its neighbours rather than adding to a hidden margin (so existing Spacer gaps render tighter), and components embedded in blog post bodies space themselves against the surrounding prose. The space between a section's heading block and its content is set with the `spaceBefore` prop rather than a top margin the flow system was already overriding, so Steps, Timeline, Stats, Pricing Comparison and Gallery Grid sections now render the loose 48px gap their CSS always asked for (was 24px). A form owns the space between its blocks instead of every field carrying its own bottom margin, so there is no dead space between the last field and whatever follows the form.
- **Heads-up:** light-theme link colours changed. The placeholder pure blues are now accessible blues that meet contrast requirements. Dark-theme links are unchanged.
- **Heads-up:** the grey design tokens were renamed from `--gray-0…12` to `--gray-50…950`, matching every other colour. The colours themselves are identical — only the names changed, so a brand's grey scale can be pasted straight in. `npm run lint:css-vars` finds any old names you miss.
- **Heads-up:** the colour palette is now complete, with a full range for all eight colours. Most things look the same; what shifts is the icon background tints, the green and yellow icon colours, and the dark theme's accent section backgrounds.
- **Heads-up:** layout breakpoints are standardised on 640px and 768px. Steps and Timeline were the last holdouts with their own values nearby, so a few layouts now change shape at slightly different widths.
- Hardcoded values throughout the component CSS are tokens. Every border width (49 of them) is `--border-width-sm/md/lg`, the lightbox and video-poster chrome that sits on photography uses a new fixed `--color-*-on-media` / `--color-overlay-media-*` set instead of raw `rgba()`, the CSS `ease` keyword is `--ease-default`, and Carousel's and Bar's remaining magic numbers are named custom properties on the component root. Re-skinning any of these is now one edit. Every substitution was checked to paint identically, bar five deliberate corrections: the Range slider's thumb shadow now uses the shared elevation scale on hover and press, Video Modal's poster-button hover fill matches the lightbox's (0.18, was 0.12), the gallery's two secondary-text opacities are one value (0.8), and one Range colour transition runs at 200ms with the rest instead of 180ms.
- h2 and h3 headings now get a linkable id from their text when you don't set one, so sections can be cited. Duplicate titles on the same page get a number on the end. Page titles (h1) are left alone.
- Video Modal's close control sits above the player on a dark overlay, and clicking the overlay closes it. The old sheet put the control on the video, where a YouTube or Vimeo player covered it. It also defaults to extra-large instead of large.
- The placeholder image is a photo glyph on a warm grey field, so it still reads as a stand-in when a card crops it. The old corner-to-corner X looked broken once a 16:9 file was covered to 4:3.
- Component picker short descriptions and component-docs overviews are rewritten in simpler language.
- Focus outlines are consistent everywhere, and clicking with a mouse no longer leaves one behind.
- Fonts are served from your own site rather than fetched from Google at build time.
- Code in blog posts uses the theme's monospaced font instead of whatever the browser picked, and inline code in markdown text renders as a subtle rounded pill that darkens the surrounding background in light mode and lightens it in dark mode, so it stays visible on accent, highlight, and surface sections as well as the page background. Snippets that wrap keep the pill on every line, and table cells get the same treatment.
- Blog listing headings say which list you are looking at. Every tag page and every page of the blog said "All posts".
- Blog posts open with a back link, then the title, subtitle, and one muted line for category, date and author. The category links to its tag archive. The hero image is 16:9. Tags sit at the end of the article as badges, not in the header.
- Component preview thumbnails were all redrawn to look like one family, and they follow light or dark mode.
- Secondary buttons use the lighter surface fill instead of muted gray, so they sit closer to the page background. Hover still steps to muted.
- The sticky main nav casts a subtle shadow once it pins, so it separates from the content sliding under it. Works in every browser, including the CloudCannon editor; without JavaScript the nav simply has no shadow.
- The main navigation publishes its bar height as `--main-nav-height`, and the blog table of contents reads it instead of repeating `5rem`. Anything sticky can now clear the nav with `var(--main-nav-height, 0px)`, which falls back to zero on a site that removes the nav.
- Demo content is a small product site for the starter — home, why, and get started — plus labeled example pages under `/examples/` (pricing, about, services, portfolio, contact) and a demo blog. The homepage leads with the developer/editor split, uses the 2.0 sections (stats, steps) instead of stacking four feature-splits, and drops the fake-company logo cloud (it lives on the services example instead); every page section now appears in use on a real page. Example pages open on their real first section instead of an "Example / copy this as a starting point" page header, feature-grid cards put the icon on the same line as the title, and the homepage stats and principles sections use a fine dot-lattice background pattern that fades behind the content, with the closing CTA on a blueprint-style grid.
- The README leads with the live demo and screenshots, and documents the tooling, the scaffolder and deployment.

#### Performance

- Each page carries only the component CSS its own markup uses, in one copy. Every page is built by one catch-all route, so Astro was inlining the union of the whole component library into all of them — twice, because `renderBlock` and the editor's `live-editing.js` each built the registry. Inline CSS is down 45% on the homepage (142KB to 79KB) and 49% across the site, and total HTML is 39.6% smaller (34.0% gzipped). On a cold Slow 4G load that is 1.26s off first contentful paint and 1.24s off largest contentful paint. Pages still inline their CSS rather than linking it, so the saving costs no extra render-blocking request, and the pruner warns rather than guessing when a linked script cannot be read. `npm run test:css-parity` proves nothing that renders was removed.

#### Authoring and the editor

- **Heads-up:** Grid now takes `columns` (`auto`, or `2`–`6` — same lattice and mobile collapse as Card Grid) instead of `layout`; `minItemWidth`/`maxItemWidth` apply to auto columns only, and `maxItemWidth` now actually caps item width. Centered content-sized rows — the old `layout: center` — are Stack's job now.
- **Heads-up:** Input, Textarea, Select, Date, File Upload and Range share one field shell, so their label, hint and error markup carries `form-field`, `form-field-header`, `form-field-hint`, `form-field-error` and `form-field-required` instead of per-component classes like `input-hint` or `range-required`. Each field keeps its own root class (`.input`, `.range`, and so on) alongside `.form-field`. The required asterisk now has a space before it rather than after.
- **Heads-up:** Range no longer takes `required`. It never did anything — a slider always has a value — and it rendered a required marker next to a field that could not be incomplete. Remove it from any content that sets it.
- **Heads-up:** a List item's text is now a `<span class="item-text">` rather than a `<p>`. A `<p>` inside the item's `<span>` wrapper was invalid HTML, and it was being styled back to `display: inline` anyway, so nothing renders differently.
- **Heads-up:** Hero Split's root class is `hero-split` (was `hero`), matching Hero Center's `hero-center`. The shared first-child rule in the base stylesheet lists both.
- A page title drops the site-name suffix rather than overrunning the length search engines display. `titleFormat` adds its suffix to every title, so a long site name silently pushed whole sections of a site over the limit; the page's own title is now what survives.
- Generated ids are derived from whatever names the thing they belong to — `input-email`, `modal-book-a-demo`, `dropdown-toggle-navigation-products` — instead of a fresh UUID each render. Two builds of the same content now produce byte-identical HTML, and an id referenced by a `for`, `aria-controls` or `popovertarget` survives a re-render in the Visual Editor. Where nothing names a component and the id still has to be unique on the page (an unlabelled single-open Accordion, an unnamed Modal), a generated suffix remains as a last resort.
- Every slot offers a consistent set of components in the picker. Slots are now one of two kinds: a wide slot (a section's content area, a split half, a stack, a carousel slide, a content selector panel) takes every wrapper and building block, and a narrow slot (a card, grid item, masonry item, bento box cell, modal body, accordion panel, step) takes content blocks only. Previously a slot could refuse a component and then accept it one wrapper down: a Bento Box was not offered inside a carousel slide but was offered inside a Stack inside that same slide. `npm run lint:nesting` fails on a slot that refuses something another wrapper it allows would let through.
- A freshly inserted block or section starts in the same state a composed one gets. The editor's starting values now match each component's own defaults (Divider, Icon, Rating, Testimonial, Choice Group, Segments, Grid, Split, Stack, Custom Section, and the `backgroundColor`, `imageRounded` and `headingLevel` a component uses when composed), Segments seeds two options instead of an empty list, and Hero Center, Hero Split, CTA Center, CTA Split, Feature Grid and Feature Split start with plausible copy and a button that points somewhere instead of "Heading text" / "My Button" with an empty link. Feature Grid, FAQ, Feature Slider and Definition List start with a few real items rather than an empty list that rendered nothing on the canvas. Seeded image alts describe the photo that ships with them, and a newly added logo in a Logo Cloud starts with a placeholder alt, so a linked logo is never an unnamed link. Page Header shows breadcrumbs by default, matching the editor's starting value.
- Grid's numbered columns, Stack's stack-on-mobile and Masonry's columns respond to their container's width, not the viewport, so each collapses correctly inside a narrow pane on a wide screen.
- Hosted videos mount a click-to-play facade again. Once the visitor grants external-media permission, a YouTube or Vimeo video renders `lite-youtube` / `lite-vimeo`: the provider poster loads with the facade, but the player itself is fetched only when someone presses play, so a page with several videos no longer pulls a full player iframe for each, and each facade library loads only if that kind of video is actually on the page. The strict opt-in policy is unchanged: nothing is requested before permission, and revoking it returns the prompt. An autoplaying YouTube video still mounts a plain `youtube-nocookie` iframe, because the facade pins `autoplay=0` in its embed URL.
- The Text block's markdown toolbar no longer offers `h1`. A body-text block sits inside a section that already owns the page's heading, so an `h1` there produced a second top-level heading; use the section's own Heading level control instead.
- A Logo Cloud logo's alt text is required, because a linked logo without one is a link with no name.
- Submit no longer offers a "Disabled" switch. A permanently disabled submit button is not an authoring choice.
- A Team Grid's supporting copy accepts markdown, matching every sibling section. Footer legal text does too.
- The mobile menu's logo is an image picker rather than a path field.
- The main navigation and footer link their logo home, and render no link at all when there is no logo.
- A linked Card covers itself with a stretched link rather than wrapping its whole contents in one. `cardSections` admits buttons, forms and modal triggers, none of which are allowed inside an anchor, and all of which are now clickable in their own right inside a linked card.

### Removed

- The Component Builder, the drag-and-drop page at `/component-docs/component-builder/` that composed building blocks in a sandbox and exported a component package. Prototyping a new section is better served by `npm run new:component`, which scaffolds the same three files with the correct keys and wiring, and by editing them directly. Its dev-only server-rendered preview route goes with it, so `astro.config.mjs` no longer registers a placeholder adapter to keep one route out of the static build, and the `jszip` and `shiki` dependencies are gone.
- Unused dependencies: `@astrojs/node` (no adapter is configured), the `ajv` devDependency (`@cloudcannon/configuration-types` brings its own), and the `@rollup/rollup-*` optional pins, which nothing in a Vite 8 tree loads. The `ConsentManager.acceptAnalytics()` method and its deprecated `rejectOptional()` alias, and the legacy `href` nav-button fallback (every nav entry in content and data uses `link`) go with them.

### Fixed

#### Accessibility

- The navigation menus are properly labelled and keyboard-operable. The hamburger, the close button and every dropdown arrow were announced to screen readers as unlabelled, on every page. The main, mobile and footer navigation now have distinct names, instead of appearing as three identical "navigation" areas. The menus still work in the CloudCannon editor.
- Keyboard operation reaches every menu. Enter and Space open and close a navigation submenu and side nav group (the handler was bound to a `<label>`, which never receives focus), a desktop nav dropdown closes when you tab out of it, the closed mobile menu is out of the tab order (its checkbox is hidden wherever its hamburger is), and the open mobile panel contains Tab and marks the rest of the page `inert`, so neither keyboard nor screen reader can reach the content behind it.
- Small icon-only controls now have a 44px tap area: the mobile menu and search buttons, carousel arrows, the theme toggle, and the announcement bar's dismiss. Nothing looks bigger — the extra area is invisible.
- The footer's social row is now the Social Links component rather than its own copy of the markup, so it announces itself as a labelled list. Its icons pick up that component's quieter muted styling.
- The blog "On this page" list no longer exposes two navigation landmarks with the same name, and blog tag archives render one breadcrumb trail instead of two, so neither page has two landmarks competing for the same name. Only the sidebar counts as navigation; the small-screen disclosure is just a control.
- The asterisk marking a required field read out as "star" and nothing else. It is hidden from screen readers now; the field itself already says it is required.
- Pagination's current-page marker read out as a bare number with no context, and on the last page the visible window trimmed the current page out, so the page you were on rendered as a plain link to itself with no `aria-current`. Both are fixed.
- Modals hold keyboard focus while open — the trap includes embedded players (`iframe`, `video`, `audio`) and disclosure summaries, so a keyboard user can reach the player in a Video Modal or an embed — announce themselves as dialogs (`aria-modal`, with `aria-haspopup="dialog"` and a server-rendered `aria-expanded="false"` on the Modal, Video Modal and search triggers), return focus to the control that actually opened them when several point at the same modal, and work inside the visual editor.
- Screen readers describe the collection components properly. Carousels and image carousels announce themselves as carousels and their panels as slides, an image carousel's thumbnail strip marks the one being shown, Steps and Timeline keep their list semantics in Safari (which drops them from any list styled without markers), and a Toggle is announced as a switch rather than a checkbox. An icon-only Segments option takes its name from the option label, where before it had none at all, and an avatar showing initials with no alt text is treated as decorative instead of as an unlabelled image. Both carousels derive their accessible name from the section label rather than a fixed string, and Contact Split names its map iframe after the address it shows, instead of the literal "Map" on every instance.
- A self-advancing Carousel (autoplay or auto-scroll) offers a Pause control and stops while focus is inside it, as WCAG 2.2.2 requires. Its indicator dots are buttons rather than divs, so they can be reached and operated from the keyboard, and the current one is marked `aria-current`. The slide counter announces only user-driven changes through a dedicated live region, and stays silent while autoplay advances it. An Image Carousel announces the slide you moved to in a live region, and its thumbnails are decorative — the thumbnail button already names itself.
- Reduced-motion support now covers modal and accordion animations, stops carousels auto-playing, renders counters at their final value instead of counting up, and keeps autoplaying video — including YouTube and Vimeo embeds — from starting on its own. The thumbnail strip in an Image Carousel jumps rather than smooth-scrolls, and a linked Card no longer scales on hover there.
- Segments could not be operated from the keyboard at all — its hidden inputs are now focusable, the same way Toggle's are. A single-select Segments group is a named `radiogroup` with `aria-required` where the native attribute can't express the group constraint, and a group with more options than fit scrolls instead of overflowing the form. Toggle shows a focus ring; it was drawn on the input, which is `opacity: 0`.
- Choice Group and Segments no longer put "required" on the first checkbox of a multi-select group, which asked the visitor to tick that one box rather than pick at least one. The group itself is now marked required instead.
- A form field with no label has an accessible name. It falls back to the field's placeholder, then its name, so a screen reader announces something other than "edit text, blank".
- An Alert is announced as a note rather than switching between `alert`, `status` and `note` by variant — page-load content in a live region interrupts a screen reader for no reason, and the role went stale in the Visual Editor.
- Focus rings, control borders and status colours meet contrast. The focus ring is now opaque and clears 3:1 against both the page and the surface background in each theme; `--color-border`, which draws the toggle track, the range track, pagination and the carousel, deck and stepper dots, no longer sits below 3:1; success and danger badge and alert text reach 4.5:1; and the gallery lightbox's counter and close control stay readable over a bright photo.
- A Testimonial is a `<figure>` holding a `<blockquote>` and a `<figcaption>`, which is how a quote with an attribution is marked up. The author's name is no longer wrapped in `<cite>` — that element is for the title of a work, not a person. A testimonial with no author renders no author row instead of an empty one, and a testimonial with no quote renders nothing at all.
- A table's scroll region borrows its name from the caption instead of repeating the text, so a screen reader reads the caption once. Its minimum width scales with the column count rather than a flat floor, so a two-column table never pans and a ten-column one is not squeezed.
- Content Selector tab labels and search result titles are no longer headings. Neither is a section title, and both were injecting a run of `h3`s into the page outline. A Content Selector's tab list no longer contains its own panel: each tab sits in a named tablist with an explicit set size and position, so the split lists still announce "2 of 5", and tabs respond to Enter and Space and keep their `aria-expanded`/`aria-hidden` state in the editor as well as on the site. A ScrollStepper step's label is honoured (`role="group"`).
- Card Grid cover images with no alt text of their own are decorative rather than repeating the card's heading, which was read out twice. Range puts its unit inside the value readout, so a screen reader announces "60 kg" rather than "60".
- A horizontal Timeline can be panned from the keyboard — the scroller had no focusable child.
- Icons are hidden from screen readers, which were announcing thousands of them across the site as unlabelled graphics.
- Every page has exactly one `<h1>`. The five `/examples/` pages that opened on a normal section had none, and `/why/` had two because a hero followed a page header; both are set with the new **Heading level** control.
- Smaller fixes: the content selector is a proper set of expandable panels, toggles without a visible label fall back to their name, cards with a background image get a solid backing so text stays readable if the image fails, and footer social links accept a custom label.

#### Images

- Images now offer their own full resolution. Sizes were rounded down to the nearest preset, so a 1181px image only ever offered a 640px version and looked soft. Cropped images were worst affected.
- Full-width section backgrounds loaded blurry in Firefox and Safari.
- Blog listing images were far heavier than they needed to be — 3.7MB of images for cards a few hundred pixels wide, now 0.42MB.
- Masonry cards and gallery tiles keep each photo's own shape. A width cap was pairing that width with the file's original height, which stretched portraits.
- Testimonial author photos were clipped and soft. The circle now fills edge to edge, initials still show when there is no photo, and the image ships extra resolutions for retina screens.
- Logo Cloud's placeholder logos are coloured, so the full-colour example is actually visible.
- Images inside a section with a locked colour scheme no longer swap to their alternate when a visitor toggles the site theme. A locked section keeps its colours, so its imagery has to as well.

#### Forms

- Form renders its children again when they are passed as slot content rather than through `formBlocks`. An early-return guard was inverted, so `<Form><Input /></Form>` produced nothing and an empty `<Form />` produced an empty form.
- Forms are sent as `multipart/form-data` only when they contain a File Upload. Every form was multipart, which some endpoints reject outright and which reads in an audit as a form with nothing to upload.
- Date fields keep their default value and min/max limits. The editor stores a full date-and-time value, which a date input silently discards, so every authored default and limit was dropped and the field rendered empty.
- Select shows its placeholder. The placeholder option was never marked selected, so the browser fell through to the first real option and a required Select was already satisfied on load.
- Textarea, Select, Date, File Upload and Toggle no longer emit a duplicate `id` when one is passed in, which pointed the field's label at the wrapper instead of the control.
- An input inside a disabled Input field is styled as disabled. The icon variant's shell hid the state.

#### The visual editor

These all shared one symptom: the site built and looked fine, but a field in
CloudCannon was missing, unusable or wrong.

- Fields for adding a list of items showed "not configured" and could not be edited. Main Nav's buttons were the last case; `lint:cms` now fails on the whole class of mistake.
- Options that existed in the editor but the component ignored, and options the component supported but the editor never offered, across a long list of components. Feature Grid's icon plate toggle and snippet alignment control, Main Nav's **Theme toggle** switch, the "Lock color scheme" switch, and the parallax toggle on the eleven page sections that pass background options through were all read by the component but unreachable in the editor.
- Controls that only appeared after you saved — alternate-theme logos, grid alignment — now show up on a freshly added block.
- Components with an emptied array in the CMS render instead of failing the build. A cleared list arrives as `null`, which a `= []` default does not cover — Social Links, Table, Steps, Timeline, Testimonial Wall, Logo Cloud, Pricing Comparison, Pricing Tiers, Contact Split, Feature Grid, Feature Slider, Stats, Team Grid, Image Carousel, Select, Choice Group and the three navigation components were affected.
- Components survive the editor's re-render, which replaces a component's markup under it: a Split's container-query rule was keyed to a per-render id and kept pointing at the old one; Masonry re-measures an item whose contents the re-render replaced; Headings no longer crash on the missing `Astro.locals.headingIds`; Page Header renders without breadcrumbs where `Astro.url` is unavailable; and Card Grid keeps its `items` region, which in grid mode sat on the root element where the editor's own array-item wiring overwrote it.
- Components no longer emit prop-driven classes and data attributes on their root element, where the CloudCannon editor's re-render leaves them stale: Alert, Badge, Image, List Item, Rating, Social Links, Table, Range, Card Grid Item, Image Carousel, Steps, Timeline, Announcement Bar, Page Header, Logo Cloud and Pricing Comparison all read their state from a child or from the rendered shape instead. `npm run lint:roots` now fails on a new one.
- Content Selector items can be selected and dragged on the canvas in the Visual Editor. Each item is now a real box that overlays the component's grid and re-exposes its tracks, instead of `display: contents`, which left the editor nothing to draw an outline on. Tabs-at-the-start and the narrow-screen accordion are unchanged to the pixel; tabs-on-top now size to their labels and left-pack (with a full-width rule under the strip) rather than sharing the width equally. Content Selector items also seed their subtext, icon, and icon colour, so those inputs show up on a newly added tab.
- More of a section is editable on the canvas: Accordion item titles, Content Selector titles and subtext, a Modal's trigger text, the feature list inside a Pricing Tier, Pricing Comparison's plans and feature rows, and a Contact Split detail that carries a link (previously only the ones without a link could be edited). Bindings that ignored the component's own binding props now honour them: an Alert's title, a Table's caption, a Testimonial's author image and a Submit button's text were wired to fixed prop names, so a page section composing one of those under a different name silently edited a key that did not exist.
- Passing a `class` to a component no longer strips the component's own class — Carousel (which silently disabled both its styling and its JavaScript), Accordion, Accordion Item, Footer and a Content Selector panel all merge the caller's class now.
- A Video Modal set to the button trigger rendered nothing to click — only the poster variant worked, so a video modal added from the editor with default settings was an invisible block on the page — and Modal now chooses its trigger from the trigger settings rather than from whether a consumer supplied one. The poster trigger renders inside the component instead of beside it, so it can be selected in the Visual Editor and spaces correctly. A Video Modal also plays in the editor: its video wiring was an inline script, which the editor strips, and changing the video in the editor takes effect on the next open instead of replaying the video the page loaded with.
- CloudCannon's add-section cards now show each component's preview thumbnail. The old path was a site URL that does not exist in the source tree, so the picker had nothing to display. A List item added from the picker no longer previews a broken icon, and a Hidden field's picker preview shows its name rather than an empty value.
- Several lists no longer trip CloudCannon's "Failed to render array item" error: Latest Posts cards (which are built from the blog, not a hand-edited list), the footer's social row, and Gallery Grid tiles, which can now be selected and reordered on the canvas.
- Latest Posts renders no cards when a site has no posts (or no post matching its tag), instead of publishing placeholder "Post title" cards. The placeholders are now shown only inside the CloudCannon editor, where the real posts can't be read.
- The move handle on the first page section is reachable again. A second editable wrapper was covering it.
- Adding a Step or Timeline entry now keeps the rail and numbering in sequence. The old last-item styles were baked in at render time, so they went stale until you rebuilt.
- The icon picker now shows brand marks with their real names (GitHub, LinkedIn, TikTok) instead of the filename, and 31 wrong icon names across 15 files meant the "add section" menu showed the wrong icon.
- Uploaded images and files were going to the wrong folder instead of `src/assets/images`.
- Navigation and footer item definitions were duplicated across four components in three different versions.
- The Table, Embed, Icon and Rating pickers offer what the component actually accepts: Embed gains a "None" aspect ratio (already used by Contact Split), Icon's "None" size is a real rule rather than a class matching nothing, and Rating's value can reach the maximum the scale allows. A background image is still offered for Pattern backgrounds, which use the same field, and Stack's row-only controls and Split's fixed-width and mobile-order controls declare the conditions that should gate them.
- A Button's text stays visible in the editor when "Hide text" is on, because that text is the icon-only button's accessible name.
- Definition List items expose one editable region per field instead of two overlapping regions bound to the same one, and no longer repeat roles the `dt`/`dd` elements already carry.
- `utils/` helpers no longer appear as placeable component keys in the "component not found" warning.
- A Video with an unrecognised type renders nothing instead of a black player with controls that can never play, and warns while authoring. An Image with no alt text that is not marked decorative warns while authoring, as does a hosted video with no title and a placed Button that has no link, element or popover target.
- A hosted video with no title no longer renders the literal word "undefined" as the player frame's accessible name.
- Production builds no longer ship links to `/component-docs/` guide pages that only exist when the component library is enabled. Every guide slug now renders the same noindex "available in local development" stub, so the Get started, home and why pages keep working in a `npm run build` output.

#### Visual and content

- Heading icons sat flush against their text; the gap is back.
- A background colour set alongside a background video painted over the video, hiding it completely.
- The announcement bar's default link now says "Why we built this" instead of "Learn more", and dismissing the bar no longer depends on storage being readable — in a private window reading it throws, which left the close button wired to nothing. Closing now always works; only the "stay dismissed" part is skipped.
- The blog table of contents no longer slides under the sticky navigation.
- Counters animate decimal targets at their own precision (99.95 no longer drops to 99) and no longer reflow on first paint — the number is grouped the same way before and after the count-up starts ("1000" no longer jumps to "1,000").
- Switching examples in the component-docs viewer no longer jumps the page. The frame stays sized to the tallest variant. The preview no longer prints `[object Object]` for nested content — item wrappers like Steps and Timeline show their real children — and the docs' "accepted values" chips render on a properly padded surface.
- Font weights are all tokens now, so changing the weight scale in a rebrand reaches everything. Fixed 19 references to design tokens that do not exist, across the mobile menu, top bar, blog listing, content selector and team grid — a mistyped token name is silently ignored, so none of these looked like errors — and removed a duplicate Medium icon that would have shown up as a second, black-rendering option.
- Content blocks with no component set now log a warning instead of silently disappearing.
- Production builds fail loudly on an invalid `DISABLE_COMPONENT_LIBRARY` value, and say whether the library was included.
- Testimonial quote marks sit on the outside of the quote. Any quote that started or ended with bold, italic, or a link picked up an extra pair of curly quotes around that fragment.
- Hero Center's larger subtext no longer resizes body copy in Hero Split and Feature Split. The rule was global rather than scoped to the section.
- Feature Split drops a block of dead code: a container query that named a container nothing declared, so the portrait corner-flattening it described never applied.
- Nav dropdowns are clamped to the viewport, so one on the right-most item no longer hangs off the page. Nav dropdown toggles no longer carry an invalid `role="button"`: a hidden checkbox already supports `aria-expanded`, and radio-based toggles (nested bar items, mobile and side navs) convey the same state through `checked`. The CSS-only, no-JavaScript toggle is unchanged.
- A side nav group holding the current page is served open without playing its expand animation, and it animates normally every time after that. The previous version suppressed the animation with a page-wide one-second timer, which also caught navs added later and never re-ran inside the CloudCannon editor. A side nav entry with no link renders as plain text instead of a link to `#` that scrolls the page to the top.
- Pricing Comparison keeps each plan's values in its own column — plans without a name were dropped from the header while the value cells kept counting from the full list, so one unnamed plan shifted every later column's values onto the wrong plan — and a cell left empty renders empty instead of the "Not included" cross. Say "no" or "-" to mark something excluded, as the input has always described. The call-to-action row is a table footer rather than the last body row, so it no longer picks up a zebra stripe depending on how many feature rows happen to sit above it.
- Pricing Tiers and the about and portfolio Testimonial sections no longer emit stray `layout` and `alignmentHorizontal` attributes — leftovers from Grid's old layout prop with no effect.
- A Bento Box cell's column span is clamped to the grid's column count.
- The theme toggle's sun/moon icons key off the site theme rather than the nearest themed ancestor, so the toggle inside a dark section shows the right icon, and the toggle listens to the system colour-scheme preference once rather than adding a listener on every view transition.
- The mobile menu's Escape handler is bound once for the page rather than once per menu per initialisation, its overlay container's stacking uses the layer scale rather than a hardcoded `z-index: 9999`, and its logo falls back to "Logo" rather than the starter's own name, so an unnamed logo is not announced as "Astro Component Starter" on a site that is not this one.
- Page sections default to the `base` background, so a section set to the dark colour scheme without an explicit background paints a ground instead of leaving light text on the page colour.
- Nested page files at `src/content/pages/<section>/index.md` resolve to `/<section>/`.
- Blog posts with an "On this page" sidebar keep the extra-wide images, code blocks, and CTAs in the article. The sidebar has its own column, starts below the post image, and sticks as you scroll; the page grows a step wider so those components still have room to break out of the text measure.
- Stale documentation and counts are corrected: the README's component count, the OG endpoint's filename, the icon dataset path in the agent guide, the Node floor, the `npm run check` step list, the instruction to hand-edit `public/llms.txt` (it is generated at build time), a `preinstall` guard that does not exist, and the editable-regions guide's page-level region and `sections` prop name (the code emits `pageSections`). The component catalog no longer lists a parent's layout settings as if they were per-item content props, and some component documentation pages no longer show a blank code sample.

### Security

- Live sites send the usual browser security headers (HTTPS-only, a tight referrer policy) and a Content-Security-Policy with `object-src 'none'`, `base-uri 'self'` and a `frame-ancestors` allowlist that lets the CloudCannon editor embed the page. The `X-Frame-Options: SAMEORIGIN` header that contradicted that allowlist is gone (browsers ignore it when `frame-ancestors` is present). A per-request script nonce is not included, because a static build cannot mint a new one on every load.
- Breadcrumb and blog JSON-LD escape `<` as `\u003c`, so a CMS-authored title or breadcrumb label containing `</script>` can no longer break out of the structured-data script element and execute.
- The dependency tree carries no known advisories — `npm audit` reports 0, from 8 (1 critical, 4 high, 3 moderate). The lockfile was re-resolved rather than the ranges widened: every fix already sat inside a range `package.json` declares, so no dependency range changed. Astro 7.2.0 → 7.3.3 covers the critical AVIF remote-code-execution and `base` authorization-bypass issues, sharp 0.35.3 → 0.35.4 the libheif set, and svgo, the three nested 4.x `js-yaml` copies, fast-uri, colord and `vitest`/`@vitest/mocker` move to their patched releases. A blocking CI audit job keeps it that way.

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
