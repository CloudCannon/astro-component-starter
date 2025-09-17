import { formatComponentWithSlots } from "./componentFormatter";
import { getComponentDisplayName } from "./componentUtils";

export function formatBlocksAstro(blocks: any): string {
  if (!blocks) return "";

  try {
    const blocksArray = Array.isArray(blocks) ? blocks : [blocks];

    // Get unique components and generate imports
    const uniqueComponents = new Set();
    const addComponentToSet = (block: any) => {
      if (block._bookshop_name) {
        uniqueComponents.add(block._bookshop_name);
      }
      // Also check for nested components in contentBlocks, navBlocks, and formBlocks
      if (block.contentBlocks) {
        const nestedBlocks = Array.isArray(block.contentBlocks)
          ? block.contentBlocks
          : [block.contentBlocks];

        nestedBlocks.forEach(addComponentToSet);
      }
      if (block.navBlocks) {
        const nestedBlocks = Array.isArray(block.navBlocks) ? block.navBlocks : [block.navBlocks];

        nestedBlocks.forEach(addComponentToSet);
      }
      if (block.formBlocks) {
        const nestedBlocks = Array.isArray(block.formBlocks)
          ? block.formBlocks
          : [block.formBlocks];

        nestedBlocks.forEach(addComponentToSet);
      }
      if (block.buttonBlocks) {
        const nestedBlocks = Array.isArray(block.buttonBlocks)
          ? block.buttonBlocks
          : [block.buttonBlocks];

        nestedBlocks.forEach(addComponentToSet);
      }
      if (block.slides) {
        const nestedBlocks = Array.isArray(block.slides) ? block.slides : [block.slides];

        nestedBlocks.forEach(addComponentToSet);
        // Also add carousel-slide component for carousel slides and discover nested components
        if (block._bookshop_name?.includes("carousel")) {
          uniqueComponents.add("wrappers/carousel/carousel-slide");
          // Also discover components inside carousel slides' contentBlocks
          nestedBlocks.forEach((slide) => {
            if (slide.contentBlocks) {
              const slideContentBlocks = Array.isArray(slide.contentBlocks)
                ? slide.contentBlocks
                : [slide.contentBlocks];

              slideContentBlocks.forEach(addComponentToSet);
            }
          });
        }
      }
      if (block.options && block._bookshop_name?.includes("select")) {
        // Add select-option component for select options
        uniqueComponents.add("forms/select/select-option");
      }
      if (block.firstColumnContentBlocks) {
        const nestedBlocks = Array.isArray(block.firstColumnContentBlocks)
          ? block.firstColumnContentBlocks
          : [block.firstColumnContentBlocks];

        nestedBlocks.forEach(addComponentToSet);
      }
      if (block.secondColumnContentBlocks) {
        const nestedBlocks = Array.isArray(block.secondColumnContentBlocks)
          ? block.secondColumnContentBlocks
          : [block.secondColumnContentBlocks];

        nestedBlocks.forEach(addComponentToSet);
      }
      if (block.items && block._bookshop_name?.includes("list")) {
        // Add appropriate item component based on list type
        if (block._bookshop_name.includes("definition-list")) {
          uniqueComponents.add("typography/definition-list/definition-list-item");
        } else {
          uniqueComponents.add("typography/list/list-item");
        }
      }
      if (block.items && block._bookshop_name?.includes("grid")) {
        // Add grid-item component for grid items
        uniqueComponents.add("wrappers/grid/grid-item");
        // Also discover components inside grid items' contentBlocks
        const itemsArray = Array.isArray(block.items) ? block.items : [block.items];

        itemsArray.forEach((item) => {
          if (item.contentBlocks) {
            const nestedBlocks = Array.isArray(item.contentBlocks)
              ? item.contentBlocks
              : [item.contentBlocks];

            nestedBlocks.forEach(addComponentToSet);
          }
        });
      }
      if (block.items && block._bookshop_name?.includes("accordion")) {
        // Add accordion-item component for accordion items
        uniqueComponents.add("wrappers/accordion/accordion-item");
        // Also discover components inside accordion items' contentBlocks
        const itemsArray = Array.isArray(block.items) ? block.items : [block.items];

        itemsArray.forEach((item) => {
          if (item.contentBlocks) {
            const nestedBlocks = Array.isArray(item.contentBlocks)
              ? item.contentBlocks
              : [item.contentBlocks];

            nestedBlocks.forEach(addComponentToSet);
          }
        });
      }
    };

    blocksArray.forEach(addComponentToSet);

    // Generate import statements
    const imports = Array.from(uniqueComponents)
      .map((componentPath) => {
        // Generate import path - most components follow the pattern: category/component-name/component-name.astro
        // Exception: sub-components like list-item are just category/component-name.astro
        const parts = componentPath.split("/");
        const lastPart = parts[parts.length - 1];
        // Sub-components are components where the component name doesn't match the folder name
        // For paths with only 2 parts (e.g., "typography/rich-text"), it's always a main component
        const isSubComponent = parts.length > 2 && lastPart !== parts[parts.length - 2];

        let importPath = componentPath;

        if (!isSubComponent) {
          // For main components, add the component name again: category/component-name/component-name
          const lastPart = parts[parts.length - 1];

          importPath = `${componentPath}/${lastPart}`;
        }

        return `import ${getComponentDisplayName(componentPath)} from "@components/${importPath}.astro";`;
      })
      .join("\n");

    // Generate component usage with nested content
    const componentUsage = blocksArray
      .map((block) => {
        return formatComponentWithSlots(block);
      })
      .join("\n");

    if (imports) {
      return `---\n${imports}\n---\n\n${componentUsage}`;
    } else {
      return componentUsage;
    }
  } catch (error) {
    console.error("Error formatting Astro code:", error);
    return "";
  }
}
