import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentMetadata } from "../../src/component-docs/shared/metadata";
import { formatComponentWithSlots } from "../../src/component-docs/components/ComponentViewer/utils/componentFormatter";

/**
 * Regression tests for two bugs found while landing derivation-based slot
 * metadata (A4):
 *
 * 1. Once a component's metadata says `supportsSlots: true`, the formatter
 *    unconditionally deleted `props[slot.fallbackFor]` — including when the
 *    fallback value is a scalar (e.g. Embed's `html` string) that never gets
 *    rendered anywhere else. That silently dropped the prop from the
 *    generated code sample entirely.
 * 2. A slot WITH a `childComponent` (List's `items`, Accordion's `items`,
 *    Select's `options`, ...) holds plain prop-data objects with no
 *    `_component` of their own — they get spread onto a repeatable wrapper
 *    component by a dedicated branch further down. The formatter's
 *    `hasAnySlotContent` check didn't know about `childComponent` and
 *    treated any non-empty array as "raw nested block content", recursing
 *    into it with `formatComponentWithSlots` and crashing on
 *    `getComponentDisplayName(undefined)` since those items have no
 *    `_component`.
 */

describe("formatComponentWithSlots", () => {
  it("keeps a scalar fallback prop as a regular attribute (Embed's html)", () => {
    const metadataMap = new Map<string, ComponentMetadata>([
      [
        "building-blocks/core-elements/embed",
        {
          supportsSlots: true,
          fallbackFor: "html",
          slots: [{ name: "default", fallbackFor: "html" }],
        },
      ],
    ]);

    const block = {
      _component: "building-blocks/core-elements/embed",
      html: '<iframe src="https://example.com"></iframe>',
      aspectRatio: "landscape",
    };

    // In production `nestedBlockProperties` is ONE global set shared across
    // every component, built by folding every component's own fallbackFor
    // into it (see metadata.ts's getNestedBlockProperties) — so it contains
    // "html" here purely because Embed's own metadata declares it, not
    // because this particular value is block-shaped. A name-only check
    // (ignoring the actual value) would wrongly strip it.
    const result = formatComponentWithSlots(block, 0, metadataMap, new Set(["html"]));

    expect(result).toContain('html="<iframe src="https://example.com"></iframe>"');
    expect(result).toContain('aspectRatio="landscape"');
    // No slot-children markup should be emitted for a scalar fallback.
    expect(result).not.toContain("<Fragment");
    expect(result.trim().endsWith("/>")).toBe(true);
  });

  it("still renders block-shaped fallback content as nested JSX children (Modal's contentSections)", () => {
    const metadataMap = new Map<string, ComponentMetadata>([
      [
        "building-blocks/wrappers/modal",
        {
          supportsSlots: true,
          fallbackFor: "contentSections",
          slots: [{ name: "default", fallbackFor: "contentSections" }],
        },
      ],
    ]);

    const block = {
      _component: "building-blocks/wrappers/modal",
      heading: "Hello",
      contentSections: [{ _component: "building-blocks/core-elements/text", text: "Body copy" }],
    };

    const result = formatComponentWithSlots(block, 0, metadataMap, new Set());

    expect(result).toContain("<Modal");
    expect(result).not.toMatch(/contentSections=/);
    expect(result).toContain("<Text");
    expect(result).toContain("Body copy");
  });

  it("does not crash on a childComponent slot whose items have no _component (List)", () => {
    const metadataMap = new Map<string, ComponentMetadata>([
      [
        "building-blocks/core-elements/list",
        {
          supportsSlots: true,
          fallbackFor: "items",
          childComponent: { name: "ListItem" },
          slots: [{ name: "default", fallbackFor: "items", childComponent: { name: "ListItem" } }],
        },
      ],
    ]);

    const block = {
      _component: "building-blocks/core-elements/list",
      items: [
        { text: "First point", iconName: "check" },
        { text: "Second point", iconName: "check" },
      ],
      direction: "vertical",
    };

    expect(() => formatComponentWithSlots(block, 0, metadataMap, new Set())).not.toThrow();

    const result = formatComponentWithSlots(block, 0, metadataMap, new Set());

    expect(result).toContain("<List");
    expect(result).toContain("<ListItem");
    expect(result).toContain("First point");
    expect(result).toContain("Second point");
    expect(result).not.toMatch(/items=/);
  });

  it("does not crash on a childComponent slot for a generic wrapper (Grid, no dedicated branch)", () => {
    const metadataMap = new Map<string, ComponentMetadata>([
      [
        "building-blocks/wrappers/grid",
        {
          supportsSlots: true,
          fallbackFor: "items",
          childComponent: { name: "GridItem" },
          slots: [{ name: "default", fallbackFor: "items", childComponent: { name: "GridItem" } }],
        },
      ],
    ]);

    const block = {
      _component: "building-blocks/wrappers/grid",
      items: [
        { contentSections: [{ _component: "building-blocks/core-elements/text", text: "Cell" }] },
      ],
    };

    expect(() => formatComponentWithSlots(block, 0, metadataMap, new Set())).not.toThrow();

    const result = formatComponentWithSlots(block, 0, metadataMap, new Set());

    expect(result).toContain("<Grid");
    expect(result).toContain("<GridItem");
    expect(result).toContain("<Text");
    expect(result).toContain("Cell");
    expect(result).not.toMatch(/contentSections=/);
    expect(result).not.toContain("[object Object]");
  });

  it("renders StepsItem contentSections as nested JSX, not [object Object]", () => {
    const metadataMap = new Map<string, ComponentMetadata>([
      [
        "building-blocks/wrappers/steps",
        {
          supportsSlots: true,
          fallbackFor: "items",
          childComponent: { name: "StepsItem" },
          slots: [{ name: "default", fallbackFor: "items", childComponent: { name: "StepsItem" } }],
        },
      ],
    ]);

    const block = {
      _component: "building-blocks/wrappers/steps",
      orientation: "horizontal",
      items: [
        {
          contentSections: [
            { _component: "building-blocks/core-elements/heading", text: "Connect the repo" },
            { _component: "building-blocks/core-elements/simple-text", text: "Point the starter." },
          ],
        },
      ],
    };

    const result = formatComponentWithSlots(block, 0, metadataMap, new Set());

    expect(result).toContain("<Steps");
    expect(result).toContain("<StepsItem>");
    expect(result).toContain("<Heading");
    expect(result).toContain("Connect the repo");
    expect(result).toContain("<SimpleText");
    expect(result).not.toMatch(/contentSections=/);
    expect(result).not.toContain("[object Object]");
  });

  it("renders Timeline entries as TimelineItem attributes, not [object Object]", () => {
    const metadataMap = new Map<string, ComponentMetadata>([
      [
        "building-blocks/wrappers/timeline",
        {
          supportsSlots: true,
          fallbackFor: "entries",
          childComponent: { name: "TimelineItem", props: ["year", "date", "title", "body"] },
          slots: [
            {
              name: "default",
              fallbackFor: "entries",
              childComponent: { name: "TimelineItem", props: ["year", "date", "title", "body"] },
            },
          ],
        },
      ],
    ]);

    const block = {
      _component: "building-blocks/wrappers/timeline",
      layout: "horizontal",
      entries: [
        { date: "Q1 2025", title: "Public beta", body: "The editor shipped." },
        { date: "Q3 2025", title: "Component library" },
      ],
    };

    const result = formatComponentWithSlots(block, 0, metadataMap, new Set());

    expect(result).toContain("<Timeline");
    expect(result).toContain("<TimelineItem");
    expect(result).toContain('date="Q1 2025"');
    expect(result).toContain('title="Public beta"');
    expect(result).toContain('body="The editor shipped."');
    expect(result).not.toMatch(/entries=/);
    expect(result).not.toContain("[object Object]");
  });

  describe("malformed child blocks", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it("skips a block with no _component instead of throwing", () => {
      expect(() => formatComponentWithSlots({ foo: "bar" }, 0, new Map(), new Set())).not.toThrow();
      expect(formatComponentWithSlots({ foo: "bar" }, 0, new Map(), new Set())).toBe("");
      expect(warnSpy).toHaveBeenCalled();
    });

    it("skips only the malformed sibling, still rendering valid nested content", () => {
      const metadataMap = new Map<string, ComponentMetadata>([
        [
          "building-blocks/wrappers/card",
          {
            supportsSlots: true,
            fallbackFor: "contentSections",
            slots: [{ name: "default", fallbackFor: "contentSections" }],
          },
        ],
      ]);

      const block = {
        _component: "building-blocks/wrappers/card",
        contentSections: [
          { _component: "building-blocks/core-elements/text", text: "Valid sibling" },
          { text: "Missing _component" },
        ],
      };

      const result = formatComponentWithSlots(block, 0, metadataMap, new Set());

      expect(result).toContain("Valid sibling");
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});
