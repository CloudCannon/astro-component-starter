<!--
Vendored from CloudCannon/agent-skills @ b70076b102b0f1e20d05c4e3328d822f2298e115
Upstream paths:
  - skills/cloudcannon-configuration/SKILL.md (§ Common invalid keys, § Symptom-driven gotchas)
  - skills/cloudcannon-configuration/astro/configuration-gotchas.md (validation-related sections)
Adapted for this starter (astro-component-starter) — resync by diffing against upstream.
"In this starter:" callouts mark where generic CloudCannon guidance is overridden here.
CLI config-generation flows from upstream are dropped. Validation is kept but rebuilt on the
official JSON Schemas via `npm run lint:schema` instead of the CLI — see below.
See .agents/skills/STYLE.md § "This starter overrides generic CloudCannon docs".
-->

# CloudCannon config — invalid keys & validation

Generic reference for hallucinated / invalid CloudCannon configuration keys and the validation guidance around them. LLM training data invents keys that don't exist; the JSON schemas at [cloudcannon/configuration-types](https://github.com/cloudcannon/configuration-types) are the only authoritative source.

> **In this starter:** validate config with **`npm run check`**, which includes **`npm run lint:schema`** — every co-located `*.cloudcannon.*.yml` and `.cloudcannon/structures/*.yml` is validated against the official JSON Schemas from `@cloudcannon/configuration-types` (a pinned devDependency), using that package's own `loadValidator` for error presentation. Each glob maps to the schema for the `*_from_glob` key that loads it. So the keys listed below are now **machine-checked**, not just documentation.
>
> Config **generation** remains off-limits: `npx @cloudcannon/cli configure generate` would flatten this repo's co-located, glob-collected config into a monolith with inline `_structures` — see [STYLE.md § This starter overrides generic CloudCannon docs](../STYLE.md). Do not add a CLI step to any workflow, and do not commit a schema file; the pinned package replaces the `curl` recipe below. Validation via the schema carries none of the generation risk — it only reads.
>
> **Two lints, different axes, neither subsumes the other:** `lint:cms` checks YAML against the _components_ (prop drift, orphaned files, `_component` resolution); `lint:schema` checks YAML against _CloudCannon_ (invalid keys, out-of-enum values, wrong input types). A file can name every prop correctly and still be rejected by the editor.

## Common invalid keys

Observed LLM hallucinations — not exhaustive. Each row gives the real key.

| Wrong                                                                                            | Correct                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `disable_url_preview: true`                                                                      | `disable_url: true` (toggles whether the collection has an output URL)                                                                                                                                                                                                               |
| `output: false` (legacy Jekyll/Hugo/Eleventy key)                                                | Omit `url:` and add `disable_url: true` — or use `data_config` instead of a collection                                                                                                                                                                                               |
| `type: hidden` (deprecated value)                                                                | `hidden: true` (sibling of `type`, works on any input; also `hidden: "<query>"` for conditional hiding)                                                                                                                                                                              |
| `options.max` on text/textarea                                                                   | `options.max_length` (paired with `min_length`)                                                                                                                                                                                                                                      |
| `_editables.text: { bulletedlist, blockquote, format, table, ... }`                              | `_editables.text` is inline-only (`TextEditable`). For block-level formatting use `_editables.content` or `_editables.block` (`BlockEditable`)                                                                                                                                       |
| `heading2: true`, `heading3: true`                                                               | `format: "p h1 h2 h3 h4 h5 h6"` (space-separated string)                                                                                                                                                                                                                             |
| `options.collections: [team]` (invented)                                                         | `values: collections.team` with `value_key` / `preview`                                                                                                                                                                                                                              |
| `options.structures: my_blocks` (bare name, invalid)                                             | `options.structures: _structures.my_blocks` (full path)                                                                                                                                                                                                                              |
| `preview.view: gallery` on a snippet (**deprecated**, not invalid — the schema still accepts it) | Set `view:` at the **top level** of the snippet (sibling of `preview`/`template`), enum `card` \| `inline` \| `gallery`. Defaults to `card`, or `inline` when the snippet sets `inline: true`. Note `view` is a snippet-only key — the structure `preview` block rejects it outright |
| `timezone: "+10:00"` (UTC offset, invalid)                                                       | `timezone` is a top-level key and a strict IANA-name enum (e.g. `Australia/Melbourne`, `America/New_York`), not a UTC offset. Default `Etc/UTC`                                                                                                                                      |
| `paths.collections`, `paths.data` (legacy keys)                                                  | No such keys. Use `collections_config.<name>.path` and `data_config.<name>.path`                                                                                                                                                                                                     |
| Arbitrary Material Symbols name (e.g. `place`)                                                   | Icon must be in the fixed enum (e.g. `location_on`). Invalid names silently fall back — check the schema for names                                                                                                                                                                   |

