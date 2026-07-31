# CloudCannon YAML + structures registration

This skill owns the YAML file layout, templates, and structures registration for the starter. Other skills link here.

Generic structure semantics (the four rules, previews, `values_from_glob` vs `_structures_from_glob`, discriminator, null handling) live in [../references/structures.md](../references/structures.md) — read it once; this file is the starter-specific how-to.

## File layout per component

Every component ships two co-located YAML files (three if it appears in MDX):

```
{slug}/
├── {Name}.astro
├── {slug}.cloudcannon.inputs.yml            # field-type config (_inputs)
├── {slug}.cloudcannon.structure-value.yml   # label/icon/default value/previews
└── {slug}.cloudcannon.snippets.yml          # only if usable inside MDX bodies
```

All three are aggregated by glob in `cloudcannon.config.yml` (`_snippets_from_glob: /**/*.cloudcannon.snippets.yml`) and by the structure registry files — **no manual registration of these files.** The one manual step is adding a wrapper to the right `*Sections` registry (see below).

**MUST:** derive the `value:` keys and defaults from the component's actual destructure (camelCase, matching defaults). A key in the value with no matching prop, or a prop absent from the value, silently breaks the editor.

## structure-value.yml template

Model on `card.cloudcannon.structure-value.yml`.

```yaml
label: My Component
icon: crop_square # Material Symbols, snake_case — NOT a Heroicons name (see structures.md § Two icon systems)
description: Short description of what the component does.
value:
  _component: building-blocks/wrappers/my-wrapper # kebab dir path — must match the component location
  label: null
  items: []
  variant: default
preview: # sidebar cards / collection lists — key lookups resolve against the item
  text:
    - My Component
  subtext:
    - key: label
  icon: crop_square
picker_preview: # Add menu / structure picker modals — use literals, item has no data yet
  text: My Component
  subtext: Short description of what the component does.
  icon: crop_square
_inputs_from_glob:
  - /src/components/building-blocks/wrappers/my-wrapper/my-wrapper.cloudcannon.inputs.yml
```

