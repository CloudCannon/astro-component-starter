---
name: privacy-consent
description: Use when configuring, extending, or debugging the starter's site-wide privacy workflow, consent-aware analytics, or third-party video, map, and Embed loading. Covers privacy.json, analytics.json, the policy scaffold, consent categories, provider allowlists, and pre-consent network verification.
---

# Privacy, consent, and analytics

The starter applies one strict opt-in policy globally. Necessary preference storage is always available; the optional categories are `analytics` and `externalMedia`. No optional provider request may happen until its category is effectively granted. Read `docs/PRIVACY.md` before changing the policy or adding a service.

## When to use

- Configuring Privacy & Consent or Analytics in CloudCannon or `src/data/`.
- Replacing the starter privacy-policy page or increasing its revision.
- Adding an analytics provider, hosted-video provider, map host, or third-party iframe.
- Building a component that loads optional third-party content.
- Debugging a banner, saved choice, Plausible pageview, or blocked external-media placeholder.

## When not to use

- For ordinary nav, footer, or SEO data, use [site-data-navigation](../site-data-navigation/SKILL.md).
- For page composition only, use [page-content-authoring](../page-content-authoring/SKILL.md); its catalog identifies the components already wired into consent.
- For generic legal advice or deciding what a policy must say in a jurisdiction, involve the responsible privacy professional. The starter supplies technical controls and a scaffold, not a publishable universal policy.

## Configuration and ownership

| Concern                                                       | Source of truth                                                              |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Visitor-facing labels, policy URL, revision, expiry, GPC      | `src/data/privacy.json`                                                      |
| Analytics provider and script URL                             | `src/data/analytics.json`                                                    |
| Build-time validation and TypeScript types                    | `src/integrations/consent/config.ts`                                         |
| Decisions, storage, expiry, GPC, cross-tab sync, public event | `src/integrations/consent/runtime.ts`                                        |
| Banner, settings dialog, and external-media hydration         | `src/components/navigation/consent/{Consent.astro,setup.ts}`                 |
| Analytics loading and pageviews                               | `src/integrations/consent/analytics.ts`                                      |
| Allowed external iframe hosts and paths                       | `src/integrations/consent/externalMedia.ts`                                  |
| CloudCannon data panels                                       | `cloudcannon.config.yml` and `.cloudcannon/schemas/{privacy,analytics}.json` |
| Editable policy scaffold                                      | `src/content/pages/privacy.md`                                               |

`SiteConsent.astro` — mounted by `BaseLayout` and by the component library's own shell — parses both data files and renders one Consent instance on every page; `LibraryLayout` needs it just as much as the site shell, because the Embed, Video and Video Modal examples carry the same placeholders. Do not add `navigation/consent` to `pageSections`; its component-doc example is an isolated, non-persistent demonstration.

## Configure a site

1. Replace every prompt in `src/content/pages/privacy.md`, remove `starterPrivacyPolicyPlaceholder: true`, and make the text describe the site's actual owner, purposes, services, recipients, retention, and visitor rights.
2. Set the site-relative `policyUrl`, final labels, `expiryDays`, and `honorGlobalPrivacyControl` in `privacy.json`.
3. Keep analytics at `provider: "none"` unless it is intentionally configured. For hosted Plausible, use the site-specific `https://plausible.io/js/pa-….js` URL; the schema rejects the legacy shared script and other hosts.
4. Increase `policyRevision` after a material change that should invalidate saved choices. Do not increase it for wording-only edits that do not change the services or purposes disclosed.
5. Run `npm run check:placeholders -- --strict`, then perform the production network checks below.

Turning `enabled` off hides the UI and fails closed. It is not a way to bypass consent: analytics and external media remain denied.

## Visitor behavior to preserve

