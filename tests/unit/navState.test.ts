import { describe, expect, it } from "vitest";
import {
  createNavItemData,
  isCurrentPage,
  itemHasMegaMenu,
  navItemContainsCurrent,
  type NavItem,
} from "../../src/components/navigation/bar/navState";

const megaItem: NavItem = {
  name: "Products",
  megaMenu: {
    columns: [{ heading: "Core", items: [{ name: "Sites", path: "/products/sites" }] }],
  },
};

describe("isCurrentPage", () => {
  it("matches only an exact pathname", () => {
    expect(isCurrentPage("/about", { path: "/about" })).toBe(true);
    expect(isCurrentPage("/about/team", { path: "/about" })).toBe(false);
    expect(isCurrentPage("/about", { path: "/about/" })).toBe(false);
  });

  it("is false for an item with no path", () => {
    expect(isCurrentPage("/about", {})).toBe(false);
    expect(isCurrentPage("/about", { path: "" })).toBe(false);
  });
});

describe("navItemContainsCurrent", () => {
  it("finds the current page nested at any depth", () => {
    const item: NavItem = {
      name: "Docs",
      children: [{ name: "Guides", children: [{ name: "Deploy", path: "/docs/deploy" }] }],
    };

    expect(navItemContainsCurrent("/docs/deploy", item)).toBe(true);
    expect(navItemContainsCurrent("/docs/other", item)).toBe(false);
  });

  it("looks inside mega-menu columns, not just children", () => {
    expect(navItemContainsCurrent("/products/sites", megaItem)).toBe(true);
    expect(navItemContainsCurrent("/products/other", megaItem)).toBe(false);
  });
});

describe("itemHasMegaMenu", () => {
  it("is true for any mega menu object, even an empty one", () => {
    expect(itemHasMegaMenu(megaItem)).toBe(true);
    expect(itemHasMegaMenu({ megaMenu: {} })).toBe(true);
    expect(itemHasMegaMenu({ name: "About", path: "/about" })).toBe(false);
  });
});

describe("createNavItemData", () => {
  it("mints toggle ids only for items that render a toggle", () => {
    const leaf = createNavItemData("/", { name: "About", path: "/about" }, "main");

    expect(leaf.dropdownId).toBeUndefined();
    expect(leaf.contentId).toBeUndefined();
    expect(leaf.hasChildren).toBe(false);

    const parent = createNavItemData(
      "/",
      { name: "Docs", children: [{ name: "Deploy", path: "/docs/deploy" }] },
      "main"
    );

    expect(parent.dropdownId).toBe("dropdown-toggle-main-docs");
    expect(parent.contentId).toBe("dropdown-content-main-docs");
  });

  it("mints a toggle for a mega menu with no children", () => {
    const data = createNavItemData("/", megaItem, "main");

    expect(data.hasChildren).toBe(false);
    expect(data.dropdownId).toBe("dropdown-toggle-main-products");
  });

  it("scopes ids to the group so the bar and the mobile menu never collide", () => {
    const item: NavItem = { name: "Docs", children: [{ name: "Deploy", path: "/d" }] };

    expect(createNavItemData("/", item, "main").dropdownId).not.toBe(
      createNavItemData("/", item, "mobile").dropdownId
    );
  });

  it("falls back to a constant key when the name slugifies to nothing", () => {
    const data = createNavItemData("/", { name: "!!!", children: [{ path: "/x" }] }, "main");

    expect(data.parentGroupId).toBe("main-item");
  });

  it("separates being the current page from containing it", () => {
    const item: NavItem = {
      name: "Docs",
      path: "/docs",
      children: [{ name: "Deploy", path: "/docs/deploy" }],
    };

    const onChild = createNavItemData("/docs/deploy", item, "main");

    expect(onChild.isCurrent).toBe(false);
    expect(onChild.hasCurrent).toBe(true);

    const onSelf = createNavItemData("/docs", item, "main");

    expect(onSelf.isCurrent).toBe(true);
    expect(onSelf.hasCurrent).toBe(true);
  });
});
