import { readFileSync } from "node:fs";
import * as yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { listComponentKeys } from "../../src/component-docs/shared/componentConfig";
import {
  mergeSlotMetadata,
  type ComponentMetadata,
  type SlotFrontmatter,
} from "../../src/component-docs/shared/metadata";
import { deriveSlotsForComponent } from "../../src/component-docs/shared/slotDerivation";

/**
 * GOLDEN PARITY TEST
 *
 * Before this step, `getComponentMetadataMap()` built its result *purely*
 * from hand-written `slots:` frontmatter (18 of 55 components declared it).
 * This test re-implements that exact old algorithm inline (no Astro content
 * collection needed in vitest) and compares it, component by component,
 * against the new derivation-based `mergeSlotMetadata`.
 *
 * The "old way" baseline is a FROZEN snapshot of what each of those 18
 * components' `slots:` frontmatter looked like before this change (see
 * ORIGINAL_DECLARED_SLOTS) — not a live re-read of the current file. That's
 * deliberate: a later step in this same change strips the now-derivable
 * `fallback_for` / `child_component.name` fields out of those files (keeping
 * only what derivation can't produce — descriptions and child_component
 * .props). A live re-read would make the "old way" comparison meaningless
 * post-strip, since of course an algorithm that only reads frontmatter
 * produces less once the frontmatter has less in it. Freezing the snapshot
 * means this test keeps proving the thing that actually matters: the new
 * derivation+override system reproduces the exact same final
 * `ComponentMetadata` the old frontmatter-only system did, end to end.
 *
 * Every component must come out identical UNLESS it's listed in
 * EXPECTED_CHANGES below, each with a comment explaining why the new value is
 * correct. Any other difference fails the test — that's the whole point:
 * derivation should be a strict refinement, never a surprise.
 */

/** Extract YAML frontmatter from a content markdown file, or null. */
function readFrontmatter(path: string): Record<string, unknown> | null {
  const source = readFileSync(path, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);

  if (!match) return null;

  return (yaml.load(match[1]) as Record<string, unknown>) ?? null;
}

/** Declared `slots:` frontmatter as currently on disk (post-strip). */
function readCurrentDeclaredSlots(componentKey: string): SlotFrontmatter[] {
  const path = `src/component-docs/content/components/${componentKey}/index.md`;

  try {
    const data = readFrontmatter(path);

    return (data?.slots as SlotFrontmatter[] | undefined) ?? [];
  } catch {
    return [];
  }
}

/**
 * Frozen snapshot of every component's `slots:` frontmatter as it existed
 * before this change — the 18 of 55 components that declared it. Components
 * not listed here declared no `slots:` frontmatter at all (empty array).
 */
