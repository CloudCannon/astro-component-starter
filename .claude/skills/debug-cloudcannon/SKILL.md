---
name: debug-cloudcannon
description: Use when something is wrong with CloudCannon visual editing in this starter — a section renders blank, a component is missing from the "Add" menu, inline edits don't update, an interactive component is dead in the editor, or `npm run check` fails on previews or skills drift. Symptom-first diagnosis and fix.
---

# Debug CloudCannon

A symptom → diagnosis → fix playbook for CloudCannon visual editing in this starter. Find the symptom, read the likely cause, apply the fix. This skill owns diagnosis; the linked skills own the templates and attribute references — follow them for the actual repair.

## When to use

- A page section renders blank or you see a "Component not found" warning.
- A component you added is missing from the Visual Editor "Add" menu.
- An interactive component (carousel, etc.) works on the live site but is dead in the editor.
- Clicking an element in the editor does nothing, or sidebar edits don't update the preview.
- `npm run check` fails on previews or skills drift, or CloudCannon reports invalid config keys.

## When not to use

- Building a component from scratch — [create-component](../create-component/SKILL.md). Come back here when it misbehaves.
- Wiring editable regions on a working component — [editable-regions](../editable-regions/SKILL.md).
- Authoring page content or nav data — [page-content-authoring](../page-content-authoring/SKILL.md) / [site-data-navigation](../site-data-navigation/SKILL.md).

## Gather evidence first

Diagnose from a real signal, not a guess. Each surface shows different failures.

| Surface                       | How to open                                                | Shows                                                                                                                                                    |
| ----------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev-server terminal           | the terminal running `npm run dev`                         | `renderBlock`'s `Component not found` warning on a normal page render (the component renders server-side), plus Astro build/type errors.                 |
| Browser console in the editor | open the CloudCannon Visual Editor, then browser dev tools | the same `Component not found` warning when the editor re-renders a block; `[editor-live-sync]` logs (DEV only); `Carousel: skipping setup` debug lines. |
| `npm run check` output        | run it in the terminal                                     | `DRIFT`/`MISSING` lines for previews and skills sync; lint, format, and `astro check` type errors.                                                       |
| CloudCannon build logs        | the site's build output in the CloudCannon app             | structure and snippet parse errors, invalid config keys.                                                                                                 |

## Symptom index