## Symptom-driven gotchas

| Symptom                                                                                                                       | Fix                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hardcoded `{value, label}` pairs for values that live in a data file                                                          | Reference `values: data.<file>` + `value_key` + `preview` so the dropdown stays in sync with the data.                                                                                                                                                                                                             |
| Defined a switch/boolean in `_inputs` but the template never reads it                                                         | An editor-visible switch that toggles nothing is a broken UX signal. For every boolean/enum field, grep the template for a conditional render. If none, add one or remove the field.                                                                                                                               |
| `type: markdown` with no `options:`, or using plural `snippets:`                                                              | Editor shows an "unconfigured snippets" toolbar. Every markdown input needs explicit `options:`. Once you declare any option, all omitted keys become false. Valid keys: `bold`, `italic`, `link`, `bulletedlist`, `numberedlist`, `blockquote`, `format`, `image`, `removeformat`, `table`, `snippet` (singular). |
| Data file is a top-level object keyed by slug (`{ "office-a": {...}, "office-b": {...} }`)                                    | Editors can't add a third item — keys are baked into `file_config`. Convert to a top-level array with an explicit `slug` field per item; consumers switch from `data[slug]` to `data.find(d => d.slug === s)`.                                                                                                     |
| Visual editor errors on one entry but not others — the errored entry has a frontmatter field the template renders as editable | The collection's `_inputs` has no entry for that field. Grep every `data-prop=` in the template, grep `_inputs:`, diff the keys. Any editable region without a matching `_inputs` entry is the bug. Add an entry whose `type:` matches the region's `data-type`.                                                   |

> **In this starter:** `data-prop` values are **camelCase** and the discriminator is `_component` (not `_type`) — keep that in mind when diffing `data-prop=` regions against `_inputs` keys. Field-type config lives in co-located `*.cloudcannon.inputs.yml` files, not one central config.

## `_editables` key-to-schema mapping

`_editables` has five keys, each backed by a different schema. The available toolbar options depend on which key — mixing them is the most common `_editables` mistake.

| Editable key | Schema          | Inline formatting | Block formatting (lists, blockquote) | `format` dropdown | Image options      |
| ------------ | --------------- | ----------------- | ------------------------------------ | ----------------- | ------------------ |
| `content`    | `BlockEditable` | yes               | yes                                  | yes               | yes                |
| `block`      | `BlockEditable` | yes               | yes                                  | yes               | yes                |
| `text`       | `TextEditable`  | yes               | no                                   | no                | no                 |
| `image`      | `ImageEditable` | n/a               | n/a                                  | n/a               | image options only |
| `link`       | `LinkEditable`  | n/a               | n/a                                  | n/a               | n/a                |

**`_editables.text` is inline-only.** It does NOT have `bulletedlist`, `numberedlist`, `blockquote`, `format`, `table`, or any block-level option — only inline formatting (`bold`, `italic`, `link`, `strike`, `subscript`, `superscript`, `underline`, `undo`, `redo`, `removeformat`, `copyformatting`, `remove_custom_markup`, `allow_custom_markup`). For block-level controls, use `_editables.content` or `_editables.block`.

**Headings are a `format` string, not boolean keys.** `heading2: true` / `heading3: true` are not in the schema. Use `format: "p h1 h2 h3 h4 h5 h6"` (space-separated).

## Toolbar options: "omitted = false"

Once you declare **any** key in `_editables.content` (or in an `_inputs.*.options` block on `type: html`/`type: markdown`), every omitted key becomes `false`. Adding one option (e.g. `styles` or `table`) strips the default inline toolbar unless you re-declare the defaults you want to keep.

```yaml
_editables:
  content:
    blockquote: true
    bold: true
    bulletedlist: true
    format: p h1 h2 h3 h4 h5 h6
    image: true
    italic: true
    link: true
    numberedlist: true
    removeformat: true
    snippet: true
    table: true
```

For heading-level fields (title, subtitle) on `type: html`, intentionally omit block-level options — only inline formatting is appropriate. `markdown.options.table` controls serialization (Markdown vs HTML output); `_editables.content.table` controls the toolbar button — set both when content uses Markdown tables.

## Quote numeric values that map to text inputs

YAML parses bare numbers (`price: 29`) as integers. If the input is `type: text` (or defaults to text), CC throws "This text input is misconfigured. This input must have a text value." Affects both structure default values and content frontmatter.

**Fix:** quote as a string (`price: "29"`) or configure the input as `type: number`. Common culprits: `price`, `amount`, `count`, `order`, `rating`.

## Configure variant / enum-like fields as select inputs

