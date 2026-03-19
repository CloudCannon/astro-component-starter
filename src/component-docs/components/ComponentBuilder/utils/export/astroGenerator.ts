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

/** Merge dotted props (e.g. `backgroundImage.alt`) into object props (`backgroundImage`). */
function normalizeDottedObjectProps(props: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...props };
  const dottedKeys = Object.keys(normalized).filter((key) => key.includes("."));

  for (const dottedKey of dottedKeys) {
    const [parentKey, ...rest] = dottedKey.split(".");
    const childPath = rest.join(".");

    if (!parentKey || !childPath) continue;

    const dottedValue = normalized[dottedKey];

    // Build/merge a nested object shape from dotted key segments.
    const baseObject =
      normalized[parentKey] &&
      typeof normalized[parentKey] === "object" &&
      !Array.isArray(normalized[parentKey])
        ? { ...(normalized[parentKey] as Record<string, unknown>) }
        : {};
    let cursor: Record<string, unknown> = baseObject;
    const segments = childPath.split(".");

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      const existing = cursor[segment];

      if (existing && typeof existing === "object" && !Array.isArray(existing)) {
        cursor[segment] = { ...(existing as Record<string, unknown>) };
      } else {
        cursor[segment] = {};
      }

      cursor = cursor[segment] as Record<string, unknown>;
    }

    cursor[segments[segments.length - 1]] = dottedValue;
    normalized[parentKey] = baseObject;
    delete normalized[dottedKey];
  }

  return normalized;
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
          const modeKey = `_${propName}_mode` as const;

          if (node[modeKey] !== undefined && node[modeKey] !== "prop") return;

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
        const modeKey = `_${key}_mode` as const;

        if (node[modeKey] === "prop") return;

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

  function addComponent(block: ComponentNode, originalNode?: BuilderNode): void {
    if (block._component) {
      uniqueComponents.add(block._component);
    }

    for (const prop of nestedBlockProperties) {
      if (block[prop] && Array.isArray(block[prop])) {
        const modeKey = `_${prop}_mode` as const;

        if (originalNode && originalNode[modeKey] === "prop") continue;

        (block[prop] as ComponentNode[]).forEach((child, idx) => {
          const origChildren = originalNode?.[prop] as BuilderNode[] | undefined;

          addComponent(child, origChildren?.[idx]);
        });
      }
    }

    const metadata = metadataMap[block._component];
    const fallback = metadata?.fallbackFor;

    if (fallback) {
      const fallbackModeKey = `_${fallback}_mode` as const;
      const isInFreeformMode = originalNode && originalNode[fallbackModeKey] === "prop";

      if (!isInFreeformMode) {
        if (
          metadata?.childComponent?.name &&
          Array.isArray(block[fallback]) &&
          (block[fallback] as ComponentNode[]).length > 0
        ) {
          const childPath = getChildComponentPath(block._component, metadata.childComponent.name);

          uniqueComponents.add(childPath);
        }

        if (block[fallback]) {
          const nested = Array.isArray(block[fallback])
            ? (block[fallback] as ComponentNode[])
            : [block[fallback] as ComponentNode];
          const origNested = originalNode?.[fallback];
          const origChildren = Array.isArray(origNested)
            ? (origNested as BuilderNode[])
            : origNested
              ? [origNested as BuilderNode]
              : [];

          nested.forEach((child, idx) => addComponent(child, origChildren[idx]));
        }
      }
    }
  }

  blocks.forEach((block, idx) => addComponent(block, originalTree[idx]));

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

<style>
  @layer page-sections {
    .${componentName} {
     
    }
  }
