import MarkdownIt from "markdown-it";
import pkg from "js-beautify";
import type { ComponentMetadata } from "../../../shared/metadata";
import { getComponentDisplayName } from "./componentUtils";
const { html } = pkg;

export function formatComponentWithSlots(
  block: any,
  indentLevel: number = 0,
  componentMetadata?: Map<string, ComponentMetadata>,
  nestedBlockProperties?: Set<string>
): string {
  const componentPath = block._component;
  const componentName = getComponentDisplayName(componentPath);
  const props = { ...block };
  const indent = "  ".repeat(indentLevel);

  delete props._component;

  const componentSlug = componentPath
    .replace(/^blocks\//, "")
    .replace(/^elements\//, "")
    .replace(/^forms\//, "")
    .replace(/^navigation\//, "")
    .replace(/^typography\//, "")
    .replace(/^wrappers\//, "");
  let metadata = componentMetadata?.get(componentSlug);

  if (!metadata) {
    metadata = componentMetadata?.get(componentPath);
  }
  const supportsSlots = metadata?.supportsSlots ?? false;

  const isTextComponent =
    componentPath.includes("heading") ||
    componentPath.includes("text") ||
    componentPath.includes("simple-text") ||
    componentPath.includes("list-item") ||
    componentPath.includes("definition-list-item") ||
    componentPath.includes("testimonial") ||
    componentPath.includes("button") ||
    componentPath.includes("submit");

  const textContent = isTextComponent ? props.text : null;

  if (textContent) {
    delete props.text;
  }

  if (supportsSlots) {
    if (nestedBlockProperties) {
      for (const prop of nestedBlockProperties) {
        if (props[prop] !== undefined) {
          delete props[prop];
        }
      }
    }
    delete props.contentSections;
    delete props.navBlocks;
    delete props.formBlocks;
    delete props.firstColumnContentSections;
    delete props.secondColumnContentSections;
    delete props.buttonSections;
    delete props.slides;
  } else if (componentPath.includes("split")) {
    delete props.firstColumnContentSections;
    delete props.secondColumnContentSections;
  } else if (componentPath.includes("form")) {
    delete props.formBlocks;
  }

  // If formBlocks exists, we'll handle it as slot content, so remove it from props
  if (block.formBlocks) {
    delete props.formBlocks;
  }

  // Don't delete items for content-selector as it uses the prop internally
  if (!componentPath.includes("content-selector")) {
    delete props.items;
  }
  if (!componentPath.includes("choice-group") && !componentPath.includes("segments")) {
    delete props.options;
  }

  let propsString = Object.entries(props)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`;
      } else if (typeof value === "boolean") {
        return value ? key : "";
      } else if (typeof value === "number") {
        return `${key}={${value}}`;
      } else if (Array.isArray(value)) {
        const formattedArray = JSON.stringify(value, null, 2)
          .split("\n")
          .map((line, index) => (index === 0 ? line : `${indent}  ${line}`))
          .join("\n");

        return `${key}={\n${indent}  ${formattedArray}\n${indent}}`;
      } else if (typeof value === "object" && value !== null) {
        return `${key}={${JSON.stringify(value)}}`;
      }
      return `${key}="${String(value)}"`;
    })
    .filter(Boolean)
    .join(" ");

  const items = block.items;

  const nestedBlocks =
    block.contentSections || block.navBlocks || block.formBlocks || block.buttonSections;

  if (nestedBlocks && supportsSlots) {
    propsString = Object.entries(props)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key}="${value}"`;
        } else if (typeof value === "boolean") {
          return value ? key : "";
        } else if (typeof value === "number") {
          return `${key}={${value}}`;
        } else if (Array.isArray(value)) {
          const formattedArray = JSON.stringify(value, null, 2)
            .split("\n")
            .map((line, index) => (index === 0 ? line : `${indent}  ${line}`))
            .join("\n");

          return `${key}={\n${indent}  ${formattedArray}\n${indent}}`;
        } else if (typeof value === "object" && value !== null) {
          return `${key}={${JSON.stringify(value)}}`;
        }
        return `${key}="${String(value)}"`;
      })
      .filter(Boolean)
      .join(" ");
    const blocksArray = Array.isArray(nestedBlocks) ? nestedBlocks : [nestedBlocks];
    const nestedContent = blocksArray
      .map((nestedBlock) =>
        formatComponentWithSlots(
          nestedBlock,
          indentLevel + 1,
          componentMetadata,
          nestedBlockProperties
        )
      )
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${nestedContent}
${indent}</${componentName}>`;
  } else if (block.formBlocks) {
    // Handle formBlocks as slot content - render as Form with child components
    const formAction = block.formAction || "./";
    const formBlocksArray = Array.isArray(block.formBlocks) ? block.formBlocks : [block.formBlocks];
    const FormComponentName = getComponentDisplayName("building-blocks/forms/form");

    const formChildren = formBlocksArray
      .map((formBlock) =>
        formatComponentWithSlots(
          formBlock,
          indentLevel + 2,
          componentMetadata,
          nestedBlockProperties
        )
      )
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${indent}  <${FormComponentName} action="${formAction}">
${formChildren}
${indent}  </${FormComponentName}>
${indent}</${componentName}>`;
  } else if (
    componentPath.includes("split") &&
    (block.firstColumnContentSections || block.secondColumnContentSections)
  ) {
    const firstContent = block.firstColumnContentSections
      ? (Array.isArray(block.firstColumnContentSections)
          ? block.firstColumnContentSections
          : [block.firstColumnContentSections]
        )
          .map((nestedBlock) =>
            formatComponentWithSlots(
              nestedBlock,
              indentLevel + 2,
              componentMetadata,
              nestedBlockProperties
            )
          )
          .join("\n")
      : "";

    const secondContent = block.secondColumnContentSections
      ? (Array.isArray(block.secondColumnContentSections)
          ? block.secondColumnContentSections
          : [block.secondColumnContentSections]
        )
          .map((nestedBlock) =>
            formatComponentWithSlots(
              nestedBlock,
              indentLevel + 2,
              componentMetadata,
              nestedBlockProperties
            )
          )
          .join("\n")
      : "";

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${
  firstContent
    ? `${indent}  <Fragment slot="first">
${firstContent}
${indent}  </Fragment>`
    : ""
}${firstContent && secondContent ? "\n" : ""}${
      secondContent
        ? `${indent}  <Fragment slot="second">
${secondContent}
${indent}  </Fragment>`
        : ""
    }
${indent}</${componentName}>`;
  } else if (items && componentPath.includes("list")) {
    // Handle list items as slot content
    const itemsArray = Array.isArray(items) ? items : [items];
    const isDefinitionList = componentPath.includes("definition-list");
    const itemComponentName = isDefinitionList ? "DefinitionListItem" : "ListItem";

    const itemsContent = itemsArray
      .map((item) => {
        const itemProps = { ...item };

        delete itemProps.text; // Remove text from props since it goes in the slot
        if (isDefinitionList) {
          delete itemProps.title; // Remove title from props for definition lists
        }

        const itemPropsString = Object.entries(itemProps)
          .sort(([a], [b]) => a.localeCompare(b)) // Sort attributes alphabetically
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        const itemText = item.text
          ? new MarkdownIt()
              .renderInline(item.text)
              .trim()
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
          : "";

        if (isDefinitionList) {
          // For definition lists, use title prop and text in slot
          const titleProp = item.title ? ` title="${item.title}"` : "";

          return `${indent}  <${itemComponentName}${titleProp}${itemPropsString ? ` ${itemPropsString}` : ""}>${itemText}</${itemComponentName}>`;
        } else {
          return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>${itemText}</${itemComponentName}>`;
        }
      })
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (items && componentPath.includes("content-selector")) {
    // Handle content selector items as slot content
    const itemsArray = Array.isArray(items) ? items : [items];
    const itemComponentName = "ContentSelectorPanel";
    const containerProps = { ...props };

    delete containerProps.items;

    const containerPropsString = Object.entries(containerProps)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key}="${value}"`;
        } else if (typeof value === "boolean") {
          return value ? key : "";
        } else if (typeof value === "number") {
          return `${key}={${value}}`;
        } else if (Array.isArray(value)) {
          const formattedArray = JSON.stringify(value, null, 2)
            .split("\n")
            .map((line, index) => (index === 0 ? line : `${indent}  ${line}`))
            .join("\n");

          return `${key}={\n${indent}  ${formattedArray}\n${indent}}`;
        } else if (typeof value === "object" && value !== null) {
          return `${key}={${JSON.stringify(value)}}`;
        }
        return `${key}="${String(value)}"`;
      })
      .filter(Boolean)
      .join(" ");

    const itemsContent = itemsArray
      .map((item) => {
        const itemProps = { ...item };

        delete itemProps._component;
        delete itemProps.contentSections;

        const itemPropsString = Object.entries(itemProps)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        const itemContent = item.contentSections
          ? (Array.isArray(item.contentSections) ? item.contentSections : [item.contentSections])
              .map((nestedBlock) =>
                formatComponentWithSlots(
                  nestedBlock,
                  indentLevel + 2,
                  componentMetadata,
                  nestedBlockProperties
                )
              )
              .join("\n")
          : "";

        return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${itemContent}
${indent}  </${itemComponentName}>`;
      })
      .join("\n");

    return `${indent}<${componentName}${containerPropsString ? ` ${containerPropsString}` : ""}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (metadata?.childComponent && metadata?.fallbackFor && block[metadata.fallbackFor]) {
    const fallbackItems = block[metadata.fallbackFor];
    const itemsArray = Array.isArray(fallbackItems) ? fallbackItems : [fallbackItems];
    const itemComponentName = metadata.childComponent.name;

    const slotProps = new Set<string>();

    if (metadata.childComponent.props) {
      for (const prop of metadata.childComponent.props) {
        if (prop.endsWith("/slot")) {
          slotProps.add(prop.replace("/slot", ""));
        }
      }
    }

    const itemsContent = itemsArray
      .map((item) => {
        const itemProps = { ...item };

        for (const slotProp of slotProps) {
          delete itemProps[slotProp];
        }

        const itemPropsString = Object.entries(itemProps)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}="${value}"`;
            } else if (typeof value === "boolean") {
              return value ? key : "";
            } else if (typeof value === "number") {
              return `${key}={${value}}`;
            }
            return `${key}="${String(value)}"`;
          })
          .filter(Boolean)
          .join(" ");

        const slotContentParts: string[] = [];

        for (const slotProp of slotProps) {
          if (item[slotProp]) {
            const nestedBlocks = Array.isArray(item[slotProp]) ? item[slotProp] : [item[slotProp]];

            for (const nestedBlock of nestedBlocks) {
              slotContentParts.push(
                formatComponentWithSlots(
                  nestedBlock,
                  indentLevel + 2,
                  componentMetadata,
                  nestedBlockProperties
                )
              );
            }
          }
        }
        const slotContent = slotContentParts.join("\n");

        if (slotContent) {
          return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""}>
