import { removeStyleField } from "../../../shared/blockDataUtils";
import { getChildComponentPath } from "../../../shared/componentPath";
import { getComponentMetadataMap, getNestedBlockProperties } from "../../../shared/metadata";
import { formatComponentWithSlots } from "./componentFormatter";
import { getComponentDisplayName } from "./componentUtils";

function getImportAliasPath(componentPath: string): string {
  const aliasMappings: Array<{ prefix: string; alias: string }> = [
    { prefix: "building-blocks/core-elements/", alias: "@core-elements/" },
    { prefix: "building-blocks/forms/", alias: "@forms/" },
    { prefix: "building-blocks/wrappers/", alias: "@wrappers/" },
    { prefix: "page-sections/builders/", alias: "@builders/" },
    { prefix: "page-sections/features/", alias: "@features/" },
    { prefix: "page-sections/", alias: "@page-sections/" },
    { prefix: "navigation/", alias: "@navigation/" },
    { prefix: "sections/", alias: "@sections/" },
  ];

  for (const { prefix, alias } of aliasMappings) {
    if (componentPath.startsWith(prefix)) {
      return `${alias}${componentPath.slice(prefix.length)}`;
    }
  }

  return `@components/${componentPath}`;
}

function isMainComponentPath(componentPath: string): boolean {
  const parts = componentPath.split("/");

  if (componentPath.startsWith("building-blocks/")) {
    return parts.length === 3;
  }

  if (componentPath.startsWith("page-sections/")) {
    return parts.length === 3;
  }

  if (componentPath.startsWith("navigation/")) {
    return parts.length === 2;
  }

  if (componentPath.startsWith("sections/")) {
    return parts.length === 2;
  }

  return parts.length <= 2;
}

export async function formatBlocksAstro(blocks: any): Promise<string> {
  const metadataMap = await getComponentMetadataMap();
  const nestedBlockProperties = await getNestedBlockProperties();

  if (!blocks) return "";

  try {
    const blocksWithoutStyle = removeStyleField(blocks);
    const blocksArray = Array.isArray(blocksWithoutStyle)
      ? blocksWithoutStyle
      : [blocksWithoutStyle];

    // Get unique components and generate imports
    const uniqueComponents = new Set<string>();
    const addComponentToSet = (block: any) => {
      if (block._component) {
        uniqueComponents.add(block._component);
      }

      // Recursively check for nested components in properties that can contain blocks
      for (const prop of nestedBlockProperties) {
        if (block[prop]) {
          const nestedBlocks = Array.isArray(block[prop]) ? block[prop] : [block[prop]];

          nestedBlocks.forEach(addComponentToSet);
        }
      }

      if (block.formBlocks) {
        uniqueComponents.add("building-blocks/forms/form");
      }

      // Handle content-selector items even when metadata fallback wiring is unavailable.
      if (block._component?.includes("building-blocks/wrappers/content-selector") && block.items) {
        uniqueComponents.add("building-blocks/wrappers/content-selector/content-selector-panel");
        const items = Array.isArray(block.items) ? block.items : [block.items];

        items.forEach((item: any) => {
          if (!item || typeof item !== "object") return;
          for (const prop of nestedBlockProperties) {
            if (item[prop]) {
              const nestedBlocks = Array.isArray(item[prop]) ? item[prop] : [item[prop]];

              nestedBlocks.forEach(addComponentToSet);
            }
          }
        });
      }

      if (block._component) {
        const metadata = metadataMap.get(block._component);

        if (metadata?.childComponent && metadata?.fallbackFor) {
          const fallbackProp = metadata.fallbackFor;

          // Check if the fallback property exists and might need child components
          if (block[fallbackProp]) {
            const childComponentPath = getChildComponentPath(
              block._component,
              metadata.childComponent.name
            );

            if (childComponentPath) {
              uniqueComponents.add(childComponentPath);
            }

            // If the property contains items with nested content, discover those components too
            const items = Array.isArray(block[fallbackProp])
              ? block[fallbackProp]
              : [block[fallbackProp]];

            items.forEach((item: any) => {
              if (item && typeof item === "object") {
                // Check all block properties in items
                for (const prop of nestedBlockProperties) {
                  if (item[prop]) {
                    const nestedBlocks = Array.isArray(item[prop]) ? item[prop] : [item[prop]];

                    nestedBlocks.forEach(addComponentToSet);
                  }
                }
              }
            });
          }
        }
      }
    };

    blocksArray.forEach(addComponentToSet);

    // Generate import statements
    const imports = Array.from(uniqueComponents)
      .sort((a, b) => a.localeCompare(b))
      .map((componentPath) => {
        const fileName = getComponentDisplayName(componentPath);
        const aliasedPath = getImportAliasPath(componentPath);
        const pathParts = aliasedPath.split("/");
        const importDirectory = isMainComponentPath(componentPath)
          ? aliasedPath
          : pathParts.slice(0, -1).join("/");

        return `import ${fileName} from "${importDirectory}/${fileName}.astro";`;
      })
      .join("\n");

    const componentUsage = blocksArray
      .map((block) => {
        return formatComponentWithSlots(block, 0, metadataMap, nestedBlockProperties);
      })
      .join("\n\n");

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
