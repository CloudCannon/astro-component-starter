# AGENTS.md

Astro component starter: brandable base components for informational websites, visually editable in CloudCannon.

## Agent skills

Agent skills live canonically in `.agents/skills/` — one directory per skill, each containing a `SKILL.md`. Cursor reads that folder directly. `.claude/skills/` is a generated, byte-identical copy for Claude Code, which still requires its own path.

**Never hand-edit `.claude/skills/`.** Edit the canonical skill under `.agents/skills/`, then run:

```
npm run skills:sync
```

`npm run skills:check` (part of `npm run check`) fails CI if the Claude copy drifts from the canonical tree.

### Available skills

- **adding-fonts** — Add or change fonts using local `@fontsource` packages.
- **blog-mdx-content** — Create and manage blog posts using MDX with embedded Astro components.
- **create-component** — Scaffold new components for the Astro + CloudCannon component library.
- **debug-cloudcannon** — Troubleshoot CloudCannon visual editing issues (picker, editable regions, renderBlock).
- **editable-regions** — Deep reference for wiring `data-prop` / `data-children-prop` visual-editing bindings.
- **migrate-existing-site** — End-to-end workflow for migrating an existing website into this component starter.
- **page-content-authoring** — Assemble pages from existing components via `pageSections` YAML.
- **screenshot-to-component** — Build a new page section component from a screenshot.
- **site-data-navigation** — Configure site-wide navigation, footer, and SEO data.
- **theming** — Customize colors, fonts, spacing, and other design tokens for brand matching.

### Companion plugin

The [CloudCannon/agent-skills](https://github.com/CloudCannon/agent-skills) plugin provides generic CloudCannon migration/config skills (not specific to this repo's component architecture). It's an optional companion, not a replacement for the skills above.

## More context

- `CLAUDE.md` — commands, conventions that bite, and detailed workflow guide index.
- `docs/ARCHITECTURE.md` — structural overview; read before structural changes.
