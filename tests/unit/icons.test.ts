import { describe, expect, it } from "vitest";
import { getIcon, iconNames, suggestIconNames } from "../../src/components/utils/icons";

/**
 * The registry is exercised through Vite so `import.meta.glob` resolves, which
 * means these tests cover every SVG on disk — not just the handful a build
 * happens to render.
 */
describe("icon registry", () => {
  it("discovers the icons on disk", () => {
    expect(iconNames.length).toBeGreaterThan(300);
    expect(iconNames).toContain("bolt");
    expect(iconNames).toContain("social/github");
  });

  it("normalizes every icon without throwing", () => {
    const failures: string[] = [];

    for (const name of iconNames) {
      try {
        const icon = getIcon(name);

        expect(icon).not.toBeNull();
        expect(icon?.body.length).toBeGreaterThan(0);
      } catch (error) {
        failures.push(`${name}: ${(error as Error).message}`);
      }
    }

    expect(failures).toEqual([]);
  });

  it("gives every icon a viewBox and 1em sizing", () => {
    const wrong = iconNames.filter((name) => {
      const { attributes } = getIcon(name)!;

      return !attributes.viewBox || attributes.width !== "1em" || attributes.height !== "1em";
    });

    expect(wrong).toEqual([]);
  });

  it("leaves no icon without a paint source", () => {
    // Either the root declares paint, or a child does. An icon with neither
    // falls back to SVG's default black fill and ignores the text colour.
    const unpainted = iconNames.filter((name) => {
      const { attributes, body } = getIcon(name)!;

      return !attributes.fill && !attributes.stroke && !/\b(?:fill|stroke)\s*=/.test(body);
    });

    expect(unpainted).toEqual([]);
  });

  it("strips the intrinsic size from icons that declared one", () => {
    // These three shipped with a pixel width/height; kept, they would render at
    // 800px (ltr/rtl) or 36px (bluesky) instead of following font-size.
    for (const name of ["ltr", "rtl", "social/bluesky"]) {
      const { attributes } = getIcon(name)!;

      expect(attributes.width).toBe("1em");
      expect(attributes.height).toBe("1em");
    }
  });

  it("recolors the one icon that hardcoded black", () => {
    const bluesky = getIcon("social/bluesky")!;

    expect(`${JSON.stringify(bluesky.attributes)}${bluesky.body}`).not.toMatch(/#000\b/);
    expect(bluesky.body).toContain("currentColor");
  });

  it("returns null for an unknown name rather than throwing", () => {
    expect(getIcon("definitely-not-an-icon")).toBeNull();
  });

  it("tolerates surrounding whitespace in a name", () => {
    expect(getIcon("  bolt  ")).not.toBeNull();
  });

  it("suggests near misses for a typo", () => {
    expect(suggestIconNames("chevron-dwn")[0]).toBe("chevron-down");
  });

  it("ranks a close match above a longer sibling that shares its prefix", () => {
    const suggestions = suggestIconNames("chevron-dwn");

    expect(suggestions.indexOf("chevron-down")).toBeLessThan(
      suggestions.includes("chevron-double-down") ? suggestions.indexOf("chevron-double-down") : 99
    );
  });

  it("suggests nothing for a name with no plausible match", () => {
    expect(suggestIconNames("zzzzzz")).toEqual([]);
  });
});
