import { describe, expect, it } from "vitest";
import { getIcon, iconNames, suggestIconNames } from "../../src/components/utils/icons";

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
    // An icon with no paint falls back to SVG's default black fill.
    const unpainted = iconNames.filter((name) => {
      const { attributes, body } = getIcon(name)!;

      return !attributes.fill && !attributes.stroke && !/\b(?:fill|stroke)\s*=/.test(body);
    });

    expect(unpainted).toEqual([]);
  });

  it("paints every icon with currentColor, never a literal colour", () => {
    const hardcoded = iconNames.filter((name) => {
      const { attributes, body } = getIcon(name)!;

      return /#[\da-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(`${JSON.stringify(attributes)}${body}`);
    });

    expect(hardcoded).toEqual([]);
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
