import { describe, expect, it } from "vitest";
import { isNonEmptyString } from "../../src/components/utils/isNonEmptyString";

describe("isNonEmptyString", () => {
  it("returns true for strings with non-whitespace characters", () => {
    expect(isNonEmptyString("hello")).toBe(true);
    expect(isNonEmptyString("  padded  ")).toBe(true);
    expect(isNonEmptyString("0")).toBe(true);
  });

  it("returns false for empty and whitespace-only strings", () => {
    expect(isNonEmptyString("")).toBe(false);
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isNonEmptyString("\n\t ")).toBe(false);
  });

  it("returns false (without throwing) for non-string values from YAML props", () => {
    expect(isNonEmptyString(5)).toBe(false);
    expect(isNonEmptyString(0)).toBe(false);
    expect(isNonEmptyString(true)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
    expect(isNonEmptyString(["a"])).toBe(false);
  });
});
