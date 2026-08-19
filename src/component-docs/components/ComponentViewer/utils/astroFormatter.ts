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
    { prefix: "page-sections/explainers/", alias: "@explainers/" },
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

    const uniqueComponents = new Set<string>();
    const addComponentToSet = (block: any) => {
      if (block._component) {
        uniqueComponents.add(block._component);
      }

      // Recurse into properties that can contain blocks
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

          if (block[fallbackProp]) {
            const childComponentPath = getChildComponentPath(
              block._component,
              metadata.childComponent.name
            );

            if (childComponentPath) {
              uniqueComponents.add(childComponentPath);
            }

            const items = Array.isArray(block[fallbackProp])
              ? block[fallbackProp]
              : [block[fallbackProp]];

            items.forEach((item: any) => {
              if (item && typeof item === "object") {
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
      .filter(Boolean)
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
