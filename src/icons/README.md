# Selectable icons

`src/icons/` holds the 343 SVGs offered in the CloudCannon icon picker. Every
`.svg` here is the single source of truth: `npm run icons:sync` generates
`.cloudcannon/data/icons.yml` from it (an id with no SVG renders a broken
thumbnail, an SVG with no id is unselectable), and `npm run icons:check` fails
CI on drift in either direction.

Provenance is only partly recorded. Three groups, treated differently:

- **324 Heroicons** — every SVG outside `social/`, except `ltr.svg` and
  `rtl.svg`. These are Heroicons v2 (24×24 outline), used and redistributed
  under the MIT license in `LICENSE-heroicons.txt` (Copyright © Tailwind Labs,
  Inc.).
- **17 social brand marks** — `social/*`: bluesky, discord, facebook, github,
  gitlab, gitter, google, instagram, linkedin, medium, pinterest, reddit,
  tiktok, twitch, x, yelp, youtube. **No source or license is recorded in this
  repository.** These are third-party brand marks and trademarks, not covered
  by the Heroicons MIT license; confirm provenance and the terms for your
  intended use before redistributing them. None carries a license header or
  source comment.
- **2 unrecorded** — `ltr.svg` and `rtl.svg` are 1920×1920 (not the Heroicons
  24×24 geometry), and their source is not recorded either. Confirm provenance
  before relying on a license for them.

## Assets outside this directory

`public/videos/component-docs/glass.mp4` (~834 KB) is used by the
component-docs examples and likewise has no recorded source or license —
confirm provenance before redistribution.