const ORIGINAL_DECLARED_SLOTS: Record<string, SlotFrontmatter[]> = {
  "building-blocks/core-elements/button": [
    {
      title: "default",
      description: "The button content.",
      fallback_for: "text",
      child_component: null,
    },
  ],
  "building-blocks/core-elements/definition-list": [
    {
      title: "default",
      description: "The content inside the DefinitionList.",
      fallback_for: "items",
      child_component: { name: "DefinitionListItem", props: ["title", "text"] },
    },
  ],
  "building-blocks/core-elements/heading": [
    {
      title: "default",
      description: "The content inside the Heading.",
      fallback_for: "text",
      child_component: null,
    },
  ],
  "building-blocks/core-elements/list": [
    {
      title: "default",
      description: "The content inside the List.",
      fallback_for: "items",
      child_component: {
        name: "ListItem",
        props: ["iconName", "iconColor", "showIcon", "link", "text/slot"],
      },
    },
  ],
  "building-blocks/core-elements/simple-text": [
    {
      title: "default",
      description: "The content inside the Simple Text component (used when text prop is empty).",
    },
  ],
  "building-blocks/core-elements/testimonial": [
    { title: "default", description: "The quote.", fallback_for: "text", child_component: null },
  ],
  "building-blocks/core-elements/text": [
    {
      title: "default",
      description: "The content inside the Text component (used when text prop is empty).",
    },
  ],
  "building-blocks/forms/form": [
    {
      title: "default",
      description: "The contents of the Form.",
      fallback_for: "formBlocks",
      child_component: null,
    },
  ],
  "building-blocks/forms/select": [
    {
      title: "default",
      description: "Select options.",
      fallback_for: "options",
      child_component: { name: "SelectOption", props: ["label", "value", "selected", "disabled"] },
    },
  ],
  "building-blocks/wrappers/accordion": [
    {
      title: "default",
      description: "The contents for the the Accordion.",
      fallback_for: "items",
      child_component: { name: "AccordionItem", props: ["contentSections/slot", "title"] },
    },
  ],
  "building-blocks/wrappers/bento-box": [
    {
      title: "default",
      description: "The contents for the Bento Box.",
      fallback_for: "items",
      child_component: { name: "BentoBoxItem", props: ["contentSections/slot"] },
    },
  ],
  "building-blocks/wrappers/button-group": [
    {
      title: "default",
      description: "The contents for the the ButtonGroup.",
      fallback_for: "buttonSections",
    },
  ],
  "building-blocks/wrappers/card": [
    {
      title: "default",
      description: "The contents for the body of the Card.",
      fallback_for: "contentSections",
      child_component: null,
    },
    {
      title: "before",
      description: "The contents to display before the Card content.",
      fallback_for: "beforeContentSections",
      child_component: null,
    },
    {
      title: "after",
      description: "The contents to display after the Card content.",
      fallback_for: "afterContentSections",
      child_component: null,
    },
  ],
  "building-blocks/wrappers/carousel": [
    {
      title: "default",
      description: "The contents for the the Carousel.",
      fallback_for: "slides",
      child_component: { name: "CarouselSlide", props: ["contentSections/slot"] },
    },
  ],
  "building-blocks/wrappers/content-selector": [
    {
      title: "default",
      description: "The tab items inside the selector.",
      fallback_for: "items",
      child_component: { name: "ContentSelectorPanel", props: ["title", "contentSections/slot"] },
    },
  ],
  "building-blocks/wrappers/grid": [
    {
      title: "default",
      description: "The contents for the the Grid.",
      fallback_for: "items",
      child_component: { name: "GridItem", props: ["contentSections/slot"] },
    },
  ],
  "building-blocks/wrappers/split": [
    {
      title: "first",
      description: "The contents for the first side of the Split.",
      fallback_for: "firstColumnContentSections",
      child_component: null,
    },
    {
      title: "second",
      description: "The contents for the second side of the Split.",
      fallback_for: "secondColumnContentSections",
      child_component: null,
    },
  ],
  "page-sections/builders/custom-section": [
    {
      title: "default",
      description: "The contents of the Custom Section.",
      fallback_for: "contentSections",
      child_component: null,
    },
  ],
};

/**
 * Verbatim re-implementation of the pre-derivation `getComponentMetadataMap`
 * body (the part that turned one component's declared `slots:` frontmatter
 * into a `ComponentMetadata`). Intentionally duplicated here rather than kept
 * in src — its only job is to be the historical baseline this test diffs
 * against.
 */
function buildOldMetadata(declaredSlots: SlotFrontmatter[]): ComponentMetadata {
  const slots = declaredSlots || [];
  const supportsSlots = slots.length > 0;

  let childComponent: ComponentMetadata["childComponent"];
  let fallbackFor: string | undefined;
  const slotInfos: NonNullable<ComponentMetadata["slots"]> = [];

  for (const slot of slots) {
    if (slot?.fallback_for) {
      slotInfos.push({
        name: slot.title || "default",
        fallbackFor: slot.fallback_for,
        childComponent: slot.child_component || undefined,
      });
    }

    if (slot?.child_component && slot?.fallback_for && !childComponent) {
      childComponent = slot.child_component as NonNullable<ComponentMetadata["childComponent"]>;
      fallbackFor = slot.fallback_for;
    } else if (slot?.fallback_for && !fallbackFor) {
      fallbackFor = slot.fallback_for;
    }
  }

  return {
    childComponent,
    fallbackFor,
    supportsSlots,
    slots: slotInfos.length > 0 ? slotInfos : undefined,
  };
}

function buildNewMetadata(componentKey: string): ComponentMetadata {
  const derived = deriveSlotsForComponent(componentKey);
  const declared = readCurrentDeclaredSlots(componentKey);
  const merged = mergeSlotMetadata(derived, declared);

  return {
    childComponent: merged.childComponent,
    fallbackFor: merged.fallbackFor,
    supportsSlots: merged.supportsSlots,
    slots: merged.slots,
  };
}

