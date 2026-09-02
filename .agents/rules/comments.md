---
description: Write code comments only when they carry information the code cannot
globs: **/*.{astro,ts,tsx,js,mjs,css,yml,yaml}
alwaysApply: true
---

# Code comments

**Default: no comment.** The bar is not "would this help a reader?" but "without this, would a competent reader make a wrong edit?" A comment earns its place only by preventing a specific mistake: undoing a workaround, re-adding a value that was removed for a reason, breaking a coupling nothing enforces.

**Why:** this repo is read by agents with limited context. A comment that restates its own line costs tokens and teaches the next reader to skim past the comments that matter — the ones recording a constraint that took an incident to learn.

**Not a reason to comment:** you just wrote or changed the line. Explaining what a rule does, why an alignment was chosen, or what a change fixes belongs in the conversation, the commit message, or `CHANGELOG.md` — not in the file. Describing what code does is never a reason; the code does that.

## Write a comment when

| Case                | Looks like                                                                                          | Example in repo                                       |
| ------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Non-obvious _why_   | The code looks wrong or arbitrary until you know the constraint it's dodging.                       | `Grid.astro` — why `justify-content: center`          |
| Silent failure mode | Getting it wrong produces no error, just wrong output.                                              | `spaceBefore.mjs` — what `default` means              |
| Coupling            | This file must change together with another, and nothing enforces it.                               | `navItems…structures.yml` header                      |
| Mechanism contract  | A file-top block stating the rules a whole system obeys, so callers don't have to reverse-engineer. | `_flow.css` header, `scripts/previews/kit.mjs` header |
| Exported util       | One-line JSDoc on a shared function whose name doesn't fully pin down its contract.                 | `scripts/lib/componentModel.mjs`                      |

## MUST NOT

- **Restate the line below.** `// Loop through the items` above a `.map()`.
- **Narrate the edit.** "Now also handles X", "Refactored from Y", "Updated to use Z". The diff and `CHANGELOG.md` record that; the file records what is true now.
- **Write section banners.** `// ---- Helpers ----`. Use structure, not decoration.
- **Explain a well-named thing.** If a comment is needed to explain what a name means, fix the name.
- **Leave commented-out code.** Git has it.
- **Document a prop twice.** Prop descriptions belong in the component's `*.cloudcannon.inputs.yml` `comment:` field, which renders in the editor and the docs. Don't mirror them in the `.astro` frontmatter.

## Shape

One line. Two at most. Reach for a block only for a mechanism contract at the top of a file. A magic number wants a named variable or token before it wants a comment.

```js
// Good — a constraint that isn't visible in the code
// `container-type: inline-size` zeroes the element's intrinsic width, so a
// containment root used as a flex item collapses unless the parent sizes it.

// Bad — restates the code
// Set the columns variable to the column count
```

**Common miss:** a long block comment that is really three sentences of throat-clearing plus one real fact. Keep the fact, cut the rest.
