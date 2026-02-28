/**
 * Template definitions for the Component Builder.
 *
 * Each template is a function that creates a pre-populated component tree
 * using the builder's component system. Templates mirror common page-section
 * patterns composed from building blocks.
 *
 * @module templates
 */

import { builderState } from "../state";
import type { ComponentInfo, ComponentNode } from "../types";
import { createCloseButton } from "../utils/buttonHelpers";

/** Template definition */
interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  build: () => ComponentNode[] | null;
}

function getInfo(path: string): ComponentInfo | undefined {
  return builderState.getComponentInfo(path);
}

function makeNode(path: string, propOverrides?: Record<string, unknown>): ComponentNode | null {
  const info = getInfo(path);

  if (!info) return null;

  const node = builderState.createComponentNode(info);

  if (propOverrides) {
    Object.entries(propOverrides).forEach(([k, v]) => {
      node[k] = v;
    });
  }

  return node;
}

function buildHeroSplit(): ComponentNode[] | null {
  const root = makeNode("page-sections/builders/custom-section");

  if (!root) return null;

  root._isRootComponent = true;

  const split = makeNode("building-blocks/wrappers/split", { distributionMode: "50-50" });
  const heading = makeNode("building-blocks/core-elements/heading", { text: "Your headline here" });
  const text = makeNode("building-blocks/core-elements/text", {
    text: "Supporting text that explains your value proposition.",
  });
  const btnGroup = makeNode("building-blocks/wrappers/button-group");
  const btn = makeNode("building-blocks/core-elements/button", {
    text: "Get Started",
    variant: "primary",
  });
  const image = makeNode("building-blocks/core-elements/image");

  if (!split || !heading || !text || !btnGroup || !btn || !image) return null;

  btnGroup.buttonSections = [btn];
  btnGroup._buttonSections_previewCount = 1;
  split.contentSections = [heading, text, btnGroup];
  split.secondColumnContentSections = [image];
  root.contentSections = [split];

  return [root];
}

function buildHeroCenter(): ComponentNode[] | null {
  const root = makeNode("page-sections/builders/custom-section");

  if (!root) return null;

  root._isRootComponent = true;

  const heading = makeNode("building-blocks/core-elements/heading", {
    text: "Your headline here",
    textAlignment: "center",
  });
  const text = makeNode("building-blocks/core-elements/text", {
    text: "Supporting text that explains your value proposition in a centered layout.",
    textAlignment: "center",
  });
  const btnGroup = makeNode("building-blocks/wrappers/button-group", { alignment: "center" });
  const btn1 = makeNode("building-blocks/core-elements/button", {
    text: "Primary Action",
    variant: "primary",
  });
  const btn2 = makeNode("building-blocks/core-elements/button", {
    text: "Secondary",
    variant: "ghost",
  });

  if (!heading || !text || !btnGroup || !btn1 || !btn2) return null;

  btnGroup.buttonSections = [btn1];
  btnGroup._buttonSections_previewCount = 2;
  root.contentSections = [heading, text, btnGroup];

  return [root];
}

function buildFeatureGrid(): ComponentNode[] | null {
  const root = makeNode("page-sections/builders/custom-section");

  if (!root) return null;

  root._isRootComponent = true;

  const heading = makeNode("building-blocks/core-elements/heading", {
    text: "Features",
    textAlignment: "center",
  });
  const text = makeNode("building-blocks/core-elements/text", {
    text: "Everything you need to build great experiences.",
    textAlignment: "center",
  });
  const grid = makeNode("building-blocks/wrappers/grid", { minItemWidth: 280, gap: "lg" });

  if (!heading || !text || !grid) return null;

  const item = makeNode("building-blocks/wrappers/grid/grid-item");
  const itemHeading = makeNode("building-blocks/core-elements/heading", {
    text: "Feature title",
  });
  const itemText = makeNode("building-blocks/core-elements/text", {
    text: "A brief description of this feature and its benefits.",
  });

  if (!item || !itemHeading || !itemText) return null;

  item.contentSections = [itemHeading, itemText];
  grid.items = [item];
  grid._items_previewCount = 3;
  root.contentSections = [heading, text, grid];

  return [root];
}

function buildCTA(): ComponentNode[] | null {
  const root = makeNode("page-sections/builders/custom-section");

  if (!root) return null;

  root._isRootComponent = true;

  const heading = makeNode("building-blocks/core-elements/heading", {
    text: "Ready to get started?",
    textAlignment: "center",
  });
  const text = makeNode("building-blocks/core-elements/text", {
    text: "Join thousands of users who already trust our platform.",
    textAlignment: "center",
  });
  const btnGroup = makeNode("building-blocks/wrappers/button-group", { alignment: "center" });
  const btn = makeNode("building-blocks/core-elements/button", {
    text: "Start Free Trial",
    variant: "primary",
    size: "lg",
  });

  if (!heading || !text || !btnGroup || !btn) return null;

  btnGroup.buttonSections = [btn];
  btnGroup._buttonSections_previewCount = 1;
  root.contentSections = [heading, text, btnGroup];

  return [root];
}