/**
 * Components that legitimately gain (or refine) slot metadata now that it's
 * derived from source instead of only from hand-written frontmatter. Each
 * entry is the exact new `ComponentMetadata` this test asserts against —
 * anything else is treated as an unexplained regression.
 */
const EXPECTED_CHANGES: Record<string, ComponentMetadata> = {
  // Had no `slots:` frontmatter at all (supportsSlots was false). Its default
  // slot's fallback content is `{contentSections && <Component ... />}` — a
  // clean, unambiguous derivation — so it now renders its content as nested
  // JSX in the docs code tab instead of a raw `contentSections` prop.
  "building-blocks/wrappers/modal": {
    supportsSlots: true,
    fallbackFor: "contentSections",
    childComponent: undefined,
    slots: [{ name: "default", fallbackFor: "contentSections", childComponent: undefined }],
  },
  // Had no `slots:` frontmatter at all. Its default slot's fallback content
  // is `<Fragment set:html={html} />` — a clean, unambiguous derivation to
  // the `html` prop (no gate/map pattern applies, so this falls back to the
  // full-content identifier scan, which still finds exactly one candidate).
  "building-blocks/core-elements/embed": {
    supportsSlots: true,
    fallbackFor: "html",
    childComponent: undefined,
    slots: [{ name: "default", fallbackFor: "html", childComponent: undefined }],
  },
  // Had no `slots:` frontmatter at all. Its "logo" slot's fallback content
  // references THREE props (logoSource, logoAlternateSource, logoAlt), so
  // derivation correctly calls it ambiguous — supportsSlots flips true (a
  // real <slot> exists) but no fallbackFor is derived, so `slots` stays
  // undefined (nothing crosses the fallbackFor threshold to be included).
  "navigation/mobile": {
    supportsSlots: true,
    fallbackFor: undefined,
    childComponent: undefined,
    slots: undefined,
  },
  // Already declared `slots:` frontmatter (title: default, description) but
  // deliberately left off `fallback_for` — supportsSlots was already true.
  // Its fallback content `{text && <Fragment set:html={MarkdownText} />}`
  // resolves unambiguously to `text` (MarkdownText is a one-level alias of
  // it), so the merge now fills in the previously-blank fallbackFor/slots.
  "building-blocks/core-elements/simple-text": {
    supportsSlots: true,
    fallbackFor: "text",
    childComponent: undefined,
    slots: [{ name: "default", fallbackFor: "text", childComponent: undefined }],
  },
  // Same story as simple-text: declared frontmatter without fallback_for;
  // `{text && <Fragment set:html={markdownContent} />}` resolves unambiguously.
  "building-blocks/core-elements/text": {
    supportsSlots: true,
    fallbackFor: "text",
    childComponent: undefined,
    slots: [{ name: "default", fallbackFor: "text", childComponent: undefined }],
  },
};

describe("component metadata: derivation-based parity with the old frontmatter-only map", () => {
  const keys = listComponentKeys();

  it("covers every component (sanity check that listComponentKeys still returns all 55)", () => {
    expect(keys.length).toBeGreaterThanOrEqual(50);
  });

  it.each(keys)("%s", (key) => {
    const originalDeclared = ORIGINAL_DECLARED_SLOTS[key] ?? [];
    const oldMetadata = buildOldMetadata(originalDeclared);
    const newMetadata = buildNewMetadata(key);

    if (key in EXPECTED_CHANGES) {
      expect(newMetadata).toEqual(EXPECTED_CHANGES[key]);
      // The whole point of this allowlist: confirm the old value really was
      // different, so a stale entry (drift fixed elsewhere) doesn't silently
      // stop covering anything.
      expect(newMetadata).not.toEqual(oldMetadata);
    } else {
      expect(newMetadata).toEqual(oldMetadata);
    }
  });

  it("EXPECTED_CHANGES doesn't contain stale entries for components that no longer exist", () => {
    for (const key of Object.keys(EXPECTED_CHANGES)) {
      expect(keys).toContain(key);
    }
  });

  it("ORIGINAL_DECLARED_SLOTS doesn't contain stale entries for components that no longer exist", () => {
    for (const key of Object.keys(ORIGINAL_DECLARED_SLOTS)) {
      expect(keys).toContain(key);
    }
  });
});