When a field has a small, closed set of valid values (`variant: primary | secondary | tertiary | link`, `target: _self | _blank`, `size: sm | md | lg`, `align: left | center | right`), configure it as a `select` input. Plain `type: text` lets editors type "main" or "Primary " (trailing space) and silently break rendering — components branch on exact string equality.

Identify these fields:

- Anything the component uses inside a switch/ternary/`class:list` against literal values (`variant === 'primary'`).
- Component prop types declared as `'a' | 'b' | 'c'` unions in TypeScript.

Shared option sets go in a dataset under `.cloudcannon/data/` once, are registered in `data_config`, and are referenced as `values: data.<name>`; local ones inline the values:

```yaml
_inputs:
  columns:
    type: select
    options:
      value_key: id
      preview:
        text:
          - key: name
      values:
        - name: Two columns
          id: 2
        - name: Three columns
          id: 3
        - name: Four columns
          id: 4
```

Leave `allow_create: false` (default) for component-API enums — typing an unrecognized value is always a bug. `allow_create: true` is for the two fields where it isn't: icon names, and the form components' `autocomplete` (an HTML attribute whose grammar is compound, so `data.autocomplete_tokens` can list the common tokens but never all legal values).

## Array item previews — `[*]` vs structure value

Where the preview lives depends on whether the array has `structures:`.

| Array shape                                                                     | Preview location                                                                    |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Plain array — no `structures:`                                                  | `arrayName[*]` in `_inputs`                                                         |
| Structured array — `structures: _structures._foo` OR inline `structures: {...}` | Inside the structure value itself, alongside `label` / `icon` / `value` / `_inputs` |

`[*]` previews on a structured array validate clean and silently do nothing. If you see arrays with `structures:` and a matching `[*]` preview block, the `[*]` is dead weight — delete it and move the config onto the structure value. See [structures.md § Previews](structures.md#previews).

Do **not** add `type: object` to `arrayName[*]` for snippet array items — the repeating parser already defines the item shape.

```yaml
# ✓ Plain array — [*] preview is correct here
_inputs:
  tab_items:
    type: array
  tab_items[*]:
    options:
      preview:
        text:
          - key: name
        icon: tab
```

## Data inputs must follow the JSON, not a template

Before finalizing `file_config` for a data file, grep the actual JSON keys and ensure every key has a matching input. Copying `colors.primary` / `colors.accent` from a reference template is only correct if the JSON actually has those keys. Mismatches fail silently in both directions.

| Mismatch                       | Symptom                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Input defined, key not in JSON | Input is silently ignored. No warning, no editor UI, no-op at build.                                                      |
| Key in JSON, no input defined  | Falls through to a plain text field. Editors see a raw text box where a color picker / switch / image uploader should be. |

**Recipe:** list every leaf key path in each JSON file and cross-reference against the `_inputs` scope:

```bash
jq -r 'paths(scalars) | join(".")' src/data/*.json | sort -u
```

Every path should have a corresponding `_inputs` entry or be intentionally left untyped. Keys in `_inputs` that do NOT appear in the JSON are dead config — remove them.

> **In this starter:** site nav/footer/SEO data lives in `src/data/*.json` (see CLAUDE.md). Fonts are the exception — they change in `site-fonts.mjs` only, owned by the `adding-fonts` skill.

## `_inputs` key collision across nesting levels

`_inputs` matches by key name regardless of nesting depth. Use dot syntax to disambiguate when the same key appears with different types:

```yaml
_inputs:
  theme_color.primary:
    type: color
  font_family.primary:
    type: text
```

## Verify your work

- Run `npm run check` after any config change — `astro check`, YAML lint, `lint:cms`, and `lint:schema` (official JSON Schema validation of every config fragment).
- `npm run lint:schema` on its own for a fast config-only pass; `node scripts/cms/lint-schema.mjs --only <substring>` to scope it to one component while iterating.
- For a definitive key check, query the pinned schema in `node_modules` — no download, and it matches the version the lint uses:
  ```bash
  jq '.definitions["collections_config.*"].properties | keys' \
    node_modules/@cloudcannon/configuration-types/dist/cloudcannon-config.latest.schema.json
  ```
  The per-fragment schemas sit beside it, named for the `*_from_glob` key that loads them: `cloudcannon-structure-value`, `cloudcannon-inputs`, `cloudcannon-snippets`, `cloudcannon-structures`. Do not add a CLI step to any workflow.
- **A clean `lint:schema` is not proof the editor is happy.** Some keys are valid-but-**deprecated** (e.g. `preview.view` on a snippet) and some are accepted-but-ignored, so they pass. Load the component in CloudCannon for anything behavioural.
- Open `npm run dev` and confirm inputs render as the intended type (select, image, switch) — a field falling through to plain text means a missing or misnamed `_inputs` entry.
