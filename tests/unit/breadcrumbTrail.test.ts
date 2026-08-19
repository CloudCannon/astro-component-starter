import { describe, expect, it } from "vitest";
import { humanizeSlug, trailFromPathname } from "../../src/components/utils/breadcrumbTrail";

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
