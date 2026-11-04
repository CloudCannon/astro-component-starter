import { describe, expect, it } from "vitest";
import { slugifyLabel } from "../../src/components/utils/slugify";

describe("slugifyLabel", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyLabel("Getting Started")).toBe("getting-started");
  });

  it("collapses runs of punctuation and whitespace into one hyphen", () => {
    expect(slugifyLabel("Design  &  Build")).toBe("design-build");
    expect(slugifyLabel("a---b")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugifyLabel("  Hello!  ")).toBe("hello");
    expect(slugifyLabel("--edge--")).toBe("edge");
  });

  it("keeps digits", () => {
    expect(slugifyLabel("Web 2.0")).toBe("web-2-0");
  });

  it("returns an empty string when nothing survives", () => {
    // Callers must supply their own fallback (see navState's `navItemKey`).
    expect(slugifyLabel("!!!")).toBe("");
    expect(slugifyLabel("")).toBe("");
    expect(slugifyLabel("日本語")).toBe("");
  });
});
