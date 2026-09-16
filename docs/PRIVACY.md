# Privacy, consent, and analytics

The starter ships with a strict, no-configuration default: `src/data/analytics.json` has
`provider: "none"`, so it loads no analytics provider. `src/data/privacy.json` enables the
privacy control, records only a small local preference, and uses global strict opt-in.

Edit both files in CloudCannon's **Data** editor, or in the repository. Configuration is
validated during the Astro build:

- **Privacy & Consent** controls the policy revision, the expiry period, banner copy, and Global
  Privacy Control behaviour. The same strict opt-in policy applies to every visitor.
- **Analytics** currently supports `none` and `plausible-hosted`. Choose `none` until a
  Plausible site has been configured and you have copied its site-specific script URL.

The visitor can separately allow analytics and external media. Rejecting non-essential
services denies both. Their choices are versioned in `localStorage`, synchronized across tabs,
and are re-requested when the configured policy revision changes or the expiry period passes.
The first-visit banner appears only when analytics is configured; external media is requested
where the visitor chooses to use it.

Turning **Privacy & Consent** off fails closed: analytics and external media remain disabled.
It does not provide a shortcut for loading optional services without consent. When Global
Privacy Control is enabled in the configuration, an unset choice remains denied; a later,
explicit choice made in this site's privacy settings is authoritative.

## Privacy-policy page

The starter includes an editable `/privacy/` scaffold. It deliberately contains bracketed
prompts and `starterPrivacyPolicyPlaceholder: true`; it is not a publishable generic policy.
Replace it with text that describes the live site's real owner, services, purposes, recipients,
retention, and visitor rights, then remove the placeholder flag. `npm run check:placeholders --
--strict` fails when the configured policy route is missing or the scaffold is still marked as a
placeholder.

## External media

Hosted YouTube and Vimeo videos, Contact Split maps, and raw Embed content stay inert until
external-media permission is effective. YouTube players are then created with
`youtube-nocookie.com` (Privacy Enhanced Mode). That reduces YouTube's use of cookies before a
playback interaction; it does not make YouTube a first-party service or remove the need for
external-media permission.

`Embed` is a trusted-developer escape hatch, not a general script loader. Its raw HTML remains
inert until approval; scripts and event handlers are removed, and iframes must match the built-in
YouTube embed, Vimeo player, Google Maps embed, or OpenStreetMap export paths before mounting.
Contact Split maps use the same allowlist. Prefer typed video and map paths for editor-managed
content. A contextual **Allow all external media** action grants this category across the site,
not only for that one video or map.

## Configure Plausible

1. Add the production domain to Plausible.
2. In Plausible's Site Installation settings, copy the script `src`. It has the form
   `https://plausible.io/js/pa-….js` and is specific to the configured site.
3. Set **Analytics → Provider** to **Plausible (hosted)** and paste that complete URL into
   **Plausible script URL**. The build rejects the legacy shared script and non-Plausible hosts.
4. Deploy, grant analytics permission, and use Plausible's integration checker plus the browser
   Network panel to confirm that the script and event endpoint succeed.

## Analytics behaviour

The Plausible adapter loads the configured site-specific script only after effective analytics
permission, initializes it with automatic pageviews disabled, and queues one manual `pageview`
for the current Astro page after approval plus one for each later `astro:page-load`. It sends the
origin and path only and never buffers pre-consent events. Revoking permission stops future
events. A third-party script already fetched cannot be reliably removed or made to clear
provider-domain storage by the site, so changing a decision is prospective.

Before release, test a production deployment with browser network tools: no Plausible request,
provider thumbnail, iframe, preconnect, map, or raw embed request should occur before the
relevant approval.

Also exercise accept, reject, granular save, revocation, policy-revision and expiry changes,
cross-tab synchronization, Global Privacy Control, blocked browser storage, mobile layout, and
keyboard/screen-reader operation. Inventory every new third-party service: add it to an existing
category or introduce an appropriately named category before its network code ships.
