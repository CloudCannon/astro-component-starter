---
title: Going Live
contentSections: []
---

# Going Live

Your site builds and looks like your brand. This guide gets it onto the web: clear out the demo content, set the production URL, fill in the site-wide details, and deploy. [docs/DEPLOYMENT.md](https://github.com/CloudCannon/astro-component-starter/blob/main/docs/DEPLOYMENT.md) has the full detail.

## Remove the demo content

```bash
npm run reset:starter
```

It asks for your site name and production URL, then asks before each of these:

- **Demo blog posts:** deletes the posts in `src/content/blog/`.
- **Demo pages:** deletes the Why and Get Started pages and everything under `/examples/`, and resets the homepage to a blank hero.
- **Branding:** clears the logos, cuts the nav and footer down to Home and Blog, and turns off the announcement bar.

It deletes files, so it only runs on a clean git tree, and `git checkout .` undoes it. Add `--dry-run` to see the plan without changing anything. Work through the earlier guides first: they use the demo pages as examples.

## Set your production URL

`site` in `astro.config.mjs` is the base for every absolute URL the build writes: canonical tags, the sitemap, RSS and structured data. Left at `https://example.com`, the site still builds and looks fine while all of those point at a domain you don't own.

`npm run reset:starter` sets it for you. To set it by hand, change `site` in `astro.config.mjs` and `url` in `src/data/seo.json`. Use your real domain, not CloudCannon's testing domain. `npm run check` warns while either is still a placeholder.

## Fill in the site-wide details

Site-wide content lives in `src/data/`. In CloudCannon, edit it under **Data**.

| File                   | What it holds                                                               |
| ---------------------- | --------------------------------------------------------------------------- |
| `mainNav.json`         | Logo and main navigation links.                                             |
| `footer.json`          | Footer logo, links, social links and legal text.                            |
| `seo.json`             | Site name, description, title format, social sharing image and share cards. |
| `announcementBar.json` | The optional bar across the top of every page.                              |
| `privacy.json`         | Privacy banner and settings wording, and whether embeds ask before loading. |
| `analytics.json`       | The analytics provider. Off until you set one up.                           |

## Privacy

Rewrite the privacy policy at `src/content/pages/privacy.md` for your site. It ships as a template with bracketed prompts, and nothing can check that what it says is true.

Analytics only loads after a visitor allows it. YouTube, Vimeo, maps and embeds load straight away unless you turn on **Ask before loading external media** in **Privacy & Consent**. Turn it on if any of your visitors are in the EU or UK. [docs/PRIVACY.md](https://github.com/CloudCannon/astro-component-starter/blob/main/docs/PRIVACY.md) covers the whole workflow.

## Deploy to CloudCannon

1. Push the project to your own GitHub, GitLab or Bitbucket repository. The starter is set up as a git remote named `upstream`, so add yours as a new remote.
2. In CloudCannon, go to **Create a Site**, pick your Git provider from **File source**, and choose your repository and branch.
3. Set **Static Site Generator** to **Astro** and build.

The project already includes its build settings (`.cloudcannon/initial-site-settings.json`) and editor configuration (`cloudcannon.config.yml`), so there's nothing else to fill in. Attach your domain in CloudCannon's site settings.

`npm run build` leaves these docs out: their URLs show a short "local development only" notice. Build with `npm run build:with-library` instead if you want the docs and component library on your live site.

## Before you launch

- Run `npm run check`. Add `npm run check:placeholders -- --strict` to your CI so a placeholder URL fails the build.
- Search the built site for leftover demo text, and check every nav and footer link.
- Open a few pages in CloudCannon's visual editor and make a test edit.

That's the Getting Started guide done. Browse the components in the sidebar when you need one, or go back to [Building a Page Section](/component-docs/building-a-page-section/) to make your own.
