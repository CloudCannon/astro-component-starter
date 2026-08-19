<!--
Vendored from CloudCannon/agent-skills @ b70076b102b0f1e20d05c4e3328d822f2298e115
Upstream path: skills/cloudcannon-configuration/structures.md
Adapted for this starter (astro-component-starter) — resync by diffing against upstream.
"In this starter:" callouts mark where generic CloudCannon guidance is overridden here.
CLI-config-generation flows from upstream are dropped — this repo does not generate config.
See .agents/skills/STYLE.md § "This starter overrides generic CloudCannon docs".
-->

# Structures

Structures are templates that define the complete shape of data in CloudCannon. They serve two purposes:

1. **Array items** — when an editor adds a new item to an array (e.g. a page-builder `sections` array), the structure populates the item with all required fields.
2. **Object inputs** — when an object input is empty, a structure tells CloudCannon what fields to offer when the editor populates it.

Without structures, CloudCannon can't populate new array items or empty objects, and existing items may have `undefined` fields that break editable regions in the Visual Editor.

> **In this starter:** structures do **not** live inline in `cloudcannon.config.yml`, and they are **not** CLI-generated. They live in `.cloudcannon/structures/*.cloudcannon.structures.yml`, and each pulls its values from per-component co-located `*.cloudcannon.structure-value.yml` files via `values_from_glob`. Field-type config lives in co-located `*.cloudcannon.inputs.yml`, pulled in via `_inputs_from_glob`. The `create-component` skill owns the file layout and templates; this reference owns the underlying rules. Ignore any upstream text about generating structures with the CloudCannon CLI.

## The four rules (read first)

Non-optional. Each is expanded later; the table is the quick reference.

| #   | Rule                                                                                                                                                        | Failure mode if skipped                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Every field in a structure `value` is present in the content frontmatter, even if empty.                                                                    | `undefined` errors in the Visual Editor.                                                |
| 2   | Every array and object input has an `_inputs` entry with `type: array`/`type: object` and an explicit `options.structures: _structures.<name>` (full path). | Editors cannot add items — the Add button won't appear or offers the wrong structure.   |
| 3   | Every structure value includes a `preview` block with a meaningful `text` key lookup.                                                                       | Sidebar cards show only the generic label ("Item", "Action") instead of a useful value. |
| 4   | Every nested object field editors see has `type: object` + `options.preview.icon`.                                                                          | Generic icon in the data editor; visual clutter.                                        |

## Field completeness rule (rule #1)

For each content block in a page's page-builder array, open the structure definition and verify that **every single key** appears in the content. The rule covers any field that appears on any item — rare, conditional, or purely decorative. Commonly forgotten: `tagline`, `content`, `subtitle`, and nested object fields.

After creating or editing content files, cross-reference every block against its structure definition. Field omissions are the single most common source of CloudCannon editor errors.

### Optional fields — common mistake

Don't leave an optional field out of the structure `value` because "only some items use it." Every field that appears on any item must be in the value template with a sensible default (`""`, `false`, `0`, `[]`). Omitting it means:

- CloudCannon can't match an existing item that _does_ have the field to the structure
- Editors can't add the field to new items from the sidebar
- Items with the field round-trip as "unknown" in the editor

```yaml
# ❌ Wrong — no icon field in the value template
value:
  type: link
  label: Label
  href: /
  external: false

# ✓ Right — icon present as empty default
value:
  type: link
  label: Label
  href: /
  icon: ''
  external: false
```

### Don't seed empty strings for genuinely-optional fields

There's a tension with rule #1: every field that appears on any item must be in the value, but an `""` default for a field no item should have **on creation** persists into frontmatter and breaks downstream conditionals.

```yaml
# ❌ Wrong — empty string persists, surfaces as a visible empty editable region
value:
  heading: Ready to Begin?
  primaryLabel: Schedule a Consultation
  secondaryLabel: '' # breaks ?.trim() button conditionals
  secondaryHref: ''

# ✓ Right — omit optional fields the editor adds explicitly
value:
  heading: Ready to Begin?
  primaryLabel: Schedule a Consultation
```

Reconcile: rule #1 means "if any **existing** item has the field, the value template must declare it (with empty default)." It does NOT mean "seed every nullable field as `''`." Audit `*.cloudcannon.structure-value.yml` — every `: ""` is either a real default (keep) or an over-eager seed (delete).

> **In this starter:** props are **camelCase** (`primaryLabel`, `secondaryHref`), matching the component `.astro` destructure. Upstream snake_case examples (`primary_label`) do not apply.