function buildFAQ(): ComponentNode[] | null {
  const root = makeNode("page-sections/builders/custom-section");

  if (!root) return null;

  root._isRootComponent = true;

  const heading = makeNode("building-blocks/core-elements/heading", {
    text: "Frequently Asked Questions",
    textAlignment: "center",
  });
  const accordion = makeNode("building-blocks/wrappers/accordion", { openFirst: true });

  if (!heading || !accordion) return null;

  const item = makeNode("building-blocks/wrappers/accordion/accordion-item", {
    title: "Question title",
  });
  const itemText = makeNode("building-blocks/core-elements/text", {
    text: "A brief answer to this question.",
  });

  if (!item || !itemText) return null;

  item.contentSections = [itemText];
  accordion.items = [item];
  accordion._items_previewCount = 3;
  root.contentSections = [heading, accordion];

  return [root];
}

function buildTestimonials(): ComponentNode[] | null {
  const root = makeNode("page-sections/builders/custom-section");

  if (!root) return null;

  root._isRootComponent = true;

  const heading = makeNode("building-blocks/core-elements/heading", {
    text: "What our customers say",
    textAlignment: "center",
  });
  const grid = makeNode("building-blocks/wrappers/grid", { minItemWidth: 300, gap: "lg" });

  if (!heading || !grid) return null;

  const item = makeNode("building-blocks/wrappers/grid/grid-item");
  const testimonial = makeNode("building-blocks/core-elements/testimonial", {
    text: "This product changed how we work.",
    authorName: "Alex Johnson",
    authorDescription: "CEO, Company",
  });

  if (!item || !testimonial) return null;

  item.contentSections = [testimonial];
  grid.items = [item];
  grid._items_previewCount = 3;
  root.contentSections = [heading, grid];

  return [root];
}

/** All available templates */
export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "hero-split",
    name: "Hero (Split)",
    description:
      "Two-column hero with heading, text, buttons on one side and an image on the other.",
    category: "Heroes",
    build: buildHeroSplit,
  },
  {
    id: "hero-center",
    name: "Hero (Center)",
    description: "Centered hero with heading, supporting text, and call-to-action buttons.",
    category: "Heroes",
    build: buildHeroCenter,
  },
  {
    id: "feature-grid",
    name: "Feature Grid",
    description: "Heading, subtext, and a 3-column grid of feature cards.",
    category: "Features",
    build: buildFeatureGrid,
  },
  {
    id: "cta",
    name: "Call to Action",
    description: "Centered CTA with headline, supporting text, and a prominent button.",
    category: "CTAs",
    build: buildCTA,
  },
  {
    id: "faq",
    name: "FAQ Section",
    description: "Heading followed by an accordion with common questions and answers.",
    category: "Info",
    build: buildFAQ,
  },
  {
    id: "testimonials",
    name: "Testimonials",
    description: "Heading and a grid of customer testimonial cards.",
    category: "People",
    build: buildTestimonials,
  },
];

/** Show the template picker modal */
export function showTemplatePicker(onSelect: (tree: ComponentNode[]) => void): void {
  const overlay = document.createElement("div");

  overlay.className = "template-picker-overlay";

  const modal = document.createElement("div");

  modal.className = "template-picker";

  // Header
  const header = document.createElement("div");

  header.className = "template-picker-header";

  const headerTop = document.createElement("div");

  headerTop.className = "template-picker-header-top";

  const title = document.createElement("h2");

  title.className = "template-picker-title";
  title.textContent = "Start from a template";

  headerTop.appendChild(title);

  const closeBtn = createCloseButton(() => {
    overlay.remove();
  });

  headerTop.appendChild(closeBtn);
  header.appendChild(headerTop);

  const subtitle = document.createElement("p");

  subtitle.className = "template-picker-subtitle";
  subtitle.textContent = "Choose a pattern to pre-populate the builder with a common layout.";
  header.appendChild(subtitle);

  modal.appendChild(header);

  // Content
  const content = document.createElement("div");

  content.className = "template-picker-content";

  const categories = new Map<string, TemplateDefinition[]>();

  for (const t of TEMPLATES) {
    if (!categories.has(t.category)) categories.set(t.category, []);
    categories.get(t.category)!.push(t);
  }

  for (const [catName, templates] of categories) {
    const catHeader = document.createElement("div");

    catHeader.className = "template-picker-category-header";

    const catTitle = document.createElement("h3");

    catTitle.textContent = catName;
    catHeader.appendChild(catTitle);
    content.appendChild(catHeader);

    for (const template of templates) {
      const item = document.createElement("button");

      item.type = "button";
      item.className = "template-picker-item";

      const info = document.createElement("div");

      info.className = "template-picker-item-info";

      const name = document.createElement("div");

      name.className = "template-picker-item-name";
      name.textContent = template.name;

      const desc = document.createElement("div");

      desc.className = "template-picker-item-desc";
      desc.textContent = template.description;

      info.appendChild(name);
      info.appendChild(desc);
      item.appendChild(info);

      item.addEventListener("click", () => {
        const tree = template.build();

        if (tree) {
          onSelect(tree);
          overlay.remove();
        } else {
          alert("Could not build template. Some required building blocks may be missing.");
        }
      });

      content.appendChild(item);
    }
  }

  modal.appendChild(content);
  overlay.appendChild(modal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}
