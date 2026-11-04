import { describe, expect, it } from "vitest";
import { itemHasSplitNavLink } from "../../src/components/utils/navSplitLink";

describe("itemHasSplitNavLink", () => {
  it("accepts real destinations", () => {
    expect(itemHasSplitNavLink({ path: "/about" })).toBe(true);
    expect(itemHasSplitNavLink({ path: "https://example.com" })).toBe(true);
    expect(itemHasSplitNavLink({ path: "http://example.com" })).toBe(true);
    expect(itemHasSplitNavLink({ path: "mailto:hi@example.com" })).toBe(true);
    expect(itemHasSplitNavLink({ path: "tel:+6435550142" })).toBe(true);
  });

  it("treats the generated-nav placeholder as no link", () => {
    expect(itemHasSplitNavLink({ path: "#" })).toBe(false);
    expect(itemHasSplitNavLink({ path: " # " })).toBe(false);
  });

  it("rejects a missing or non-string path", () => {
    expect(itemHasSplitNavLink({})).toBe(false);
    expect(itemHasSplitNavLink({ path: "" })).toBe(false);
    expect(itemHasSplitNavLink({ path: "   " })).toBe(false);
    expect(itemHasSplitNavLink({ path: 42 })).toBe(false);
    expect(itemHasSplitNavLink(undefined as never)).toBe(false);
  });

  it("rejects a relative path, which the nav does not support", () => {
    expect(itemHasSplitNavLink({ path: "about" })).toBe(false);
    expect(itemHasSplitNavLink({ path: "./about" })).toBe(false);
  });
});
