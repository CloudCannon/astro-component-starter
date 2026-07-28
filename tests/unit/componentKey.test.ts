import { describe, expect, it } from "vitest";
import { componentKeyFromPath, pascalToKebab } from "../../src/components/utils/componentKey.mjs";

describe("pascalToKebab", () => {
  it("converts a single PascalCase word", () => {
    expect(pascalToKebab("Button")).toBe("button");
  });

  it("converts multi-word PascalCase names", () => {
    expect(pascalToKebab("HeroCenter")).toBe("hero-center");
    expect(pascalToKebab("ThemeToggleScript")).toBe("theme-toggle-script");
  });

  it("splits every capital, including consecutive capitals", () => {
    // Current contract: each capital opens a new segment, so acronyms are
    // split letter-by-letter. If this ever changes, every registry key
    // derived from an acronym filename changes with it.
    expect(pascalToKebab("FAQList")).toBe("f-a-q-list");
    expect(pascalToKebab("CTABanner")).toBe("c-t-a-banner");
  });

  it("leaves already-kebab-case input unchanged", () => {
    expect(pascalToKebab("hero-center")).toBe("hero-center");
  });
});

describe("componentKeyFromPath", () => {
  it("collapses the filename into its directory when the kebab-cased name matches", () => {
    expect(componentKeyFromPath("building-blocks/core-elements/button/Button.astro")).toBe(
      "building-blocks/core-elements/button"
    );
    expect(componentKeyFromPath("page-sections/heroes/hero-center/HeroCenter.astro")).toBe(
      "page-sections/heroes/hero-center"
    );
  });

  it("keeps a child component whose name differs from its directory", () => {
    expect(componentKeyFromPath("building-blocks/wrappers/accordion/AccordionItem.astro")).toBe(
      "building-blocks/wrappers/accordion/accordion-item"
    );
    expect(componentKeyFromPath("navigation/theme-toggle/ThemeToggleScript.astro")).toBe(
      "navigation/theme-toggle/theme-toggle-script"
    );
  });

  it("strips .jsx extensions the same way as .astro", () => {
    expect(componentKeyFromPath("building-blocks/core-elements/button/Button.jsx")).toBe(
      "building-blocks/core-elements/button"
    );
  });

  it("accepts extensionless paths", () => {
    expect(componentKeyFromPath("page-sections/heroes/hero-center/HeroCenter")).toBe(
      "page-sections/heroes/hero-center"
    );
  });

  it("handles a bare filename with no parent directory", () => {
    expect(componentKeyFromPath("Button.astro")).toBe("button");
  });
});
