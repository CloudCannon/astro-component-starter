export interface ContentBlock {
  _component: string;
  [key: string]: unknown;
}

export interface SocialLink {
  icon: string;
  link: string;
  label?: string;
}

export interface NavButton {
  text?: string;
  href?: string;
  [key: string]: unknown;
}

export interface SegmentOption {
  value: string;
  label?: string;
  checked?: boolean;
  icon?: string;
}

/** One crumb in a breadcrumb trail, after the leading Home crumb. */
export interface BreadcrumbItem {
  label: string;
  /** Omit on the final (current page) item — it renders as plain text. */
  url?: string;
}

export interface ContentSelectorItem {
  title?: string;
  subtext?: string;
  iconName?: string;
  iconColor?: string;
  contentSections?: ContentBlock[];
  _component?: string;
  [key: string]: unknown;
}
