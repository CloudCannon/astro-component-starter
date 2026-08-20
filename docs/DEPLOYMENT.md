# Deploying to CloudCannon

This starter is preconfigured for [CloudCannon](https://cloudcannon.com/). Connecting a
repository gives you a built site plus the visual editing the components are designed for —
no build settings to fill in by hand.

## What's already configured

| File                                      | What it does                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `.cloudcannon/initial-site-settings.json` | Build defaults CloudCannon reads on first sync: SSG `astro`, `npm ci`, `npm run build`, output `dist`, Node version from `.nvmrc`. |
| `cloudcannon.config.yml`                  | Collections, data editing, the icon picker, and the globs that pull in every component's schema.                                   |
| `.cloudcannon/structures/`                | Generated "Add section" entries — one per component, with previews.                                                                |
| `.cloudcannon/routing.json`               | 404 handling, security headers (HSTS, nosniff, framing, referrer, permissions), and `X-Robots-Tag` on the 404 page.                |
| `.cloudcannon/schemas/`                   | Front matter schemas for new pages and posts.                                                                                      |

Because component schemas are aggregated by glob, a component you add is registered with the
editor automatically — there is no separate CloudCannon-side registration step.

## Create the site

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In CloudCannon, go to **Create a Site** and pick your Git provider from the **File source**
   dropdown, then choose your repository and branch under **Repository** / **Branch Setup**.
   Each CloudCannon site tracks one branch.
3. Set the **Static Site Generator** dropdown to **Astro**. Leave **Source** at the repository
   root unless you've nested the project in a subdirectory.
4. Build. CloudCannon picks up the settings above, runs `npm run build`, and serves `dist`.

CloudCannon's own [documentation](https://cloudcannon.com/documentation/) is the reference for
the account-side details — organisations, permissions, custom domains, and staging branches.

## Set your production URL

This is the one thing a fresh clone will get wrong, and it fails silently. `site` in
`astro.config.mjs` is the base for every absolute URL Astro emits — canonical tags, the
sitemap, RSS links, and the JSON-LD `@id` graph. Left at `https://example.com` the build
still succeeds and the pages still look right, while every one of those URLs points at a
domain you don't own.

```bash
npm run reset:starter    # prompts for it, along with the rest of the demo cleanup
```

Or set it by hand in two places: `site` in `astro.config.mjs`, and `url` in
`src/data/seo.json`. `npm run check` warns while either is still a placeholder; add
`npm run check:placeholders -- --strict` to your own CI to make it an error.

Use your custom domain here, not the CloudCannon testing domain, so the canonical URLs
you publish stay correct after you attach the domain.

## Search

Search is [Pagefind](https://pagefind.app/), indexed from the built output. Both `npm run build`
and `npm run build:with-library` chain `npm run search:index` explicitly, so the index is
generated wherever the site is built — including locally:

```bash
npm run build && npm run preview   # /search/ works
```

It's chained into the build command rather than left to npm's implicit `postbuild` lifecycle
hook, because `ignore-scripts=true` — a common hardening setting on build machines and in
developers' own npm configs — suppresses lifecycle hooks while leaving an explicit
`npm run search:index` working. A skipped index is invisible: the build succeeds and
`/search/` renders, it just never returns a result.

Pagefind ships platform binaries as optional dependencies, so `@pagefind/linux-x64` is pinned
in `optionalDependencies` alongside the equivalent `sharp` and `rollup` packages. Keep using
`npm run deps:sync` rather than bare `npm install` when changing dependencies — see the README.

## Before you go live

- `npm run check` — the full gate, including the placeholder warning.
- `npm run build && npm run preview` — production build with search indexed.
- Confirm `src/data/seo.json` has your name, description, and logo, and that
  `src/data/mainNav.json` and `footer.json` don't still link to `/component-docs/`.
- Edit `public/llms.txt` so it lists _your_ pages, not the starter's Home / Why / Blog.

`npm run build` strips the component documentation from the output: the per-component pages
aren't generated at all, and `/component-docs/`, `/gallery/` and `/component-builder/` render
a short "available in local development" placeholder rather than 404. That's fine to leave in
place, but it isn't a page you want in a real site's navigation — `npm run reset:starter`
removes the link. Use `npm run build:with-library` to publish the docs alongside your site.