### Handling null values from empty YAML fields

In YAML, a bare key with no value (`tagline:`) parses as `null`, not `""` or `undefined`. Zod's `.optional()` accepts `undefined` but rejects `null`, so content files with empty fields can silently fail validation.

| Approach         | How                                                                                                      | When to use                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Zod `.nullish()` | Replace `.optional()` with `.nullish()` on optional fields. Accepts `T \| null \| undefined`.            | Default — no per-field CC configuration needed.                                          |
| CC `empty_type`  | Set `empty_type: string` (or appropriate type) on the input in `_inputs`. Writes `""` instead of `null`. | When downstream code distinguishes `null` from `""`, or the Zod schema must stay strict. |

When using `.nullish()`, component templates should still use truthiness checks (`{title && ...}`) — both `null` and `""` are falsy.

> **In this starter:** the content schema lives in `src/content.config.ts`. Prefer `.nullish()` there.

## Structure files in this starter

Each page-builder component contributes one structure value. The registry file collects them:

```yaml
# .cloudcannon/structures/buttonSections.cloudcannon.structures.yml
buttonSections:
  id_key: _component
  style: modal
  values_from_glob:
    - /src/components/building-blocks/core-elements/button/button.cloudcannon.structure-value.yml
```

- **`id_key: _component`** — the discriminator field name. This starter uses `_component`, **not** `_type` (see below).
- **`values_from_glob`** — collects one structure value per co-located `*.cloudcannon.structure-value.yml`.
- **`style: modal`** — opens a proper form when adding/editing, instead of inline free-text fields.

### Two icon systems — do not mix them

This repo uses **two unrelated icon vocabularies**, and confusing them is silent:

| Key                                                                   | Vocabulary                                                              | Where                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| `icon:` on a structure value, `preview`, or `picker_preview`          | **Material Symbols**, a fixed 3,584-name enum in the CloudCannon schema | Editor chrome — Add menu, cards, pickers |
| an `iconName` / `icon` **input value** (`values: _select_data.icons`) | **Heroicons**, SVGs in `src/icons/`                                     | Rendered on the page by the component    |

`_select_data.icons` is **generated** — add or remove an SVG under `src/icons/` and run `npm run icons:sync` rather than editing the list by hand; `npm run icons:check` fails the build on drift.

An invalid Material Symbols name doesn't error — it silently falls back, so the Add menu just shows the wrong icon. Heroicons names are kebab-case (`eye-slash`, `device-phone-mobile`) and Material Symbols are snake_case (`visibility_off`, `smartphone`), which is the tell: **a kebab-case `icon:` is always wrong.** `npm run lint:schema` now catches these.

To find a valid name, query the enum rather than guessing — the schema is the only authority, and levenshtein "closest" suggestions are unhelpful at this enum size (`hero` → `eco`):

```bash
# Swap /nav/ for whatever you're looking for. Picks the one large enum (the icon
# list) so unrelated enums like mime types don't pollute the results.
node -e "const s=require('./node_modules/@cloudcannon/configuration-types/dist/cloudcannon-structure-value.schema.json');
const icons=Object.values(s.definitions).flatMap(d=>(d.anyOf||[d])).map(b=>b.enum).find(e=>e&&e.length>1000);
console.log(icons.filter(n=>/nav/.test(n)).join(', '))"
```

### Where a named `_structures` block may live

A named `_structures:` block belongs in `.cloudcannon/structures/*.cloudcannon.structures.yml` (collected by the root `_structures_from_glob`), or inside a `structure-value.yml` / `snippets.yml` for structures private to that one component.

**Never in a `*.cloudcannon.inputs.yml`.** That file is loaded via `_inputs_from_glob` and read as a map of input-name → input-config, so an `_structures:` key there parses as an input literally named `_structures` — `lint:schema` rejects it. Worse, every such file lands in one shared namespace, so two components declaring the same structure name silently collide and load order picks the winner.

### `options.structures` takes a string or an object — never an array

```yaml
# ❌ Wrong — an array. Reads as neither a reference nor a structure; the editor
#    gets no structures at all and falls back to inferred fields.
options:
  structures:
    - label: Feature slide
      value: { ... }

# ✓ Right — a reference by full path (preferred; reusable, one definition)
options:
  structures: _structures.featureSlides

# ✓ Right — an inline structure object, array wrapped under `values:`
options:
  structures:
    values:
      - label: Feature slide
        value: { ... }
```

A reference uses the full path (`options.structures: _structures.buttonSections`), never the bare name.

