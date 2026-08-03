import { describe, expect, it } from "vitest";
import {
  deriveSlotsForComponent,
  deriveSlotsFromSource,
} from "../../src/component-docs/shared/slotDerivation";

// Fixtures modeled on the real components they're named after — trimmed down
// to just the frontmatter destructure + the bit of template that matters,
// since deriveSlotsFromSource only cares about those two things.

const CARD_LIKE = `---
const {
  contentSections,
  beforeContentSections,
  afterContentSections,
  showBeforeAfter = false,
} = Astro.props;
---
<div>
  <div class="before-content">
    <slot name="before">
      {beforeContentSections && (
        <Component contentSections={beforeContentSections} />
      )}
    </slot>
  </div>
  <div class="card-content">
    <slot>
      {contentSections && (
        <Component contentSections={contentSections} />
      )}
    </slot>
  </div>
  <div class="after-content">
    <slot name="after">
      {afterContentSections && (
        <Component contentSections={afterContentSections} />
      )}
    </slot>
  </div>
</div>
`;

const BUTTON_LIKE = `---
const {
  text,
  class: className,
  "data-prop": customDataProp,
} = Astro.props;
---
<span class:list={["button", className]}>
  <slot>{text}</slot>
</span>
`;

const ACCORDION_LIKE = `---
const { items, openFirst, singleOpen = false } = Astro.props;
---
<div>
  <slot>
    {
      items?.map((item) => (
        <AccordionItem isOpen={openFirst} {...item} />
      ))
    }
  </slot>
</div>
`;

// Modeled on Split.astro: the same slot *name* is used for opposite props
// depending on `reverse`, via one-level local aliases that themselves
// reference two different props — genuinely ambiguous.
const SPLIT_LIKE = `---
const {
  firstColumnContentSections,
  secondColumnContentSections,
  reverse = false,
} = Astro.props;

const firstSplitBlocks = reverse ? secondColumnContentSections : firstColumnContentSections;
const secondSplitBlocks = reverse ? firstColumnContentSections : secondColumnContentSections;
---
<div>
  <div class="pane first">
    {
      reverse ? (
        <slot name="second">
          {firstSplitBlocks && <Component contentSections={firstSplitBlocks} />}
        </slot>
      ) : (
        <slot name="first">
          {firstSplitBlocks && <Component contentSections={firstSplitBlocks} />}
        </slot>
      )
    }
  </div>
  <div class="pane second">
    {
      reverse ? (
        <slot name="first">
          {secondSplitBlocks && <Component contentSections={secondSplitBlocks} />}
        </slot>
      ) : (
        <slot name="second">
          {secondSplitBlocks && <Component contentSections={secondSplitBlocks} />}
        </slot>
      )
    }
  </div>
</div>
`;

// Modeled on Select.astro: inverted relationship — the array is rendered
// *instead of* the slot, so the slot itself carries no information at all.
const SELECT_LIKE = `---
const { options = [], value } = Astro.props;
---
<select>
  {
    options.length > 0 ? (
      options.map((option) => <SelectOption value={option.value} selected={option.value === value} />)
    ) : (
      <slot />
    )
  }
</select>
`;

const MODAL_LIKE = `---
const { contentSections, heading } = Astro.props;
---
<div class="modal-body">
  <slot>
    {
      contentSections && (
        <Component contentSections={contentSections} />
      )
    }
  </slot>
</div>
`;

const NO_SLOTS_LIKE = `---
const { text, class: className } = Astro.props;
---
<div class:list={["text", className]}>{text}</div>
`;

