import { itemHasSplitNavLink } from "@component-utils/navSplitLink";
import { slugifyLabel } from "@component-utils/slugify";

export interface MegaMenuLink {
  name?: string;
  description?: string;
  icon?: string;
  path?: string;
  highlight?: boolean;
}

export interface MegaMenuColumn {
  heading?: string;
  items?: MegaMenuLink[];
}

export interface MegaMenuFeature {
  image?: string;
  imageAlt?: string;
  heading?: string;
  link?: string;
}

export interface MegaMenu {
  feature?: MegaMenuFeature;
  columns?: MegaMenuColumn[];
}

export interface NavItem {
  name?: string;
  path?: string;
  children?: NavItem[];
  megaMenu?: MegaMenu;
}

export function itemHasMegaMenu(item: NavItem): boolean {
  return Boolean(item.megaMenu);
}

export function isCurrentPage(pathname: string, item: { path?: string }): boolean {
  return Boolean(item.path && pathname === item.path);
}

export function navItemContainsCurrent(pathname: string, item: NavItem): boolean {
  if (isCurrentPage(pathname, item)) return true;
  if (
    item.megaMenu?.columns?.some((column) =>
      column.items?.some((link) => isCurrentPage(pathname, link))
    )
  ) {
    return true;
  }
  return Boolean(item.children?.some((child) => navItemContainsCurrent(pathname, child)));
}

// `groupName` is the group this item's toggle joins; its children join one derived from `parentGroupId`.
export interface NavItemData extends NavItem {
  hasChildren: boolean;
  hasSplitLink: boolean;
  isCurrent: boolean;
  /** Also true when anything inside its submenu/panel is the current page. */
  hasCurrent: boolean;
  groupName: string;
  parentGroupId: string;
  dropdownId?: string;
  contentId?: string;
}

function navItemKey(item: NavItem): string {
  return slugifyLabel(item.name || item.path || "") || "item";
}

export function createNavItemData(pathname: string, item: NavItem, groupName: string): NavItemData {
  const hasChildren = Boolean(item.children?.length);
  const hasToggle = hasChildren || itemHasMegaMenu(item);

  return {
    ...item,
    hasChildren,
    hasSplitLink: itemHasSplitNavLink(item),
    isCurrent: isCurrentPage(pathname, item),
    hasCurrent: navItemContainsCurrent(pathname, item),
    groupName,
    parentGroupId: `${groupName}-${navItemKey(item)}`,
    dropdownId: hasToggle ? `dropdown-toggle-${groupName}-${navItemKey(item)}` : undefined,
    contentId: hasToggle ? `dropdown-content-${groupName}-${navItemKey(item)}` : undefined,
  };
}