- **`_component`** is the kebab-case directory path under `src/components/`, resolved by `renderBlock.astro`. A mismatch is the #1 cause of a section not rendering (see Verify in SKILL.md).
- **Every field the component reads must appear in `value:`** with a sensible default. See [structures.md rule #1](../references/structures.md#field-completeness-rule-rule-1) and the caveat on not over-seeding `""` for genuinely-optional fields.

## inputs.yml template

Only fields needing non-default editor config need an entry — plain strings, arrays, and objects work off type inference, but the [structures.md](../references/structures.md#common-mistakes) guidance is to give multi-field components explicit inputs so the editor opens a proper form rather than free-text.

```yaml
text:
  type: text
  comment: The main text content.
variant:
  type: select
  comment: Visual style variant.
  options:
    values:
      - id: default
        name: Default
      - id: accent
        name: Accent
items:
  type: array
  comment: Items to display.
  options:
    structures: _structures.myItems # full path, never the bare name
description:
  type: markdown
  comment: Rich text.
  options: { bold: true, italic: true, link: true }
source:
  type: image
  comment: Image source.
  options:
    paths: { uploads: src/assets/images, static: '' }
    resize_style: contain
    width: 1920
    height: 1280
iconName:
  type: select
  comment: Icon to display.
  options:
    values: _select_data.icons # shared vocabulary, defined once in cloudcannon.config.yml
```

Field types in use: `text`, `textarea`, `markdown`, `select`, `switch`, `array`, `object`, `image`, `file`, `url`, `range`, `number`. Visibility: `hidden: true` (always) or `hidden: "!someField"` / `hidden: "field !== 'x'"` (conditional). For shared enums (colorScheme, spacing, icons) reference `_select_data.*` rather than copy-pasting option lists.

## Page sections: the section-wrapper `_inputs` block

**Convention:** a page section's `inputs.yml` carries the `CustomSection` wrapper props (`sectionLabel`, `maxContentWidth`, `paddingHorizontal`, `paddingVertical`, `colorScheme`, `lockColorScheme`, `backgroundColor`, `background.*`) — ~185 lines — below its own content props, separated by this exact marker line:

```yaml
# --- section wrapper inputs (CustomSection) ---
```

The block is deliberately **inline and per-component**, not extracted to a shared file: a project that wants fewer size or padding steps edits the lists right where it reads them. Wrappers and core elements have no wrapper block at all.

**It belongs in `inputs.yml`, never in an inline `_inputs:` block in `structure-value.yml`.** Three reasons:

- `structure-value.yml` and `snippets.yml` both already `_inputs_from_glob` the same `inputs.yml`, so one copy serves both. An inline block serves only the file it sits in — edit the sizes in `structure-value.yml` and the MDX snippet silently keeps the old list.
- `lint:cms` reads `inputs.yml` top-level keys and the structure-value `value:` — **never** an inline `_inputs:`. Anything in that block is invisible to prop-drift checking. (`lockColorScheme` sat unwired in all 11 sections that way.)
- `lint:schema` validates it against the official `_inputs_from_glob` schema.

**MUST NOT** hand-type the block — `npm run new:component` copies it in for you, slicing `cta-center.cloudcannon.inputs.yml` from the marker down. If you are writing a page section by hand, copy from that marker and edit only the component-specific fields above it.

All 11 page sections now follow this shape, and `lint:cms` + `lint:schema` both pass over it — so any page section is a valid model. `cta-center` remains the canonical donor because the scaffolder slices from it.

## Child content arrays

A wrapper that holds arbitrary building blocks (like `Card`'s `contentSections`) references a named structure context. Two shapes:

| Shape                         | When                                                                       | How                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Fixed child (`AccordionItem`) | The array is always the same child component with inline fields.           | Add an `_structures:` block to the structure-value.yml (see `accordion.cloudcannon.structure-value.yml` — `accordionItems`).         |
| Arbitrary blocks              | The array holds any registered building block, rendered via `renderBlock`. | Point the input at a `*Sections` registry: `options.structures: _structures.myThingSections`, and create that registry file (below). |

## Structures registration (`.cloudcannon/structures/*.cloudcannon.structures.yml`)

Each registry file names a context and lists which components can be placed there via `values_from_glob`.

```yaml
# .cloudcannon/structures/buttonSections.cloudcannon.structures.yml
buttonSections:
  id_key: _component # this starter's discriminator — NOT _type
  style: modal # open a proper form when adding/editing
  values_from_glob:
    - /src/components/building-blocks/core-elements/button/button.cloudcannon.structure-value.yml
```

### What is automatic vs manual

| Component type | Where it needs registering                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Page section   | **Automatic.** `pageSections` globs `/src/components/page-sections/**/*.cloudcannon.structure-value.yml`.                                     |
| Core element   | **Automatic** in most section contexts (`containerSections` etc. glob core-elements) — but `button` and `pagination` are explicitly excluded. |
| Wrapper        | **Manual.** Add its `structure-value.yml` path to every `*Sections` registry where it should be placeable.                                    |

### Registry files and their contexts

| File                      | Context                             |
| ------------------------- | ----------------------------------- |
| `containerSections`       | Custom sections (main content area) |
| `splitSections`           | Inside split layouts                |
| `gridItemSections`        | Inside grid items                   |
| `cardSections`            | Inside cards                        |
| `accordionSections`       | Inside accordion items              |
| `carouselSections`        | Inside carousel slides              |
| `contentSelectorSections` | Inside content-selector panels      |
| `bentoBoxSections`        | Inside bento-box items              |
| `modalSections`           | Inside modals                       |
| `formBlocks`              | Form field areas (Form, cta-form)   |
| `buttonSections`          | Button groups (button only)         |
| `pageSections`            | Top-level page sections (glob)      |

(`navData`, `links`, `socials` also live here but define site-data shapes, not component pickers — see the [site-data-navigation skill](../site-data-navigation/SKILL.md).)

**To place a new wrapper:** add its `structure-value.yml` path to `containerSections` plus every other context where it makes sense. Copy an existing entry for the exact path format (leading `/src/...`).

**To give a component a new nested content area:** create `.cloudcannon/structures/{name}Sections.cloudcannon.structures.yml` (copy `modalSections` or `cardSections`), list the components allowed inside, and reference it from the array input as `_structures.{name}Sections`.

## snippets.yml (MDX-insertable page sections only)

Only page sections usable inside markdown/blog bodies need this. Model on `cta-center.cloudcannon.snippets.yml`.

```yaml
myComponent:
  template: mdx_component
  inline: false
  preview:
    text: [My Component]
    subtext: [{ key: heading }]
    icon: hero
  definitions:
    component_name: MyComponent # PascalCase, matches the .astro import name
    named_args:
      - editor_key: heading
        type: string
        optional: true
        remove_empty: true # string fields
      - editor_key: buttonSections
        type: array
        optional: true # array fields omit remove_empty
  _inputs_from_glob:
    - /src/components/page-sections/.../my-component.cloudcannon.inputs.yml
```

Booleans use `type: boolean`. The `named_args` mirror the editor keys the section reads.

**MUST NOT** add an inline `_inputs:` block here — `_inputs_from_glob` already pulls the whole `inputs.yml`, section-wrapper block included. An inline copy shadows it and drifts silently (see the convention section above).

Add `image: /component-previews/<tier>/<path>/<slug>.svg` under `preview:` so the MDX snippet picker shows the same thumbnail as the structure picker. `npm run previews:build` wires this for you; a snippet whose `preview:` has its own `gallery:` block is deliberately skipped.
