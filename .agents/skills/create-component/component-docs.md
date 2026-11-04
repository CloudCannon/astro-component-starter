# Component library docs entry

Every component under `src/components/**` gets a `/component-docs` page automatically — a docs entry is **optional enrichment**, not a required step. Add a new component and its page appears with no docs file at all: title, description, live example, and props/slots tables all derive from the component's own YAML and `.astro` source. `src/component-docs/content/components/{tier-path}/{slug}/index.md` (+ `examples/*.md`) exists to patch or extend that derived page when the default isn't good enough. The `/component-docs` route renders these as live examples; it is excluded from production builds.

## What's automatic (no docs file needed)

- **Title** — `docsEntry.title` if present, else the structure-value `label`, else a formatted version of the component key.
- **Description** — `docsEntry.description` if present, else the structure-value `description:`. This is the one place that field is user-facing outside the CloudCannon picker, so keep it accurate (it also feeds the [generated component catalog](../page-content-authoring/component-catalog.md)).
- **Primary example** — if no `examples/primary.md` exists on disk, one is synthesized live from the structure-value `value:` default, so every component gets a working preview.
- **Other examples** — any `examples/*.md` on disk renders even with no `index.md`: one group per file, alphabetical by slug, titled from the file's own `title:` (see `examples/primary.md` below).
- **Slots** — derived directly from `<slot>` tags in the `.astro` source (`src/component-docs/shared/slotDerivation.ts`): name, and — for the dominant patterns (`<slot>{text}</slot>`, `<slot>{items?.map(...)}</slot>`, a one-level local alias) — the prop it falls back to (`fallback_for`) and, for an array/`.map()` fallback, the child component it repeats (`child_component.name`). Only a slot whose fallback content doesn't reduce to one unambiguous prop comes back ambiguous, logs a build warning, and needs a declared override.
- **`npm run docs:check`** (`scripts/docs/check.mjs`, part of `npm run check`) validates all of this — orphaned docs dirs, example frontmatter/prop drift, unwired on-disk examples, and slot override problems — whether or not a component has a docs file.

## What index.md / examples add

- Longer `overview` prose (supports markdown links to other component doc pages).
- Curated `examples:` groups — control ordering, titles, and which on-disk examples appear together (grouping is otherwise one-file-per-group, alphabetical).
- Slot `description`s, and overrides for the rare ambiguous slot derivation can't resolve on its own (see below).
- A hand-tuned `description` distinct from the structure-value's (uncommon — usually the structure-value description is the single source of truth).

## Files

```
src/component-docs/content/components/{tier-path}/{slug}/
├── index.md              # optional: overview + example curation + slot overrides
└── examples/
    ├── primary.md        # optional — synthesized from structure-value defaults if absent
    ├── {prop}-{value}.md # one per notable prop variation (size-sm.md, variant-ghost.md)
    └── {feature}.md      # one per notable feature (icons.md, border.md)
```

Every `examples/*.md` needs a non-empty `title:` and a `blocks:` tree — `docs:check` fails otherwise (`ComponentViewer` reads `title` unconditionally).

## index.md

```yaml
---
title: My Component
description: 'Short one-liner (falls back to structure-value description if omitted).'
overview: 'Longer description; supports markdown links to other component doc pages.'
slots:
  - title: default
    description: The main content area.
    # fallback_for / child_component.name are auto-derived from the .astro
    # source — only declare them here to override an ambiguous derivation
    # (e.g. a slot fed by more than one prop) or add a description.
examples:
  - slugs: [variant-a, variant-b]
  - title: Sizes
    slugs: [size-sm, size-md, size-lg]
---
```

- `slots` — a patch over derived slot metadata, keyed by `title` (the slot name). Most components need no `slots:` block at all; declare an entry only to add a `description`, or to supply `fallback_for`/`child_component` for a slot `docs:check`/the build warns is ambiguous (e.g. `Split`'s `first`/`second` slots, or a `<slot>` whose content branches across more than one prop). `fallback_for` must name a prop the component actually destructures; `child_component.name` must resolve to a sibling `.astro` or a real component key — `docs:check` fails otherwise.
- `examples` — groups of example slugs shown together; optional `title` and `size` per group. `primary` renders automatically and need not be listed. Every other on-disk example not referenced by a group is a `docs:check` WARN (invisible in the viewer) once an `index.md` declares `examples:` at all — with no `index.md`/no `examples:` key, on-disk examples still render, one group per file.

## examples/primary.md

```yaml
---
title: Primary My Component
spacing: all # layout hint: 'all' pads the viewer, null for none
blocks:
  _component: building-blocks/wrappers/my-wrapper # same path as structure-value.yml
  variant: default
---
```

`blocks` is the component rendered live: `_component` plus its props — only props the component actually destructures (or accepts via `inputs.yml`/`structure-value.yml`, or forwards through a rest-spread as an HTML-passthrough attribute like `style`/`class`/`aria-*`). `docs:check` fails on drift here too, so an example can't quietly reference a prop that no longer exists. Nest child blocks by their own `_component` paths:

```yaml
blocks:
  _component: building-blocks/wrappers/card
  border: true
  contentSections:
    - _component: building-blocks/core-elements/heading
      text: Card heading
      level: h3
    - _component: building-blocks/core-elements/text
      text: Card body text.
```

## Remediation: `docs:check` FAIL/WARN

| Message                                                                       | Fix                                                                                                         |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `no main component at src/components/<key> — delete or rename`                | The docs dir outlived its component (renamed/removed). Delete or rename the docs dir to match.              |
| `missing/empty title:` / `missing blocks:`                                    | Every `examples/*.md` needs both — add them.                                                                |
| `prop "<x>" ... is not destructured/in inputs.yml/...`                        | The example uses a prop the component doesn't have. Fix the example (most common) or add the prop for real. |
| `examples entry references missing examples/<slug>.md`                        | An `index.md` `examples:` group points at a file that doesn't exist — fix the slug or add the file.         |
| `not referenced by any group` (WARN)                                          | Add the slug to a fitting group in `index.md`, or delete the example if it's redundant.                     |
| `fallback_for "<x>" is not a prop ... destructures`                           | Fix the slot override to name a real destructured prop, or remove it and let derivation handle it.          |
| `child_component.name "<x>" is not a sibling .astro or a known component key` | Fix the name, or remove the override if derivation already resolves it.                                     |
