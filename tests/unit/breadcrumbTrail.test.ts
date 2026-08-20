import { describe, expect, it } from "vitest";
import {
  breadcrumbListJsonLd,
  humanizeSlug,
  trailFromPathname,
} from "../../src/components/utils/breadcrumbTrail";

describe("humanizeSlug", () => {
  it("turns a slug into sentence case", () => {
    expect(humanizeSlug("case-studies")).toBe("Case studies");
    expect(humanizeSlug("about_us")).toBe("About us");
    expect(humanizeSlug("about")).toBe("About");
  });
});

describe("trailFromPathname", () => {
  it("is empty on the home page, where a trail would only read Home", () => {
    expect(trailFromPathname("/")).toEqual([]);
  });

  it("gives the current page no url, so it renders as text", () => {
    expect(trailFromPathname("/about/")).toEqual([{ label: "About" }]);
  });

  it("links every ancestor segment and leaves the last one plain", () => {
    expect(trailFromPathname("/services/design/")).toEqual([
      { label: "Services", url: "/services/" },
      { label: "Design" },
    ]);
  });

  it("prefers an explicit label for the current page only", () => {
    expect(trailFromPathname("/services/design/", "Design systems")).toEqual([
      { label: "Services", url: "/services/" },
      { label: "Design systems" },
    ]);
  });

  it("handles a path with no trailing slash", () => {
    expect(trailFromPathname("/services/design")).toEqual([
      { label: "Services", url: "/services/" },
      { label: "Design" },
    ]);
  });
});

describe("breadcrumbListJsonLd", () => {
  it("prepends Home and omits item on the current page", () => {
    expect(
      breadcrumbListJsonLd([{ label: "Blog", url: "/blog/" }, { label: "A post" }], {
        base: "https://example.com",
      })
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://example.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://example.com/blog/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "A post",
        },
      ],
    });
  });

  it("uses the configured home label", () => {
    const data = breadcrumbListJsonLd([], {
      homeLabel: "Start",
      base: "https://example.com",
    });

    expect(data.itemListElement[0]).toMatchObject({ name: "Start", item: "https://example.com/" });
  });
});
