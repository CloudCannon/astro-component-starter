import { describe, expect, it } from "vitest";
import { normalizeIconSvg } from "../../src/components/utils/iconSvg";
import { iconKeyFromPath } from "../../src/components/utils/iconKey.mjs";

/** A Heroicon, verbatim: root paint attributes, `aria-hidden`, `data-slot`. */
const HEROICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
</svg>`;

/** A social icon: no paint declared anywhere, so it must be given one. */
const SOCIAL = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297a12 12 0 0 0 0 24"/></svg>`;

describe("normalizeIconSvg", () => {
  it("sizes every icon at 1em so the font-size scale controls it", () => {
    const { attributes } = normalizeIconSvg(HEROICON, "chevron-down");

    expect(attributes.width).toBe("1em");
    expect(attributes.height).toBe("1em");
    expect(attributes.viewBox).toBe("0 0 24 24");
  });

  it("carries root paint attributes through so outline icons stay outlines", () => {
    const { attributes } = normalizeIconSvg(HEROICON, "chevron-down");

    // Dropping these would leave the path with SVG's defaults — fill black,
    // no stroke — turning the icon into a solid silhouette.
    expect(attributes.fill).toBe("none");
    expect(attributes.stroke).toBe("currentColor");
    expect(attributes["stroke-width"]).toBe("1.5");
  });

  it("supplies fill=currentColor only when the artwork declares no paint", () => {
    expect(normalizeIconSvg(SOCIAL, "social/github").attributes.fill).toBe("currentColor");
    // The Heroicon already declares `fill="none"`; overriding it would fill the outline in.
    expect(normalizeIconSvg(HEROICON, "chevron-down").attributes.fill).toBe("none");
  });

  it("does not mistake fill-rule or stroke-width for a paint declaration", () => {
    const fillRuleOnly = `<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M0 0h24v24H0z"/></svg>`;

    expect(normalizeIconSvg(fillRuleOnly, "ltr").attributes.fill).toBe("currentColor");
  });

  it("drops the source's intrinsic width and height", () => {
    const sized = `<svg width="800" height="800" viewBox="0 0 1920 1920"><path d="M0 0h24"/></svg>`;
    const { attributes } = normalizeIconSvg(sized, "ltr");

    expect(attributes.width).toBe("1em");
    expect(attributes.height).toBe("1em");
    expect(attributes.viewBox).toBe("0 0 1920 1920");
  });

  it("strips authoring residue that should not reach the page", () => {
    const { attributes } = normalizeIconSvg(HEROICON, "chevron-down");

    expect(attributes.xmlns).toBeUndefined();
    expect(attributes["data-slot"]).toBeUndefined();
  });

  it("marks icons decorative and tags them with their id", () => {
    const { attributes } = normalizeIconSvg(HEROICON, "chevron-down");

    expect(attributes["aria-hidden"]).toBe("true");
    expect(attributes["data-icon"]).toBe("chevron-down");
  });

  it("emits sizing before paint before the added attributes", () => {
    const { attributes } = normalizeIconSvg(HEROICON, "chevron-down");

    expect(Object.keys(attributes).slice(0, 3)).toEqual(["width", "height", "viewBox"]);
    expect(Object.keys(attributes).slice(-2)).toEqual(["aria-hidden", "data-icon"]);
  });

  it("keeps the artwork and collapses only whitespace between elements", () => {
    const { body } = normalizeIconSvg(HEROICON, "chevron-down");

    expect(body).toBe(
      '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>'
    );
  });

  it("reconstructs a viewBox from the declared size when one is missing", () => {
    const noViewBox = `<svg width="32" height="16"><path d="M0 0h24"/></svg>`;

    expect(normalizeIconSvg(noViewBox, "odd").attributes.viewBox).toBe("0 0 32 16");
  });

  it("rejects artwork that cannot be scaled", () => {
    const unscalable = `<svg><path d="M0 0h24"/></svg>`;

    expect(() => normalizeIconSvg(unscalable, "odd")).toThrow(/cannot be scaled/);
  });

  it("rejects a file that is not an svg document", () => {
    expect(() => normalizeIconSvg("not an icon", "odd")).toThrow(/parseable <svg>/);
  });

  it("tolerates an xml prolog and leading comments", () => {
    const verbose = `<?xml version="1.0"?>\n<!-- a comment -->\n${SOCIAL}`;

    expect(normalizeIconSvg(verbose, "social/github").attributes.viewBox).toBe("0 0 24 24");
  });

  it("handles single-quoted attributes", () => {
    const quoted = `<svg viewBox='0 0 24 24'><path d="M0 0h24"/></svg>`;

    expect(normalizeIconSvg(quoted, "odd").attributes.viewBox).toBe("0 0 24 24");
  });
});

describe("iconKeyFromPath", () => {
  it("derives an id from a Vite glob key", () => {
    expect(iconKeyFromPath("/src/icons/bolt.svg")).toBe("bolt");
  });

  it("keeps subdirectories as part of the id", () => {
    expect(iconKeyFromPath("/src/icons/social/github.svg")).toBe("social/github");
  });

  it("accepts a path already relative to the icon directory", () => {
    expect(iconKeyFromPath("social/github.svg")).toBe("social/github");
    expect(iconKeyFromPath("social/github")).toBe("social/github");
  });

  it("normalizes Windows separators", () => {
    expect(iconKeyFromPath("src\\icons\\social\\github.svg")).toBe("social/github");
  });

  it("is unaffected by an absolute path that repeats the directory name", () => {
    expect(iconKeyFromPath("/home/src/icons/project/src/icons/bolt.svg")).toBe("bolt");
  });
});
