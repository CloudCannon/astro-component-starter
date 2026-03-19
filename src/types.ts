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

export interface ContentSelectorItem {
  title?: string;
  subtext?: string;
  iconName?: string;
  contentSections?: ContentBlock[];
  _component?: string;
  [key: string]: unknown;
}
