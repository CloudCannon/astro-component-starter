---
name: adding-icons
description: Use when adding, replacing, or removing a selectable icon in `src/icons/` — picking a source you can redistribute, recording its source and license in the file, and syncing the CloudCannon icon picker.
---

# Adding & licensing icons

`src/icons/` is the whole icon registry: every `.svg` there is selectable in the CloudCannon picker, rendered by `Icon.astro`, and gated in CI for picker drift and for a recorded license. This skill owns that directory.

## When to use

- Adding an icon editors can pick — a brand mark, a UI glyph, a direction icon.
- Replacing an icon's artwork (brands redraw their logos; X and Medium did in 2024).
- Removing an icon, or renaming one.
- `npm run icons:check` or `npm run icons:licenses:check` is failing.

## When not to use

| Situation                                                   | Go instead to                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| Using an icon that is already in the registry, from content | [page-content-authoring](../page-content-authoring/SKILL.md) |
| The site logo, favicon, or an `<img>` that isn't selectable | Not this skill — those live in `src/assets/images/`          |
| Changing the `Icon` component's markup, sizes, or CSS       | [create-component](../create-component/SKILL.md)             |

## Record the license in the file

**MUST:** every icon that isn't a Heroicon opens with a `Source`/`License` comment above its root `<svg>`.
**MUST NOT:** commit a third-party icon before that header exists.

```svg
<!-- Source: Simple Icons (https://simpleicons.org) | License: CC0-1.0 -->
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="…"/></svg>
```

**Why:** nothing about a missing header breaks a build, and the renderer drops everything above `<svg>` — so an icon with no recorded provenance looks fine on the page and in review. `scripts/icons/licenses.mjs` is the only thing that catches it.

Rules for the header:

| Field     | Requirement                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Source`  | The upstream project or author, with a URL to it.                                                                        |
| `License` | A single **SPDX identifier** — `CC0-1.0`, `MIT`, `Apache-2.0`. Free text fails the check.                                |
| Position  | The first thing in the file, immediately above `<svg>`. A comment after `<svg>` is not a header; the check won't see it. |

Heroicons files need no header: they are covered as a set by `LICENSE-heroicons.txt`, and the check recognises them by their Heroicons v2 signature (`data-slot="icon"`). Delete that attribute from a Heroicon and it becomes an unrecorded icon.

## Where to get icons

Prefer a source whose license needs no judgement call. All of these permit commercial use and redistribution without attribution.

| Source                                                          | License | Use for                                          |
| --------------------------------------------------------------- | ------- | ------------------------------------------------ |
| [Heroicons](https://heroicons.com/)                             | MIT     | UI glyphs (the majority of the registry)         |
| [Simple Icons](https://simpleicons.org/)                        | CC0-1.0 | Brand marks — 3,700+ brands, no attribution      |
| [Instructure UI](https://github.com/instructure/instructure-ui) | MIT     | Direction/utility icons (InstUI)                 |
| [Fontisto](https://github.com/kenangundogan/fontisto)           | MIT     | Only where it already is — see `social/yelp.svg` |

**MUST NOT:** add artwork whose license is unknown, "free", or a Dribbble/social-media download with no stated terms.
**Why:** a logo you can't license is a redistribution risk the owner of this site carries, not you. Swap in the Simple Icons version instead — it covers Google, Bluesky, X, Medium and the rest.

Brand marks are **trademarks** regardless of the artwork's license. Recording `License: CC0-1.0` grants you the file, not the right to imply endorsement.

## Add an icon

1. Save the artwork as `src/icons/<id>.svg` — `social/<name>.svg` for a brand mark, top level for a UI glyph. The `<id>` is the path under `src/icons/` minus `.svg`, and it is what content references (`icon: social/github`).
2. Keep a `viewBox` and drop any `width`/`height`. A file with neither `viewBox` nor numeric dimensions throws at render time.
3. Strip fills and strokes from the artwork (`fill="none"` is fine) so `Icon.astro` can paint it in the current text colour. A hardcoded colour ignores the surrounding text; `tests/unit/icons.test.ts` fails on one.
4. Prepend the `Source`/`License` header (skip for Heroicons).
5. Run `npm run icons:sync`.

## Remove, rename, or replace an icon

1. Delete/rename/replace the `.svg`.
2. If the source changed, update the header. If it became a Heroicon, delete the header.
3. Run `npm run icons:sync` — this also refuses to leave a picker entry with no SVG.

## Verify your work

| Command                        | Passing result                                                      |
| ------------------------------ | ------------------------------------------------------------------- |
| `npm run icons:sync`           | Rewrites `.cloudcannon/data/icons.yml` with no error.               |
| `npm run icons:check`          | `ok .cloudcannon/data/icons.yml (<N> icons)` — no drift.            |
| `npm run icons:licenses:check` | `ok src/icons/ (<N> third-party icons, all recorded)`.              |
| `npm run test:unit`            | `tests/unit/icons.test.ts` passes — every SVG normalizes.           |
| `npm run check`                | Exit 0 — includes both icon checks.                                 |
| `npm run dev`                  | The icon renders in the picker and on the page, in the text colour. |
