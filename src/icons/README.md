# Selectable icons

`src/icons/` holds the 343 SVGs offered in the CloudCannon icon picker. Every
`.svg` here is the single source of truth: `npm run icons:sync` generates
`.cloudcannon/data/icons.yml` from it (an id with no SVG renders a broken
thumbnail, an SVG with no id is unselectable), and `npm run icons:check` fails
CI on drift in either direction.

Every icon that isn't a Heroicon records its own provenance in a
`<!-- Source: … | License: … -->` comment above its root `<svg>` —
`npm run icons:licenses:check` fails on a third-party icon without one. Heroicons
are covered as a set and identify themselves by their `data-slot="icon"`
signature. The renderer drops everything above `<svg>` (see
`src/components/utils/iconSvg.ts`), so the comment never reaches a page. Adding or
replacing an icon: see `.agents/skills/adding-icons/SKILL.md`.

Provenance, by source. Every icon is accounted for. Four sources supply the
343 SVGs: three are MIT and one is CC0. All permit commercial use and
redistribution.

- **324 Heroicons (MIT)** — every SVG outside `social/` except `ltr.svg` and
  `rtl.svg`. Heroicons v2 (24×24 outline), used and redistributed under the MIT
  license in `LICENSE-heroicons.txt` (Copyright © Tailwind Labs, Inc.).
- **2 Instructure UI (MIT)** — `ltr.svg` and `rtl.svg` are
  `text-direction-ltr` / `text-direction-rtl` from
  [instructure-ui](https://github.com/instructure/instructure-ui), the design
  system behind Canvas LMS (`packages/ui-icons/svg/Line/`, published as
  `@instructure/ui-icons`). MIT, Copyright © 2015 Instructure, Inc. The
  1920×1920 geometry is InstUI's, not Heroicons'; the path data matches
  upstream apart from svgo's relative-command rewriting.
- **16 Simple Icons (CC0-1.0, not MIT)** — `social/*` except `yelp.svg`:
  bluesky, discord, facebook, github, gitlab, gitter, google, instagram,
  linkedin, medium, pinterest, reddit, tiktok, twitch, x, youtube. From
  [Simple Icons](https://simpleicons.org/), dedicated to the public domain
  under CC0-1.0. All sixteen track current upstream, so the x, Medium, Google
  and Bluesky marks no longer lag behind their brands.
- **1 Fontisto (MIT)** — `social/yelp.svg` is Fontisto's
  `icons/svg/brand/yelp.svg` ([kenangundogan/fontisto](https://github.com/kenangundogan/fontisto),
  Copyright © 2017 Fontisto), used under the MIT license. Its
  `viewBox="0 0 18 24"` is Fontisto's; Simple Icons' yelp is a different
  24×24 mark.

The brand marks are third-party trademarks regardless of the license on their
SVG source; licensing of the artwork does not grant trademark rights.

## Assets outside this directory

`public/videos/component-docs/glass.mp4` (~834 KB) is used by the
component-docs examples and likewise has no recorded source or license —
confirm provenance before redistribution.