${slotContent}
${indent}  </${itemComponentName}>`;
        } else {
          return `${indent}  <${itemComponentName}${itemPropsString ? ` ${itemPropsString}` : ""} />`;
        }
      })
      .join("\n");

    return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${itemsContent}
${indent}</${componentName}>`;
  } else if (textContent) {
    let htmlContent = textContent;

    if (
      componentPath.includes("text") ||
      componentPath.includes("simple-text") ||
      componentPath.includes("heading") ||
      componentPath.includes("list-item") ||
      componentPath.includes("definition-list-item") ||
      componentPath.includes("testimonial") ||
      componentPath.includes("button") ||
      componentPath.includes("submit")
    ) {
      // For text component, use full markdown render
      if (
        componentPath.includes("text") &&
        !componentPath.includes("heading") &&
        !componentPath.includes("simple-text")
      ) {
        htmlContent = new MarkdownIt().render(textContent).trim();
      } else {
        // For simple-text and other text components, use inline markdown
        htmlContent = new MarkdownIt({ html: true }).renderInline(textContent).trim();
      }
    }

    if (
      componentPath.includes("text") &&
      !componentPath.includes("simple-text") &&
      htmlContent.includes("<")
    ) {
      const formattedHtml = html(htmlContent, {
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 1,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: "normal",
        brace_style: "collapse",
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: false,
        wrap_line_length: 0,
        indent_inner_html: true,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false,
      });

      // Add proper indentation to each line
      const indentedLines = formattedHtml
        .split("\n")
        .map((line) => `${indent}  ${line}`)
        .join("\n");

      return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${indentedLines}
${indent}</${componentName}>`;
    } else {
      return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""}>
${indent}  ${htmlContent}
${indent}</${componentName}>`;
    }
  } else {
    // Handle multi-line props formatting
    if (propsString && propsString.includes("\n")) {
      return `${indent}<${componentName}\n${propsString}\n${indent}/>`;
    } else {
      return `${indent}<${componentName}${propsString ? ` ${propsString}` : ""} />`;
    }
  }
}