</style>`;
}

function getAttributeSortKey(prop: string): string {
  if (prop.startsWith("{...")) return `\uffff${prop}`;
  const match = prop.match(/^([a-zA-Z_][\w:.-]*)/);

  return match ? match[1].toLowerCase() : prop.toLowerCase();
}

function sortPropsList(props: string[]): string[] {
  return [...props].sort((a, b) => getAttributeSortKey(a).localeCompare(getAttributeSortKey(b)));
}

function formatComponentBlock(
  block: ComponentNode,
  indentLevel: number,
  metadataMap: Record<string, ComponentMetadata>,
  nestedBlockProperties: string[],
  originalNode: BuilderNode | null,
  rootComponentName: string,
  components: ComponentInfo[],
  arrayItemContext?: string,
  extraAttributes?: string[]
): string {
  const componentPath = block._component;
  const parts = componentPath.split("/");
  const lastPart = parts[parts.length - 1];
  const componentName = toPascalCase(lastPart);

  const indent = "  ".repeat(indentLevel);
  const props: Record<string, unknown> = normalizeDottedObjectProps({ ...block });
  const isRootComponent = indentLevel === 0;

  delete props._component;
  delete props._isRootComponent;
  delete props._nodeId;
  delete props.editable;
  delete props.useDefaultEditableBinding;

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
      if (!propsInPropMode.has(prop) && Array.isArray(props[prop])) {
        delete props[prop];
      }
    });

    if (!propsInPropMode.has("contentSections") && Array.isArray(props.contentSections)) {
      delete props.contentSections;
    }
  }

  const hasSlotChildren =
    supportsSlots &&
    !propsInPropMode.has(fallbackProp) &&
    block[fallbackProp] &&
    Array.isArray(block[fallbackProp]) &&
    (block[fallbackProp] as ComponentNode[]).length > 0;

  const slotOriginalNested = hasSlotChildren
    ? (originalNode?.[fallbackProp] as BuilderNode[] | undefined)
    : undefined;

  const isMapPatternSlot = slotOriginalNested
    ? shouldUseMapPattern(slotOriginalNested, metadataMap, componentPath)
    : false;

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

  // Determine which slot props are in page-building mode on this component
  const freeformSlotProps = supportsSlots
    ? [...propsInPropMode].filter((p) => {
        const inputType = componentInfo?.inputs?.[p]?.type;

        return inputType === "array" || nestedBlockProperties.includes(p) || p === fallbackProp;
      })
    : [];

  if (isRootComponent && rootComponentName) {
    propsList.push(`class:list={["${rootComponentName}", className]}`);

    for (const slotProp of freeformSlotProps) {
      const renamedKey = originalNode?.[`_renamed_${slotProp}`] || slotProp;

      propsList.push(`data-children-prop="${renamedKey}"`);
    }

    propsList.push("{...htmlAttributes}");
  } else if (freeformSlotProps.length > 0) {
    for (const slotProp of freeformSlotProps) {
      const renamedKey = originalNode?.[`_renamed_${slotProp}`] || slotProp;

      propsList.push(`data-children-prop="${renamedKey}"`);
    }
  }

  if (isMapPatternSlot) {
    const mapSlotName = originalNode?.[`_renamed_${fallbackProp}`] || fallbackProp;

    if (mapSlotName !== fallbackProp) {
      propsList.push(`data-children-prop="${mapSlotName}"`);
    }
  }

  if (!isRootComponent) {
    let hasDataProp = false;

    Object.entries(props).forEach(([key, value]) => {
      if (hasDataProp || Array.isArray(value)) return;

      const isHardcoded = originalNode ? originalNode[`_hardcoded_${key}`] !== false : true;
      const isInPropMode = propsInPropMode.has(key);

      if (!isHardcoded || isInPropMode) {
        const inputType = componentInfo?.inputs?.[key]?.type;

        if (inputType === "text" || inputType === "textarea" || inputType === "markdown") {
          const renamedKey = originalNode ? originalNode[`_renamed_${key}`] || key : key;

          propsList.push(`data-prop="${renamedKey}"`);
          hasDataProp = true;
        }
      }
    });
  }

  if (extraAttributes && extraAttributes.length > 0) {
    propsList.push(...extraAttributes);
  }

  const sortedPropsList = sortPropsList(propsList);
  const formattedProps =
    sortedPropsList.length > 0
      ? `\n${sortedPropsList.map((prop) => `${indent}  ${prop}`).join("\n")}\n${indent}`
      : "";

  // --- Determine Astro slot names from component slot metadata ---
  function getAstroSlotName(propName: string): string {
    const slotDef = componentInfo?.slots?.find((s) => s.propName === propName);

    return slotDef?.astroSlotName || "default";
  }

  // --- Build named-slot content for non-fallback slots ---
  let namedSlotContent = "";

  if (supportsSlots && componentInfo?.slots) {
    for (const slotDef of componentInfo.slots) {
      if (slotDef.propName === fallbackProp) continue;
      if (propsInPropMode.has(slotDef.propName)) continue;

      const children = block[slotDef.propName] as ComponentNode[] | undefined;

      if (!children || children.length === 0) continue;

      const origChildren = originalNode?.[slotDef.propName] as BuilderNode[] | undefined;
      const astroSlot = slotDef.astroSlotName || slotDef.propName;

      if (children.length === 1) {
        namedSlotContent += `\n${formatComponentBlock(
          children[0],
          indentLevel + 1,
          metadataMap,
          nestedBlockProperties,
          origChildren?.[0] || null,
          rootComponentName,
          components,
          arrayItemContext,
          [`slot="${astroSlot}"`]
        )}`;
      } else {
        const fragmentContent = children
          .map((child, idx) =>
            formatComponentBlock(
              child,
              indentLevel + 2,
              metadataMap,
              nestedBlockProperties,
              origChildren?.[idx] || null,
              rootComponentName,
              components,
              arrayItemContext
            )
          )
          .join("\n");

        namedSlotContent += `\n${indent}  <Fragment slot="${astroSlot}">\n${fragmentContent}\n${indent}  </Fragment>`;
      }
    }
  }

  const fallbackAstroSlot = getAstroSlotName(fallbackProp);
  const fallbackIsDefault = fallbackAstroSlot === "default";

  if (hasSlotChildren) {
    const originalNested = slotOriginalNested;
    const useMapPattern = isMapPatternSlot;

    if (useMapPattern && originalNested && originalNested.length > 0) {
      const rawSlotName = originalNode?.[`_renamed_${fallbackProp}`] || fallbackProp;
      const slotName = arrayItemContext ? `${arrayItemContext}.${rawSlotName}` : rawSlotName;
      const singularName = (rawSlotName as string).endsWith("s")
        ? (rawSlotName as string).slice(0, -1)
        : "item";

      const templateNode = (block[fallbackProp] as ComponentNode[])[0];
      const templateOriginal = originalNested[0];
      const childPropInfo = getChildComponentPropInfo(metadata);
      const childComponentMeta = metadata?.childComponent;

      if (childComponentMeta && childPropInfo) {
        const childComponentName = childComponentMeta.name;
        const childComponentPath = getChildComponentPath(componentPath, childComponentMeta.name);
        const legacyChildWrapperPath = childComponentPath.endsWith("-panel")
          ? childComponentPath.replace(/-panel$/, "-item")
          : "";

        const childPropsList = childPropInfo.regularProps
          .filter((prop) => templateOriginal?.[`_hardcoded_${prop}`] === false)
          .map((prop) => {
            const renamedKey = templateOriginal?.[`_renamed_${prop}`] || prop;

            return `${prop}={${singularName}.${renamedKey}}`;
          });

        childPropsList.push(`data-editable="array-item"`);
        childPropsList.push(`data-id="${childComponentPath}"`);

        // Check if any slot props on the template child are in page-building mode
        for (const sp of childPropInfo.slotProps) {
          const spModeKey = `_${sp}_mode` as keyof typeof templateOriginal;
          const isInPropMode = templateOriginal?.[spModeKey] === "prop";
          const isExposed = templateOriginal?.[`_hardcoded_${sp}`] === false;

          if (isInPropMode || isExposed) {
            const renamedKey = templateOriginal?.[`_renamed_${sp}`] || sp;

            childPropsList.push(`${sp}={${singularName}.${renamedKey}}`);
            if (renamedKey !== sp) {
              childPropsList.push(`data-children-prop="${renamedKey}"`);
            }
          }
        }

        const allSlotPropsInPropMode = childPropInfo.slotProps.every((sp) => {
          const spModeKey = `_${sp}_mode` as keyof typeof templateOriginal;

          return templateOriginal?.[spModeKey] === "prop";
        });

        const childIndent = "  ".repeat(indentLevel + 2);
        const sortedChildPropsList = sortPropsList(childPropsList);
        const formattedChildProps =
          sortedChildPropsList.length > 0
            ? `\n${sortedChildPropsList.map((p) => `${childIndent}  ${p}`).join("\n")}\n${childIndent}`
            : "";

        const slotProp = childPropInfo.slotProps[0] || "contentSections";
        const isTemplateChildWrapper = templateNode._component === childComponentPath;
        const isLegacyChildWrapper =
          Boolean(legacyChildWrapperPath) && templateNode._component === legacyChildWrapperPath;
        const isTemplateWrapperLike = isTemplateChildWrapper || isLegacyChildWrapper;
        let innerContent = "";

        if (isTemplateWrapperLike && !allSlotPropsInPropMode) {
          const grandchildren = Array.isArray(templateNode[slotProp])
            ? (templateNode[slotProp] as ComponentNode[])
            : undefined;
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
        } else if (!isTemplateWrapperLike) {
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
${indent}  }${namedSlotContent}
${indent}</${componentName}>`;
        }

        return `${indent}<${componentName}${formattedProps}>
${indent}  {
${indent}    ${slotName}.map((${singularName}) => (
${childIndent}<${childComponentName}${formattedChildProps}/>
${indent}    ))
${indent}  }${namedSlotContent}
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
        singularName,
        [`data-editable="array-item"`, `data-id="${templateNode._component}"`]
      );

      return `${indent}<${componentName}${formattedProps}>