- With analytics configured and no analytics decision, the banner presents equal-prominence **Accept All**, **Reject All**, and **Customize** actions.
- The settings dialog identifies the necessary preference record as **Always on**, exposes analytics only when configured, always exposes external media, and allows bulk or granular changes.
- When analytics is off, there is no first-visit banner. External media asks contextually where a visitor tries to use it.
- The footer and persistent control reopen settings after a decision.
- Choices expire after `expiryDays`, reset on a `policyRevision` mismatch, and synchronize through `BroadcastChannel` plus the storage event.
- Effective permission is false for unset or denied categories. GPC keeps an unset choice denied, while a later explicit grant on this site is authoritative.
- If browser storage is unavailable, the in-memory decision still governs the current visit.

## Add optional third-party media

Prefer the existing typed paths:

- `Video` and `VideoModal` for YouTube or Vimeo.
- `ContactSplit` for Google Maps or OpenStreetMap.
- `Embed` only for trusted developer-authored HTML that does not fit a typed component.

**MUST:** use `Video` or `VideoModal` for YouTube and Vimeo; do not paste their iframe code into `Embed`. **Why:** the typed components own provider URLs, titles, autoplay/loop behavior, fallback links, consent hydration, and revocation teardown.

The shared compatibility allowlist remains intentionally narrow: YouTube Privacy Enhanced Mode (`www.youtube-nocookie.com/embed/...`), Vimeo (`player.vimeo.com/video/...`), Google Maps embed paths, and OpenStreetMap exports. `Embed` removes `script`, `style`, `link`, `object`, and `embed` elements plus inline event handlers, rejects other iframe URLs, and sandboxes allowed iframes.

When adding a host or path:

1. Confirm it belongs in `externalMedia` and update the real privacy policy before shipping it.
2. Add the narrowest HTTPS hostname and pathname rule to `externalMedia.ts`; do not allow arbitrary subdomains, paths, ports, credentials, or schemes.
3. Keep the component's initial HTML inert. Use `data-external-media-src` for one allowed iframe or `template[data-unsafe-external-media]` plus an adjacent host for trusted HTML. Never emit a provider iframe, thumbnail, preconnect, SDK, or script before permission.
4. Provide a useful fallback with `data-external-media-enable`. That action grants external media across the site, not only for one item.
5. Hydrate on the existing consent lifecycle and remove mounted content when permission is revoked. A hidden iframe can keep sending data or playing audio, so hiding is insufficient.
6. Add allowlist unit tests and smoke coverage for no pre-consent request, successful hydration, and revocation teardown. Update the component docs, catalog, examples, and policy scaffold prompts if the provider changes what sites must disclose.

## Add analytics or a consent category

An analytics provider is a cross-layer change: extend the discriminated schema and data defaults, CloudCannon schema/options, loader adapter, privacy documentation, policy scaffold, and tests together. Preserve the current guarantees: no script or event before permission, no buffering of pre-consent activity, one deliberate pageview per Astro navigation, and no future events after revocation. Document that an already-fetched third-party script cannot reliably be unloaded or clear provider-domain storage.

A new consent category is broader still. Update `consentCategories`, blank/parsed records, UI labels and controls, bulk actions, storage tests, GPC behavior, every consumer, CloudCannon inputs/schema, policy text, and network smoke tests. Do not overload an unrelated category merely to avoid this work.

## Runtime contract

`window.siteConsent` exposes the singleton manager after setup. Consumers should call `isAllowed(category)` for effective permission and react to `site-consent-change`; they must not read `localStorage` directly. Decisions are stored under `site-consent` with `policyRevision`, `decidedAt`, and per-category values.

Astro view transitions reuse the document. Setup functions must be idempotent, handle `astro:page-load`, and avoid duplicate subscriptions or provider scripts. Consent UI and optional services remain inert when `window.inEditorMode` is set; the component-doc Consent preview must not share live storage or load analytics.

## Verify your work

- Run `npm run check`, `npm run test:unit`, and `npm run test:smoke` after changing the workflow.
- In a production-like build, inspect Network before and after **Accept All**, **Reject All**, granular save, and revocation. There must be no optional analytics, thumbnail, iframe, map, preconnect, or raw-embed request before its category is granted.
- Exercise expiry and revision invalidation, GPC, cross-tab synchronization, blocked storage, Astro navigation, mobile layout, keyboard/focus behavior, and screen-reader labels.
- Run `npm run check:placeholders -- --strict` before launch.
