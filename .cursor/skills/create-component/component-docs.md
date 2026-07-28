# Component library docs entry

Every component gets a docs entry under `src/component-docs/content/components/`, mirroring the component path (e.g. `building-blocks/wrappers/modal/`). The `/component-docs` route renders these as live examples; it is excluded from production builds.

## Files

```
src/component-docs/content/components/{tier-path}/{slug}/
├── index.md              # overview + example index
└── examples/
    ├── primary.md        # default example — always required
    ├── {prop}-{value}.md # one per notable prop variation (size-sm.md, variant-ghost.md)
    └── {feature}.md      # one per notable feature (icons.md, border.md)
```

## index.md

```yaml
---
title: My Component
overview: 'Short description; supports markdown links to other component doc pages.'
slots:
  - title: default
    description: The main content area.
    fallback_for: contentSections
examples:
  - slugs: [variant-a, variant-b]
  - title: Sizes
    slugs: [size-sm, size-md, size-lg]
---
```

- `slots` — slot names with `description` and `fallback_for` (the prop the slot falls back to).
- `examples` — groups of example slugs shown together; optional `title` and `size` per group. `primary` renders automatically and need not be listed.

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

`blocks` is the component rendered live: `_component` plus its props. Nest child blocks by their own `_component` paths:

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