describe("deriveSlotsFromSource", () => {
  it("resolves Card-like named slots to their single fallback prop", () => {
    const slots = deriveSlotsFromSource(CARD_LIKE);
    const byName = Object.fromEntries(slots.map((s) => [s.name, s]));

    expect(Object.keys(byName).sort()).toEqual(["after", "before", "default"]);
    expect(byName.default).toMatchObject({ fallbackFor: "contentSections" });
    expect(byName.before).toMatchObject({ fallbackFor: "beforeContentSections" });
    expect(byName.after).toMatchObject({ fallbackFor: "afterContentSections" });
    expect(byName.default.ambiguous).toBeFalsy();
    expect(byName.default.childComponent).toBeUndefined();
  });

  it("resolves Button-like bare-identifier default slots", () => {
    const slots = deriveSlotsFromSource(BUTTON_LIKE);

    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({ name: "default", fallbackFor: "text" });
    expect(slots[0].ambiguous).toBeFalsy();
  });

  it("resolves Accordion-like .map() slots to a fallback prop and child component", () => {
    const slots = deriveSlotsFromSource(ACCORDION_LIKE);

    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({
      name: "default",
      fallbackFor: "items",
      childComponent: { name: "AccordionItem" },
    });
  });

  it("marks Split-like duplicated slot names with conflicting alias resolutions as ambiguous", () => {
    const slots = deriveSlotsFromSource(SPLIT_LIKE);
    const byName = Object.fromEntries(slots.map((s) => [s.name, s]));

    expect(Object.keys(byName).sort()).toEqual(["first", "second"]);
    expect(byName.first.ambiguous).toBe(true);
    expect(byName.first.fallbackFor).toBeUndefined();
    expect(byName.second.ambiguous).toBe(true);
    expect(byName.second.fallbackFor).toBeUndefined();
  });

  it("treats a Select-like self-closing slot as having no fallback content (not ambiguous)", () => {
    const slots = deriveSlotsFromSource(SELECT_LIKE);

    expect(slots).toHaveLength(1);
    expect(slots[0].name).toBe("default");
    expect(slots[0].fallbackFor).toBeUndefined();
    expect(slots[0].ambiguous).toBeFalsy();
  });

  it("resolves a Modal-like slot with no declared frontmatter today", () => {
    const slots = deriveSlotsFromSource(MODAL_LIKE);

    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({ name: "default", fallbackFor: "contentSections" });
    expect(slots[0].childComponent).toBeUndefined();
  });

  it("returns an empty array for a component with no <slot> at all", () => {
    expect(deriveSlotsFromSource(NO_SLOTS_LIKE)).toEqual([]);
  });

  it("ignores unrelated identifiers referenced inside a .map() child (e.g. forwarded props)", () => {
    // Regression fixture for a real bug caught while building this: List.astro
    // forwards `showIcon={showIcons}` inside the same .map() callback that
    // renders ListItem. A naive "scan every identifier" approach would see
    // two candidate props (items, showIcons) and wrongly call this ambiguous.
    const LIST_LIKE = `---
const { items, showIcons } = Astro.props;
---
<div>
  <slot>
    {
      items?.map((item) => (
        <ListItem showIcon={showIcons} {...item} />
      ))
    }
  </slot>
</div>
`;
    const slots = deriveSlotsFromSource(LIST_LIKE);

    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({
      name: "default",
      fallbackFor: "items",
      childComponent: { name: "ListItem" },
    });
    expect(slots[0].ambiguous).toBeFalsy();
  });
});

describe("deriveSlotsForComponent (against real component sources on disk)", () => {
  it("Card: before/default/after all resolve cleanly", () => {
    const slots = deriveSlotsForComponent("building-blocks/wrappers/card");
    const byName = Object.fromEntries(slots.map((s) => [s.name, s]));

    expect(byName.default?.fallbackFor).toBe("contentSections");
    expect(byName.before?.fallbackFor).toBe("beforeContentSections");
    expect(byName.after?.fallbackFor).toBe("afterContentSections");
    expect(byName.default?.ambiguous).toBeFalsy();
    expect(byName.before?.ambiguous).toBeFalsy();
    expect(byName.after?.ambiguous).toBeFalsy();
  });

  it("Accordion: default slot resolves to items + AccordionItem", () => {
    const slots = deriveSlotsForComponent("building-blocks/wrappers/accordion");

    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({
      name: "default",
      fallbackFor: "items",
      childComponent: { name: "AccordionItem" },
    });
  });

  it("Split: first/second are both ambiguous (reverse ternary aliases)", () => {
    const slots = deriveSlotsForComponent("building-blocks/wrappers/split");
    const byName = Object.fromEntries(slots.map((s) => [s.name, s]));

    expect(byName.first?.ambiguous).toBe(true);
    expect(byName.second?.ambiguous).toBe(true);
    expect(byName.first?.fallbackFor).toBeUndefined();
    expect(byName.second?.fallbackFor).toBeUndefined();
  });

  it("Select: the self-closing default slot has no fallback (inverted pattern lives outside it)", () => {
    const slots = deriveSlotsForComponent("building-blocks/forms/select");

    expect(slots).toHaveLength(1);
    expect(slots[0].name).toBe("default");
    expect(slots[0].fallbackFor).toBeUndefined();
    expect(slots[0].ambiguous).toBeFalsy();
  });

  it("caches derived slots per component key", () => {
    const first = deriveSlotsForComponent("building-blocks/wrappers/card");
    const second = deriveSlotsForComponent("building-blocks/wrappers/card");

    expect(second).toBe(first);
  });

  it("returns an empty array for a component with no matching .astro file on disk", () => {
    expect(deriveSlotsForComponent("does-not/exist")).toEqual([]);
  });
});
