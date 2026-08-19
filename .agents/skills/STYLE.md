# Skill writing style

The skill-authoring standard for this repo's `.agents/skills/`. Skills are consumed by AI agents with limited context windows. Prose is low signal per token — agents skim past paragraphs and miss rules buried inside them. Every addition to a skill should earn its tokens.

Adapted from [CloudCannon/agent-skills STYLE.md](https://github.com/cloudcannon/agent-skills) for this starter.

## Core rules

- **Front-load the rule, defer the reason.** First sentence states the rule imperatively. Second sentence (or a `**Why:**` line) explains. No multi-paragraph preambles before a rule.
- **One canonical source per rule.** If a rule appears in 2+ files, one file owns it and the others link. Summary tables in `SKILL.md` entrypoints link to deep-dives; they do not re-explain. See [Reference ownership map](#reference-ownership-map).
- **Tables for if/then logic.** Any prose shaped like "if X do Y; if Z do W" becomes a table with columns for condition, action, and (if useful) reason or when-to-use.
- **Checklists for procedures.** Imperative bullets starting with a verb — `Run`, `Verify`, `Remove`, `Add`. No narrative intros ("First, let's…", "Now we need to…").
- **MUST / MUST NOT for critical rules.** Rules where getting it wrong breaks the build, the CloudCannon config, or the Visual Editor get a `**MUST**` or `**MUST NOT**` callout at the top of their section.
- **Include a `**Why:**` when the rule isn't self-evident.** **Why:** the reason lets agents judge edge cases the rule didn't anticipate; without it, rules get over- or under-applied. If the reason is genuinely obvious from the rule, skip it — but bias toward including it.

## Frontmatter

`name` and `description` only. Nothing else.

- **`name`** — the skill's directory name.
- **`description`** — written as a **when-to-use trigger**, not a summary. It is what the agent matches against to decide whether to open the skill, so lead with the situations that should trigger it.

```yaml
---
name: create-component
description: Use when adding a new page-section or building-block component — scaffolding the .astro file, its co-located CloudCannon YAML, and registering it for the Visual Editor.
---
```

**MUST NOT:** add `version`, `author`, `tags`, or any other frontmatter key.
**Why:** skill matching uses only `name` + `description`; extra keys are dead weight. Note nothing validates frontmatter automatically — `npm run skills:check` only verifies the generated `.claude/skills/` copy is byte-identical to `.agents/skills/`, so a bad key would sync silently.

## SKILL.md entrypoint shape

`SKILL.md` is the first file an agent reads. It must answer three questions fast: when does this skill apply, when does it not, and where do I go next. It links to deep-dives; it does not re-explain them.

Minimum structure:

```markdown
---
name: <skill-name>
description: <when-to-use trigger — used for skill matching, so lead with the situations>
---

# <Skill title>

<One- or two-sentence scope statement.>

## When to use

- <concrete trigger>
- <another trigger>

## When not to use

- <anti-trigger — prevents over-application>

## Contents

| File             | Covers         |
| ---------------- | -------------- |
| [foo.md](foo.md) | <what's in it> |
| [bar.md](bar.md) | <what's in it> |

## Verify your work

- Run `npm run check`.
- <skill-specific check>
```

**MUST NOT:** restate a rule that lives in a deep-dive or a reference file. Link to it instead.
**Why:** duplication drifts — when the rule changes in one place but not the other, agents can't tell which is current.

## Verify your work section

**MUST:** every skill ends with a `## Verify your work` section listing the concrete commands that prove the work is done, and what a passing result looks like.

**Why:** "looks right" is not done. The starter has real validators — a skill that doesn't point the agent at them ships broken config.

| Command                       | Include when                                                          | What to look for                                                   |
| ----------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `npm run check`               | Always. Runs lint + format + `astro check` + previews & skills drift. | Exit 0. No lint/type errors, no skills drift.                      |
| `npm run previews:build`      | The skill adds or changes a component's `*.preview.mjs` recipe.       | New/updated SVG in `public/component-previews/`, no build errors.  |
| `npm run dev` + Visual Editor | The skill wires editable regions or structures.                       | Field edits live-update; no "Component not found" console warning. |

Give exact commands, not "run the checks." Name the file or output the agent should inspect.

## Reference ownership map

One canonical owner per topic. Everyone else links — never restates. When a rule below changes, it changes in one place.

| Topic                                                                                                                      | Canonical owner                                                               | Everyone else |
| -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------- |
| Editable-binding attribute tables (`data-prop`, `data-children-prop`, `data-prop-src`/`-alt`, `useDefaultEditableBinding`) | `editable-regions` skill                                                      | Link to it.   |
| Structures registration + YAML templates (`.cloudcannon.structures.yml`, `*.structure-value.yml`, `*.inputs.yml`)          | `create-component` skill                                                      | Link to it.   |
| Fonts (`site-fonts.mjs`, self-hosting, `SiteFonts.astro`)                                                                  | `adding-fonts` skill                                                          | Link to it.   |
| Component catalog (what page sections / building blocks exist, when to use each)                                           | `page-content-authoring` skill                                                | Link to it.   |
| Design token tables (primitive + semantic vars)                                                                            | `theming` skill (which **links to the CSS files**, never pastes token values) | Link to it.   |
| Generic CloudCannon API (region types, structure rules, invalid config keys)                                               | `references/*.md` (vendored)                                                  | Link to it.   |

**MUST NOT:** paste a token table, an attribute table, or a structure YAML template into a skill that isn't the owner. Link to the owner.
**Why:** the starter's tokens and building-block prop names change; a pasted copy silently goes stale and misleads the next agent.

## This starter overrides generic CloudCannon docs

The vendored references in `references/` carry the generic CloudCannon API. Where generic docs and this starter disagree, **the starter wins** — and the reference files carry `**In this starter:**` callouts at each divergence. The load-bearing overrides:

| Generic CloudCannon / upstream                                         | This starter                                                                                                                                                                                                        |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| snake_case frontmatter props (`primary_label`)                         | **camelCase** props (`primaryLabel`). Match the component's `.astro` destructure exactly.                                                                                                                           |
| `_type` discriminator on array items                                   | **`_component`** — a kebab-case component directory path (e.g. `navigation/footer`), resolved by `renderBlock.astro`.                                                                                               |
| Editable web components (`<editable-text>`, etc.) offered as an option | **Banned.** Always standard HTML elements with `data-*` attributes.                                                                                                                                                 |
| `data-prop` / `data-editable` written directly on containers           | Building blocks expose **`data-children-prop`** (and plain `data-prop`); the building block translates it to `data-editable="array" data-prop=…` internally. Page sections compose those wrappers. Exception: a plain object array mapped to custom markup — then the page section writes `data-editable="array"` / `array-item` itself ([editable-regions](editable-regions/SKILL.md#array-repeating-items) shape C). |
| CLI-generated `cloudcannon.config.yml` with inline `_structures`       | Structures live in `.cloudcannon/structures/*.cloudcannon.structures.yml` + per-component co-located `*.cloudcannon.inputs.yml` / `*.cloudcannon.structure-value.yml`, collected by glob.                           |

## Length budget

**SKILL.md ≤ ~250 lines.** Overflow goes to support files, indexed by a `## Contents` table in SKILL.md.
**Why:** the entrypoint is read on every match. A 600-line SKILL.md burns context the agent needs for the actual task. Deep-dives are loaded only when the Contents table sends the agent there.

If SKILL.md is over budget, the fix is almost always "move a section to a support file and leave a one-line pointer," not "trim wording."

## Canonical location

**MUST:** edit skills in `.agents/skills/` only. Then run `npm run skills:sync` to copy them to `.claude/skills/` (Claude Code still reads that path; Cursor reads `.agents/skills/` directly).

**MUST NOT:** hand-edit `.claude/skills/` — it is a generated copy. `npm run skills:check` (part of `npm run check`) fails on drift between source and copy.

## Gotcha skeleton

Every gotcha in a `*-gotchas.md` file (and every decision section elsewhere) follows this shape:

```markdown
## <Rule stated imperatively>

**MUST / MUST NOT:** <one-line rule>
**Why:** <one-line reason — often a failure mode or past incident>

<minimal code example, if applicable>

**Common miss:** <optional — what agents get wrong here>
```

If a gotcha doesn't fit this shape, that's usually a sign it's two gotchas.

## Anti-patterns

Do not write:

- Long narrative intros ("Let's look at how CloudCannon handles…"). Delete them. The heading is the intro.
- Justification paragraphs after a rule. If the reason is load-bearing, it's a `**Why:**` line. If it isn't, cut it.
- Reference material as prose. Exhaustive lists of attributes, options, or variants go in a table.
- The same rule re-explained in multiple files. Pick one home per the [ownership map](#reference-ownership-map); the rest link.
- Multi-clause checklist bullets ("Verify X and also Y and remember Z"). One check per bullet.
- Emoji decorations (✅ ❌ 🎉). MUST/MUST NOT and plain prose do the job.
- A skill without a `## Verify your work` section.

## When you're not sure

If you can't decide between prose and a table: if a future reader will need to scan for a specific case, it's a table. If they need to read it once end-to-end to understand the concept, prose is fine — but keep it short.

If you're adding a new rule and it feels like it belongs in three places: write it in the [owner](#reference-ownership-map), and add one-line pointers from the others. Resist the urge to inline it "for convenience."