| Symptom                                                           | Go to                                                     |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| Section renders blank / `Component not found` warning             | [Component not found](#component-not-found)               |
| New component absent from the editor "Add" menu                   | [Missing from the Add menu](#missing-from-the-add-menu)   |
| Interactive component works live, dead in the editor              | [Dead interactive component](#dead-interactive-component) |
| Click does nothing / sidebar edit doesn't update the preview      | [Editable binding dead](#editable-binding-dead)           |
| CloudCannon build error, invalid/ignored config key               | [Config build errors](#config-build-errors)               |
| `npm run check` fails: `DRIFT .cursor/skills` or `.claude/skills` | [Skills drift](#skills-drift)                             |
| Snippet missing from the MDX/content editor picker                | [Snippet missing](#snippet-missing)                       |

## Component not found

**Symptom:** the section is blank and the console prints `Component not found: <_component>. Available components: [ ...keys ]`.

`renderBlock.astro` resolves each block's `_component` string against a glob-built registry of every `.astro`/`.jsx` under `src/components/`. No match → it logs the warning and renders `null`. The warning lists every valid key — compare your `_component` against that list.

| Likely cause                                                         | Fix                                                                                                                                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `_component` is a typo / wrong case (`.../HeroCenter`, `.../Button`) | It is the **kebab-case directory path**, not PascalCase. Copy the exact key from the warning's list.                                      |
| Missing a category or subcategory segment (`heroes/hero-center`)     | Use the full path from `src/components/` (`page-sections/heroes/hero-center`).                                                            |
| Component file lives outside `src/components/`                       | The glob only captures that tree. Move it under the correct tier directory.                                                               |
| Filename doesn't kebab-match its directory                           | Key derivation drops the filename only when it matches the folder. Rename so `hero-center/HeroCenter.astro`, or expect a two-segment key. |

The key-derivation rule (`pascalToKebab` + folder de-dup, shared via `src/components/utils/componentKey.mjs`, which `renderBlock.astro` and `live-editing.js` both import) is owned by [create-component](../create-component/SKILL.md#tiers-and-naming) — read it there for the naming table.

**MUST NOT:** ship a block whose `_component` is empty or undefined.
**Why:** the block renders nothing. `renderBlock` logs a distinct warning for this case ("Skipping content block with no `_component` key") — if you see that instead of "Component not found", the key is absent from the block entirely, not mistyped.

## Missing from the Add menu

**Symptom:** the component resolves and renders when placed by hand, but never appears in the editor's structure picker.

The picker is driven by `.cloudcannon/structures/*Sections.cloudcannon.structures.yml`, each collecting structure-values by glob. A component only appears in a context whose glob includes it.

| Tier         | Registration                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Page section | Automatic — globbed into `pageSections`. If absent, check the `structure-value.yml` filename and that it parses.                                                                                                         |
| Core element | Automatic in most contexts via `core-elements/**` glob. **`button` and `pagination` are explicitly excluded** (`!...` lines) from `containerSections` — they only belong to their own contexts (`buttonSections`, etc.). |
| Wrapper      | **Manual** — its `structure-value.yml` path must be listed in every `*Sections` context where it may be placed.                                                                                                          |

**Fix (wrapper):** add the component's `structure-value.yml` path to the `values_from_glob` array of each relevant `.cloudcannon/structures/*Sections` file. The full context list and how to open a new nested area live in [create-component](../create-component/SKILL.md#editor-registration-automatic-vs-manual).

**Also check:** the `structure-value.yml` parses (a YAML error drops it silently), its `_component` matches the registry key, and its `_inputs_from_glob` path is correct (`/`-rooted at project root) — a wrong path loads the block with no fields.

## Dead interactive component

**Symptom:** a carousel (or any JS-driven component) animates on the live site but is frozen in the Visual Editor.

**Why:** the editor renders Astro components through React's `renderToStaticMarkup`, which strips inline `<script>` tags — so `Carousel.astro`'s inline setup never runs in the editor. Interactive setup must live in an importable module that `editor-live-sync.js` imports and re-initialises on DOM mutations (the pattern in `carousel/setup.ts`).

| Likely cause                                                     | Fix                                                                                                                                                                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Setup logic lives only in the component's inline `<script>`      | Extract it to a `setup.ts` module; import + wire it in `editor-live-sync.js`. See [component-templates](../create-component/component-templates.md#interactive-components-js-that-must-run-in-the-editor). |
| Module exists but isn't registered in `editor-live-sync.js`      | Add its `setup`/`destroy`/`setupAll` imports and a mutation branch there. The editor never runs the inline script for you.                                                                                 |
| Config read at init time changed but Embla wasn't re-initialised | `editor-live-sync.js` must observe the driving attribute and `destroy` + re-init. Add the attribute to the watched list.                                                                                   |
| `window.inEditorMode` false / scripts not loaded                 | `BaseLayout.astro` imports `live-editing` + `editor-live-sync` only when `window.inEditorMode` is set. Confirm you're in the editor.                                                                       |

## Editable binding dead

**Symptom:** clicking an element in the editor opens no field, or a sidebar edit doesn't update the preview.

The attribute reference (`data-prop`, `data-children-prop`, `data-prop-src`/`-alt`, `data-editable`, `useDefaultEditableBinding`) is owned by [editable-regions](../editable-regions/SKILL.md). Diagnose the symptom here, then repair there.

| Likely cause                                                      | Fix                                                                                                                              |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| No binding on the element                                         | Add `data-prop` (text), `data-prop-src`/`data-prop-alt` (image), or `data-children-prop` (array) on the building block.          |
| `data-prop` value doesn't match the frontmatter/prop key          | Make it identical to the camelCase prop name — same string in the `.astro` destructure, `inputs.yml`, and `structure-value.yml`. |
| Image uses `data-prop` instead of `data-prop-src`/`data-prop-alt` | Images bind via the src/alt pair, not `data-prop`.                                                                               |
| `data-children-prop` on the wrong element                         | It goes on the array **wrapper** (`Grid`, `ButtonGroup`, …), not on an item or a text node.                                      |
| Component rendered outside `renderBlock` without the binding flag | `renderBlock` sets `useDefaultEditableBinding={true}`; render another way and you must pass it (or explicit bindings).           |
| `data-editable` set on the component's **root**                   | Remove it. `renderBlock` injects `data-editable="array-item"` on the root; a second one collides. Only mark inner elements.      |
| `display: contents` on the root of an array item                  | Replace with `display: flex`/`grid`. CloudCannon needs a real DOM box to attach the array-item region.                           |

## Config build errors

**Symptom:** CloudCannon build logs report an invalid, unknown, or ignored config key; a field renders with the wrong input type.

This is generic CloudCannon behaviour. The invalid-key list, the quote-numeric-values rule, select-vs-text field config, and `_editables` mapping are all in [references/config-invalid-keys.md](../references/config-invalid-keys.md). Structure-value rules (field completeness, previews, null handling) are in [references/structures.md](../references/structures.md).

## Skills drift

**Symptom:** `npm run check` fails with `DRIFT .cursor/skills` or `DRIFT .claude/skills` and `changed:`/`missing:`/`extra:` lines.

`.cursor/skills/` and `.claude/skills/` are generated byte-for-byte copies of `.agents/skills/`. `skills:check` compares the trees — you edited a copy directly, or edited the source without re-syncing.

**MUST:** edit skills only in `.agents/skills/`, then run `npm run skills:sync`.
**Why:** the copies are regenerated from the source; an edit to a copy is drift that fails the check and is lost on the next sync.

## Snippet missing

**Symptom:** a page section doesn't appear in the MDX/content editor's snippet picker.

Snippets are collected by `cloudcannon.config.yml`'s `_snippets_from_glob: /**/*.cloudcannon.snippets.yml`, with `_snippets_imports.mdx: true`.

| Likely cause                                        | Fix                                                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| No `*.cloudcannon.snippets.yml` for the component   | Add one. Format and `named_args` are in [blog-mdx-content](../blog-mdx-content/SKILL.md).    |
| File name or location doesn't match the glob        | Must end `.cloudcannon.snippets.yml` and live anywhere the glob reaches.                     |
| `definitions.component_name` doesn't match the file | It must equal the PascalCase `.astro` filename exactly (e.g. `CtaForm` for `CtaForm.astro`). |

## Verify your work

| Command                       | When                                             | Look for                                                                                  |
| ----------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `npm run check`               | Always after a fix.                              | Exit 0 — no lint/type errors, no skills `DRIFT`.                                          |
| `npm run dev` + Visual Editor | You fixed rendering, registration, or a binding. | Block resolves, appears in the Add menu, and field edits live-update; no console warning. |