```yaml
# ❌ Wrong — bare name, relies on naming-convention fallback
options:
  structures: buttonSections

# ✓ Right — full path
options:
  structures: _structures.buttonSections
```

### `values_from_glob` vs `_structures_from_glob`

| Helper                  | What it imports                                                            | Use when                                                      |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `values_from_glob`      | Individual structure values into an array. One file = one structure value. | Per-component structure values (the default in this starter). |
| `_structures_from_glob` | Named structure groups. One file defines an `_structures`-like block.      | Grouping multiple related structures in one file.             |

## Shared sub-structures

Structures used by multiple block types — `links`, `socials`, `formBlocks`, etc. — live in their own registry file under `.cloudcannon/structures/` and are referenced by name from the structure-value files that use them.

**Only share when all consumers render the same fields.** If one component renders fields the others don't, create a separate structure for it instead of a union. Union structures clutter the editor with inputs that do nothing; editors fill them in expecting results and get confused when nothing appears.

### Shared structure → shared preview

A structure's `preview` applies wherever the structure is used — a shared `links` structure can't have different icons per consumer. Pick an icon meaningful to the structure's own identity (`link` for links, `help` for FAQ items), not to any one consumer's context.

- ❌ Forking a structure into near-duplicates just to vary the icon.
- ❌ Adding `[*]` overrides on the array per-consumer — silently ignored when `structures:` is defined (see [config-invalid-keys.md § Array item previews](config-invalid-keys.md#array-item-previews--vs-structure-value)).
- ✓ One structure, one preview. If two consumers truly need different previews, they need different structures.

### Duplicated select values across structure-value files

If two structure-value files define the same color palette or icon enum, a third will drift. Move shared enums to `_select_data.<name>` and reference with `values: _select_data.<name>`.

Shared sub-structures need `preview` blocks like any other structure. Every structure-value file that contains an array field (`links: []`, `socials: []`, etc.) must include an `_inputs` entry linking that array to the shared sub-structure:

```yaml
_inputs:
  links:
    type: array
    options:
      structures: _structures.links
```

## Previews

Previews go on **every** structure value. If an array has `structures:`, its item previews live on the structure value, **not** on the array's `[*]` path — see [config-invalid-keys.md § Array item previews](config-invalid-keys.md#array-item-previews--vs-structure-value).

Every structure value should include both `picker_preview` and `preview`:

| Preview          | Where it shows                       | Key lookups                                                 | Typical shape                             |
| ---------------- | ------------------------------------ | ----------------------------------------------------------- | ----------------------------------------- |
| `picker_preview` | Modals (Add menu, structure picker)  | Often won't resolve (item has no data yet) — use literals.  | Literal `text` + `icon`.                  |
| `preview`        | Sidebar cards, collection file lists | Supported — pull data from the item with literal fallbacks. | Cascade: `key:` lookup, literal fallback. |

Both accept cascading arrays for `text`, `icon`, `image`, and `subtext`. CloudCannon tries each cascade entry in order and uses the first non-empty result. Literal strings (not `{key: ...}` objects) serve as fallbacks.

> **In this starter:** preview `image` paths are source-tree paths (`public/component-previews/<component>.svg`), not site URLs. CloudCannon's picker looks up files in the repo — the same convention as `src/icons/{id}.svg` on icon selects. The large card slot on the Add-menu modal is `gallery.image`; `npm run previews:build` wires both.

## Structure-value file anatomy

A complete `*.cloudcannon.structure-value.yml` file (this starter's actual shape):

```yaml
label: Footer
icon: footer
description: 'Footer block with logo, links, and legal information.'
value:
  _component: navigation/footer
  logoSource: ''
  logoAlt: 'Logo'
  links: []
  socials: []
  footerText: ''
preview:
  text:
    - Footer
  icon: footer
picker_preview:
  text: Footer
  subtext: 'Footer block with logo, links, and legal information.'
  icon: footer
_inputs_from_glob:
  - /src/components/navigation/footer/footer.cloudcannon.inputs.yml
```

| Key                 | Purpose                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `label`             | Display name in the Add menu                                               |
| `icon`              | Material Icons name                                                        |
| `picker_preview`    | How it looks in modals (Add menu, structure picker)                        |
| `preview`           | How it looks as a card elsewhere (sidebar, collection lists)               |
| `value`             | The data template — `_component` discriminator plus all fields (camelCase) |
| `_inputs_from_glob` | Pulls in field-type config from the co-located `*.cloudcannon.inputs.yml`  |

> **In this starter:** field-type config (`_inputs`) is kept in a **separate** co-located `*.cloudcannon.inputs.yml` file and pulled in via `_inputs_from_glob`, rather than inlined under an `_inputs:` key in the structure-value file. This differs from the upstream single-file layout.

### The discriminator: `_component`, not `_type`

Every structure value must include a discriminator key so CloudCannon can match array items to the correct structure definition.

> **In this starter:** the discriminator is **`_component`**, and its value is the component's **kebab-case directory path** (e.g. `navigation/footer`, `building-blocks/core-elements/button`). This is resolved by `src/components/utils/renderBlock.astro` (`components[block._component]`) and matches the key registered via `registerAstroComponent`. Upstream uses `_type` throughout — everywhere upstream says `_type`, read `_component` here. The registry files set `id_key: _component` to match.

### Scoped `_inputs`

Field-type config in a structure-value's `*.inputs.yml` is scoped to that component. Only include fields that need non-default types — strings, arrays, and objects work without explicit configuration.

**Nested object inputs need preview icons too.** Object fields (e.g. `image`) show a generic icon in the data editor without explicit `type: object` + `options.preview.icon`:

```yaml
_inputs:
  image:
    type: object
    options:
      preview:
        icon: image
```

## Deriving structures from components

1. Read the component's Props interface (or destructuring) for all fields
2. Write each field into the structure `value` with the correct default (camelCase key)
3. Exclude internal-only props (see table)
4. Wire up field-type mapping in the `*.inputs.yml`

### Field-to-YAML mapping

| Prop type | YAML default                                     | Notes                                                                                                                                                                                          |
| --------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| String    | bare key (`title:`)                              | Parses as `null`. Closed value sets (variants, sizes, alignment) → `type: select` (see [config-invalid-keys.md](config-invalid-keys.md#configure-variant--enum-like-fields-as-select-inputs)). |
| Boolean   | `false`                                          |                                                                                                                                                                                                |
| Number    | `0` or the component default (e.g. `columns: 3`) | Input must be `type: number`. If input is `type: text`, quote as string (`price: "29"`).                                                                                                       |
| Array     | `[]`                                             |                                                                                                                                                                                                |
| Object    | nested shape with empty fields                   | E.g. `image:\n  src:\n  alt:`. Gives CC the object's field structure.                                                                                                                          |

### Fields to include vs exclude

| Include                                                           | Exclude                                 |
| ----------------------------------------------------------------- | --------------------------------------- |
| Content: `title`, `subtitle`, `tagline`, `content`, `description` | `id` — HTML anchors, not content        |
| Media: `image`, `images`                                          | `isDark` — theme variant, hardcoded     |
| Behaviour: `isReversed`, `isAfterContent`, `isBeforeContent`      | `classes` — CSS customization           |
| Array: `items`, `links`, `socials`, `buttonSections`              | `bg` — background slot content          |
| Configuration: `columns`, `count`                                 | `defaultIcon` — component-level default |

### Guarding empty objects and arrays in components

In YAML, `image:\n  src:\n  alt:` creates `{ src: null, alt: null }` — a truthy object. `links: []` is also truthy. Component conditionals must check for meaningful content, not just the outer value:

- Objects: check a meaningful inner field — `image?.src &&` not `image &&`.
- Arrays: check `.length` — `links?.length > 0 &&` not `links &&`.

When iterating, filter items that have nothing visible to render: `links.filter((l) => l?.text || l?.href).map(...)`.

## Default values from components

When a component defines defaults in its destructuring (`columns = 3`, `isReversed = false`), use the same defaults in the structure value. New blocks added via CloudCannon then match the component's expected defaults.

## Common mistakes

| Symptom / mistake                                                                                   | Fix                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure-value has `value:` with multiple fields but no `_inputs`                                  | Editor falls back to type inference — free-text for every field. Add a co-located `*.cloudcannon.inputs.yml` (pulled via `_inputs_from_glob`). Set `style: modal` on the registry so the editor opens a proper form.                                                                |
| One array item has a different icon/preview from its siblings, despite declaring the same structure | The divergent item's top-level key set doesn't exactly match the structure's `value:` shape — CC fell back to inferred preview. Grep each item's top-level keys, compare, drop dead keys or add empty defaults until shapes match. **Don't tweak the config first** — fix the data. |

## Verify your work

- Run `npm run check` — includes `astro check` (Zod schema) and lint of the YAML files.
- After adding a structure, open `npm run dev` and confirm the block appears in the Visual Editor Add menu with the right label/icon, and that adding it populates every field.
- Watch the dev-server console for `Component not found: <_component>` — a mismatch between the structure-value `_component` and the component directory path.