${indent}  {
${indent}    ${slotName}.map((${singularName}) => (
${templateContent}
${indent}    ))
${indent}  }${namedSlotContent}
${indent}</${componentName}>`;
    }

    // Non-map-pattern children
    const fallbackChildren = block[fallbackProp] as ComponentNode[];
    const originalNested2 = originalNode?.[fallbackProp] as BuilderNode[] | undefined;

    if (fallbackIsDefault) {
      const nestedContent = fallbackChildren
        .map((nested, idx) =>
          formatComponentBlock(
            nested,
            indentLevel + 1,
            metadataMap,
            nestedBlockProperties,
            originalNested2?.[idx] || null,
            rootComponentName,
            components,
            arrayItemContext
          )
        )
        .join("\n");

      return `${indent}<${componentName}${formattedProps}>
${nestedContent}${namedSlotContent}
${indent}</${componentName}>`;
    }

    // Fallback slot has a named Astro slot — wrap children with slot attribute
    if (fallbackChildren.length === 1) {
      const childContent = formatComponentBlock(
        fallbackChildren[0],
        indentLevel + 1,
        metadataMap,
        nestedBlockProperties,
        originalNested2?.[0] || null,
        rootComponentName,
        components,
        arrayItemContext,
        [`slot="${fallbackAstroSlot}"`]
      );

      return `${indent}<${componentName}${formattedProps}>
${childContent}${namedSlotContent}
${indent}</${componentName}>`;
    }

    const fragmentContent = fallbackChildren
      .map((nested, idx) =>
        formatComponentBlock(
          nested,
          indentLevel + 2,
          metadataMap,
          nestedBlockProperties,
          originalNested2?.[idx] || null,
          rootComponentName,
          components,
          arrayItemContext
        )
      )
      .join("\n");

    return `${indent}<${componentName}${formattedProps}>
${indent}  <Fragment slot="${fallbackAstroSlot}">
${fragmentContent}
${indent}  </Fragment>${namedSlotContent}
${indent}</${componentName}>`;
  }

  // No fallback slot children — maybe only named slot content
  if (namedSlotContent) {
    return `${indent}<${componentName}${formattedProps}>${namedSlotContent}
${indent}</${componentName}>`;
  }

  return sortedPropsList.length > 0
    ? `${indent}<${componentName}${formattedProps}/>`
    : `${indent}<${componentName} />`;
}
