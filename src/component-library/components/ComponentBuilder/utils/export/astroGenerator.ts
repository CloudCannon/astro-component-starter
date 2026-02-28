import { toPascalCase } from "../../../../shared/caseUtils";
import { getChildComponentPath } from "../../../../shared/componentPath";
import type { ComponentInfo, ComponentMetadata, ComponentNode } from "../../types";
import { shouldUseMapPattern, type BuilderNode } from "../shared";
import { getChildComponentPropInfo } from "./treeHelpers";

function getAliasedImportDirectory(componentPath: string): string {
  if (componentPath.startsWith("building-blocks/core-elements/")) {
    return `@core-elements/${componentPath.slice("building-blocks/core-elements/".length)}`;
  }
  if (componentPath.startsWith("building-blocks/forms/")) {
    return `@forms/${componentPath.slice("building-blocks/forms/".length)}`;
  }
  if (componentPath.startsWith("building-blocks/wrappers/")) {
    return `@wrappers/${componentPath.slice("building-blocks/wrappers/".length)}`;
  }
  if (componentPath.startsWith("building-blocks/")) {
    return `@building-blocks/${componentPath.slice("building-blocks/".length)}`;
  }
  if (componentPath.startsWith("page-sections/builders/")) {
    return `@builders/${componentPath.slice("page-sections/builders/".length)}`;
  }
  if (componentPath.startsWith("page-sections/")) {
    return `@page-sections/${componentPath.slice("page-sections/".length)}`;
  }
  return `@components/${componentPath}`;
}

function getImportInfo(
  componentPath: string,
  components: ComponentInfo[]
): { componentName: string; importPath: string } {
  const parts = componentPath.split("/");
  const lastPart = parts[parts.length - 1] || componentPath;
  const componentInfo = components.find((c) => c.path === componentPath);
  const componentName = toPascalCase(componentInfo?.name || lastPart);
  const astroFileName = componentInfo?.fileName || `${componentName}.astro`;

  // Virtual child components (e.g. accordion-item) live in the parent's folder.
  const sourceDirectory = componentInfo?.isVirtual ? parts.slice(0, -1).join("/") : componentPath;
  const aliasedDirectory = getAliasedImportDirectory(sourceDirectory);

  return {
    componentName,
    importPath: `${aliasedDirectory}/${astroFileName}`,
  };
}

/** Generate the Astro component file. */
export function generateAstroFile(
  blocks: ComponentNode[],
  componentName: string,
  components: ComponentInfo[],
  metadataMap: Record<string, ComponentMetadata>,
  nestedBlockProperties: string[],
  originalTree: BuilderNode[]
): string {
  const uniqueComponents = new Set<string>();
  const exposedProps = new Set<string>();

  function collectExposedProps(node: BuilderNode): void {
    if (!node) return;

    Object.keys(node).forEach((key) => {
      if (key.startsWith("_hardcoded_")) {
        const propName = key.replace("_hardcoded_", "");

        if (!node[key]) {
          const renamedKey = node[`_renamed_${propName}`] || propName;

          exposedProps.add(renamedKey);
        }
      }
    });

    Object.keys(node).forEach((key) => {
      if (key.endsWith("_mode") && node[key as `_${string}_mode`] === "prop") {
        const propName = key.replace("_mode", "").substring(1);
        const renamedKey = node[`_renamed_${propName}`] || propName;

        exposedProps.add(renamedKey);
      }
    });

    Object.keys(node).forEach((key) => {
      if (Array.isArray(node[key]) && !key.startsWith("_")) {
        const children = node[key] as BuilderNode[];

        if (shouldUseMapPattern(children, metadataMap, node._component)) {
          const renamedKey = node[`_renamed_${key}`] || key;

          exposedProps.add(renamedKey);
        } else {
          children.forEach((child) => {
            if (child && typeof child === "object") {
              collectExposedProps(child);
            }
          });
        }
      }
    });
  }

  if (originalTree[0]) {
    collectExposedProps(originalTree[0]);
  }

  function addComponent(block: ComponentNode): void {
    if (block._component) {
      uniqueComponents.add(block._component);
    }

    for (const prop of nestedBlockProperties) {
      if (block[prop] && Array.isArray(block[prop])) {
        (block[prop] as ComponentNode[]).forEach(addComponent);
      }
    }

    const metadata = metadataMap[block._component];

    if (
      metadata?.childComponent?.name &&
      metadata?.fallbackFor &&
      Array.isArray(block[metadata.fallbackFor]) &&
      (block[metadata.fallbackFor] as ComponentNode[]).length > 0
    ) {
      const childPath = getChildComponentPath(block._component, metadata.childComponent.name);

      uniqueComponents.add(childPath);
    }

    if (metadata?.fallbackFor && block[metadata.fallbackFor]) {
      const nested = Array.isArray(block[metadata.fallbackFor])
        ? (block[metadata.fallbackFor] as ComponentNode[])
        : [block[metadata.fallbackFor] as ComponentNode];

      nested.forEach(addComponent);
    }
  }

  blocks.forEach(addComponent);

  const imports = Array.from(uniqueComponents)
    .map((componentPath) => {
      const { componentName, importPath } = getImportInfo(componentPath, components);

      return `import ${componentName} from "${importPath}";`;
    })
    .join("\n");

  const componentUsage = blocks
    .map((block, index) =>
      formatComponentBlock(
        block,
        0,
        metadataMap,
        nestedBlockProperties,
        originalTree[index] || null,
        componentName,
        components
      )
    )
    .join("\n\n");

  const standardProps = ["label", "class: className", "_component"];
  const allProps = [...standardProps, ...Array.from(exposedProps), "...htmlAttributes"];
  const propsDestructuring = allProps
    .map((prop, idx) => `  ${prop}${idx < allProps.length - 1 ? "," : ""}`)
    .join("\n");

  return `---
${imports}

const {
${propsDestructuring}
} = Astro.props;
---

${componentUsage}

<style is:global>
  @layer page-sections {
    .${componentName} {
     
    }
  }
</style>`;
}

