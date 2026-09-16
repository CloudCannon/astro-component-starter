# Privacy, consent, and analytics

The starter ships with a strict, no-configuration default: `src/data/analytics.json` has
`provider: "none"`, so it loads no analytics provider. `src/data/privacy.json` enables the
privacy control, records only a small local preference, and uses global strict opt-in.

Edit both files in CloudCannon's **Data** editor, or in the repository. Configuration is
validated during the Astro build:

- **Privacy & Consent** controls the policy revision, the expiry period, banner copy, Global
  Privacy Control behaviour, and the regional policy preset.
- **Analytics** currently supports `none` and `plausible-hosted`. Choose `none` until a
  Plausible site has been configured for the production domain.

The visitor can separately allow analytics and external media. Rejecting non-essential
services denies both. Their choices are versioned in `localStorage`, synchronized across tabs,
and are re-requested when the configured policy revision changes or the expiry period passes.
The first-visit banner appears only when analytics is configured; external media is requested
where the visitor chooses to use it.

## External media

Hosted YouTube and Vimeo videos, Contact Split maps, and raw Embed content stay inert until
external-media permission is effective. YouTube players are then created with
`youtube-nocookie.com` (Privacy Enhanced Mode). That reduces YouTube's use of cookies before a
playback interaction; it does not make YouTube a first-party service or remove the need for
external-media permission.

`Embed` is a trusted-developer escape hatch, not a general script loader. Its raw HTML remains
inert until approval; scripts, event handlers, and iframe hosts outside the built-in YouTube,
Vimeo, Google Maps, and OpenStreetMap allowlist are removed before it is mounted. Contact Split
maps use the same allowlist. Prefer typed video and map paths for editor-managed content.

## Regional policy

`global-strict` is the default and needs no server code. `eea-uk-ch-strict` keeps strict opt-in
for the EEA, UK, and Switzerland and uses notice-and-opt-out elsewhere. It never invents a
visitor choice: a denial always wins, and missing, invalid, timed-out, or unknown geo data falls
back to strict opt-in.

Regional resolution is country-level only so it can be portable. Before enabling the regional
preset, have the organisation's policy owner approve the mapping, turn on **Regional policy
approved**, and verify it on the actual deployment host. Without that explicit approval the
site remains global strict opt-in.

| Host               | Included resolver                           | Deployment requirement                                                                    |
| ------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| CloudCannon        | Reads its injected `country-xx` page class. | Enable the site's Geolocation setting in CloudCannon.                                     |
| Netlify            | `netlify/edge-functions/consent-policy.ts`  | Deploy with Netlify Edge Functions enabled.                                               |
| Vercel             | `api/consent-policy.ts`                     | Deploy the repository as a Vercel project so the Function receives `x-vercel-ip-country`. |
| Cloudflare Pages   | `functions/api/consent-policy.ts`           | Deploy with Pages Functions (Git integration or Wrangler, not Dashboard Direct Upload).   |
| Other static hosts | No geo lookup.                              | The client safely remains global strict opt-in.                                           |

All four adapters expose the same endpoint, `/api/consent-policy`, return only the resolved
policy, and do not store or return location details. They are deliberately included as separate
platform entry points; a host cannot use another host's request metadata automatically.

## Analytics behaviour

The Plausible adapter loads `script.manual.js` only after effective analytics permission. It
queues one manual `pageview` for the current Astro page after approval and one for each later
`astro:page-load`; it sends the path only, never pre-consent buffered events. Revoking
permission stops future events. A third-party script already fetched cannot be reliably removed
or made to clear provider-domain storage by the site, so changing a decision is prospective.

Before release, test a production deployment with browser network tools: no Plausible request,
provider thumbnail, iframe, preconnect, map, or raw embed request should occur before the
relevant approval. Test each regional host adapter with its documented country simulation or a
real in-country request.
