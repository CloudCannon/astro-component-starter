# Component Manifest: single source of truth design

Status: proposal + working prototype (see `scripts/manifest/`). Written 2026-07-07.

## Problem

Each component's contract is currently written by hand in up to four places that nothing keeps in sync:

1. The prop destructuring in the `.astro` frontmatter (names + defaults)
2. `<name>.cloudcannon.inputs.yml` (editor field types, labels, comments, conditional visibility)
3. `<name>.cloudcannon.structure-value.yml` (defaults again, plus label/icon/preview — and for page sections, ~200 inlined `_inputs` lines repeating the shared section props in every file)
4. `<name>.cloudcannon.snippets.yml` (prop names + types a third/fourth time, for the 13 MDX-snippet components)

Renaming a prop touches all four; missing one produces a silent editor break. Shared vocabularies (spacing scale, content widths, color schemes) are copy-pasted as inline option lists across dozens of files.

## Design

One `*.manifest.ts` file per component becomes the single authored source. Everything else is **generated and committed**.

```
src/components/building-blocks/core-elements/button/
  Button.astro                              # authored (consumes generated defaults - later phase)
  button.manifest.ts                        # authored — THE source of truth
  button.cloudcannon.inputs.yml             # GENERATED — do not edit
  button.cloudcannon.structure-value.yml    # GENERATED — do not edit
  button.cloudcannon.snippets.yml           # GENERATED — do not edit (if snippets defined)
```

Generated files stay in the repo, byte-stable, so CloudCannon's glob aggregation, the editor, and the git diff workflow are completely unchanged. The generator is a dev-time step plus a CI check — **zero runtime or editor risk**.

### Manifest shape

```ts
import { defineComponentManifest, field, groups, options } from '@manifest';

export default defineComponentManifest({
  component: 'building-blocks/core-elements/button',
  label: 'Button',
  icon: 'variables',
  description: 'Clickable button for calls-to-action and navigation.',
  fields: {
    text: field.text({
      comment: 'The text that goes inside the button.',
      default: 'My Button',
      hidden: 'hideText',
    }),
    link: field.url({ comment: 'The URL to which the button should link.', default: '' }),
    iconName: field.select({
      comment: 'The name of the icon to display. …',
      default: '',
      options: options.icons, // shared vocabulary, defined once
    }),
    variant: field.select({
      comment: 'The presentation of button.',
      default: 'primary',
      options: options.buttonVariants,
    }),
    size: field.select({
      comment: 'The size of the button.',
      default: 'md',
      options: options.sizesSml,
    }),
    // …
  },
  preview: { subtextKey: 'text' },
});
```

Key features, driven by what the existing YAML actually needs:

- **`field.*` builders** (`text`, `textarea`, `url`, `select`, `switch`, `range`, `image`, `file`, `object`, `array`, `componentArray`) map 1:1 to the CloudCannon input types in use today. Each carries `default`, `comment`, `label`, `hidden` (bool or condition string) — enough to emit both the `_inputs` entry and the `value:` default.
- **Shared option vocabularies** (`options.spacingScale`, `options.contentWidths`, `options.colorSchemes`, `options.iconColors`, …) replace the dozens of copy-pasted `{id,name}` lists. Changing the spacing scale becomes a one-file change.
- **Shared field groups** (`groups.sectionWrapper`) — the `maxContentWidth` / `paddingHorizontal` / `paddingVertical` / `colorScheme` / `backgroundColor` / `background.*` block that every page section currently inlines (~200 lines each). A manifest spreads it: `fields: { ...groups.sectionWrapper, heading: field.text(…) }`.
- **`componentArray`** fields (e.g. `buttonSections`) reference other components' manifests for their default value, so nested defaults (a hero's default button) are derived, not copy-pasted.
- **Escape hatch:** every field takes `cloudcannon: { … }`, deep-merged last into the emitted `_inputs` entry, for anything the builders don't model (upload paths, mime types, preview templates). No feature of the current YAML is unreachable.
- **Snippets:** an optional `snippet: { inline, argTypes? }` block; arg names/types/optionality are derived from `fields`, overridable per-arg. Kills the fourth copy.

### Generator + check

`scripts/manifest/generate.mjs`:

- `--write` — regenerate the three YAML files for every component that has a manifest.
- `--check` — regenerate in-memory and **semantically diff** against the committed YAML (parse both, deep-equal). Non-zero exit on drift. This runs in CI; it is the `lint:cms` drift gate from IMPROVEMENTS.md, but stronger, because the committed YAML can never drift from the manifest without failing.
- `--check-astro` — parse each component's frontmatter destructuring (names + literal defaults) and compare against the manifest's fields/defaults. Catches the `.astro`-side rename. (Heuristic parser: the destructure pattern is highly uniform across the codebase; flag anything it can't parse rather than guessing. Reserved prop names — `class`, `useDefaultEditableBinding`, `_component`, `data-prop`, `element`, spread rest — are exempt.)

### YAML stability

`js-yaml` output is normalized (2-space indent, no anchors, stable key order = manifest authoring order). Migrating a component reformats its YAML once in the migration commit; after that, output is byte-stable so diffs stay reviewable.

### Phasing

1. **Now (prototype, this repo):** manifest lib + generator; `button` migrated; `--check` proves semantic equality with the existing handwritten YAML.
2. **Migrate mechanically:** an extraction script parses existing `inputs.yml` + `structure-value.yml` and emits a draft manifest per component; a human/agent reviews each (good agent task — the conventions are uniform). Land in batches of ~10 components. Introduce `groups.sectionWrapper` when the page sections migrate and delete their inlined duplication.
3. **Astro-side integration:** generate `<name>.defaults.ts` per component (`export const buttonDefaults = { variant: "primary", … }`) and refactor components to `const { variant = buttonDefaults.variant } = Astro.props` — or simpler, spread: `const props = { ...buttonDefaults, ...Astro.props }`. At that point defaults exist in exactly one place. Optionally emit a `Props` interface for IDE support.
4. **Beyond:** docs props tables in component-docs generated from manifests; dev-mode prop-type validation in `renderBlock.astro`; the AI create-component skill authors a manifest instead of three YAML files.

### Alternatives considered

- **Zod as the manifest language:** attractive (runtime validation for free) but the editor metadata (comments, conditional visibility, upload paths, previews) outweighs the schema part; bolting it onto zod via `.describe()`/registries gets illegible fast. A plain typed object with builders is more honest. Zod validation can still be _generated_ later (phase 4) from the same manifests.
- **Generating YAML at build time (not committed):** cleaner repo, but CloudCannon reads config from the repo, editors debug by reading the YAML, and diffs of generated output are a feature (you see exactly what an editor-facing change does). Committed + CI-checked wins.
- **Parsing `.astro` as the source of truth:** the component can't express editor concerns (comments, hidden conditions, upload paths); it would need doc-comment conventions that are just YAML-in-comments. Wrong direction.

### Risks

- **Partial migration period** has two conventions live. Mitigation: `--check` only enforces manifest-owned components; a `MANIFEST_COVERAGE.md` (generated) tracks progress; unmigrated components keep today's workflow untouched.
- **Generator bugs corrupt editor config.** Mitigation: semantic-equality proof per migrated component in the migration PR itself; YAML output is committed and reviewable.
- **The escape hatch becomes the norm.** Mitigation: `--check` warns when `cloudcannon:` passthrough exceeds N keys on a field — signal that the builder vocabulary needs extending.