function formatComponentBlock(
  block: ComponentNode,
  indentLevel: number,
  metadataMap: Record<string, ComponentMetadata>,
  nestedBlockProperties: string[],
  originalNode: BuilderNode | null,
  rootComponentName: string,
  components: ComponentInfo[],
  arrayItemContext?: string
): string {
  const componentPath = block._component;
  const parts = componentPath.split("/");
  const lastPart = parts[parts.length - 1];
  const componentName = toPascalCase(lastPart);

  const indent = "  ".repeat(indentLevel);
  const props: Record<string, unknown> = { ...block };
  const isRootComponent = indentLevel === 0;

  delete props._component;
  delete props._isRootComponent;
  delete props.id;

  const metadata = metadataMap[componentPath];
  const componentInfo = components.find((c) => c.path === componentPath);
  const supportsSlots = metadata?.supportsSlots || componentInfo?.supportsSlots || false;
  const fallbackProp = metadata?.fallbackFor || componentInfo?.fallbackFor || "contentSections";

  const propsInPropMode = new Set<string>();

  if (originalNode) {
    Object.keys(originalNode).forEach((key) => {
      if (key.endsWith("_mode") && originalNode[key as `_${string}_mode`] === "prop") {
        const propName = key.replace("_mode", "").substring(1);

        propsInPropMode.add(propName);
      }
    });
  }

  if (supportsSlots) {
    nestedBlockProperties.forEach((prop) => {
      if (!propsInPropMode.has(prop)) {
        delete props[prop];
      }
    });

    if (!propsInPropMode.has("contentSections")) {
      delete props.contentSections;
    }
  }

  const propsList = Object.entries(props)
    .filter(([key, value]) => {
      if (Array.isArray(value)) {
        return propsInPropMode.has(key) || key !== fallbackProp;
      }
      return true;
    })
    .map(([key, value]) => {
      const isInPropMode = propsInPropMode.has(key);
      const isHardcoded = originalNode ? originalNode[`_hardcoded_${key}`] !== false : true;
      const renamedKey = originalNode ? originalNode[`_renamed_${key}`] || key : key;

      if (!isHardcoded || isInPropMode) {
        const propReference = arrayItemContext ? `${arrayItemContext}.${renamedKey}` : renamedKey;

        return `${key}={${propReference}}`;
      }

      if (typeof value === "string") return `${key}="${value}"`;
      if (typeof value === "boolean") return value ? key : "";
      if (typeof value === "number") return `${key}={${value}}`;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return "";
    })
    .filter(Boolean);

  if (isRootComponent && rootComponentName) {
    propsList.push(`class:list={["${rootComponentName}", className]}`);
    propsList.push("{...htmlAttributes}");
  }

  const formattedProps =
    propsList.length > 0
      ? `\n${propsList.map((prop) => `${indent}  ${prop}`).join("\n")}\n${indent}`
      : "";

  if (
    supportsSlots &&
    !propsInPropMode.has(fallbackProp) &&
    block[fallbackProp] &&
    Array.isArray(block[fallbackProp]) &&
    (block[fallbackProp] as ComponentNode[]).length > 0
  ) {
    const originalNested = originalNode?.[fallbackProp] as BuilderNode[] | undefined;
    const useMapPattern =
      !arrayItemContext && originalNested
        ? shouldUseMapPattern(originalNested, metadataMap, componentPath)
        : false;

    if (useMapPattern && originalNested && originalNested.length > 0) {
      const slotName = originalNode?.[`_renamed_${fallbackProp}`] || fallbackProp;
      const singularName = slotName.endsWith("s") ? slotName.slice(0, -1) : "item";

      const templateNode = (block[fallbackProp] as ComponentNode[])[0];
      const templateOriginal = originalNested[0];
      const childPropInfo = getChildComponentPropInfo(metadata);
      const childComponentMeta = metadata?.childComponent;

      if (childComponentMeta && childPropInfo) {
        const childComponentName = childComponentMeta.name;
        const childComponentPath = getChildComponentPath(componentPath, childComponentMeta.name);

        const childPropsList = childPropInfo.regularProps.map((prop) => {
          const renamedKey = templateOriginal?.[`_renamed_${prop}`] || prop;

          return `${prop}={${singularName}.${renamedKey}}`;
        });

        const childIndent = "  ".repeat(indentLevel + 2);
        const formattedChildProps =
          childPropsList.length > 0
            ? `\n${childPropsList.map((p) => `${childIndent}  ${p}`).join("\n")}\n${childIndent}`
            : "";

        const slotProp = childPropInfo.slotProps[0] || "contentSections";
        const isTemplateChildWrapper = templateNode._component === childComponentPath;
        let innerContent = "";

        if (isTemplateChildWrapper) {
          const grandchildren = templateNode[slotProp] as ComponentNode[] | undefined;
          const originalGrandchildren = templateOriginal?.[slotProp] as BuilderNode[] | undefined;

          if (grandchildren && grandchildren.length > 0) {
            innerContent = grandchildren
              .map((gc, idx) =>
                formatComponentBlock(
                  gc,
                  indentLevel + 3,
                  metadataMap,
                  nestedBlockProperties,
                  originalGrandchildren?.[idx] || null,
                  rootComponentName,
                  components,
                  singularName
                )
              )
              .join("\n");
          }
        } else {
          innerContent = formatComponentBlock(
            templateNode,
            indentLevel + 3,
            metadataMap,
            nestedBlockProperties,
            templateOriginal,
            rootComponentName,
            components,
            singularName
          );
        }

        if (innerContent) {
          return `${indent}<${componentName}${formattedProps}>
${indent}  {
${indent}    ${slotName}.map((${singularName}) => (
${childIndent}<${childComponentName}${formattedChildProps}>
${innerContent}
${childIndent}</${childComponentName}>
${indent}    ))
${indent}  }
${indent}</${componentName}>`;
        }

        return `${indent}<${componentName}${formattedProps}>
${indent}  {
${indent}    ${slotName}.map((${singularName}) => (
${childIndent}<${childComponentName}${formattedChildProps}/>
${indent}    ))
${indent}  }
${indent}</${componentName}>`;
      }

      const templateContent = formatComponentBlock(
        templateNode,
        indentLevel + 2,
        metadataMap,
        nestedBlockProperties,
        templateOriginal,
        rootComponentName,
        components,
        singularName
      );

      return `${indent}<${componentName}${formattedProps}>
${indent}  {
${indent}    ${slotName}.map((${singularName}) => (
${templateContent}
${indent}    ))
${indent}  }
${indent}</${componentName}>`;
    }

    const nestedContent = (block[fallbackProp] as ComponentNode[])
      .map((nested, idx) =>
        formatComponentBlock(
          nested,
          indentLevel + 1,
          metadataMap,
          nestedBlockProperties,
          originalNested?.[idx] || null,
          rootComponentName,
          components,
          arrayItemContext
        )
      )
      .join("\n");

    return `${indent}<${componentName}${formattedProps}>
${nestedContent}
${indent}</${componentName}>`;
  }

  return propsList.length > 0
    ? `${indent}<${componentName}${formattedProps}/>`
    : `${indent}<${componentName} />`;
}
